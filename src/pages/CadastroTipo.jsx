import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackFirstRegistration } from '@/utils/analytics.js';
import { validatePrestadorForm } from '@/utils/cadastroPrestador.js';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { withTimeout } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Briefcase, Shield, Building2, ChevronRight, Loader2 } from 'lucide-react';
import PortfolioGallery from '@/components/perfil/PortfolioGallery';

const formatCpf = (v) => {
  const d = v.replace(/\D/g, '').substring(0, 11);
  if (d.length > 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
  if (d.length > 6) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;
  if (d.length > 3) return `${d.slice(0,3)}.${d.slice(3)}`;
  return d;
};

const formatCnpj = (v) => {
  const d = v.replace(/\D/g, '').substring(0, 14);
  if (d.length > 12) return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`;
  if (d.length > 8) return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8)}`;
  if (d.length > 5) return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5)}`;
  if (d.length > 2) return `${d.slice(0,2)}.${d.slice(2)}`;
  return d;
};

const ERRO_SALVAR = 'Não foi possível salvar seu cadastro agora. Verifique sua conexão e tente novamente.';

// Mensagem de erro exibida na própria tela, no lugar do alerta nativo do navegador.
const FormError = ({ message }) => (
  message ? (
    <div
      role="alert"
      aria-live="assertive"
      className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-left text-sm font-medium text-red-600 dark:text-red-400"
    >
      {message}
    </div>
  ) : null
);

// step: 'tipo_conta' | 'tipo_pessoa' | 'cliente_perfil' | 'processando'
export default function CadastroTipoPage() {
  const queryClient = useQueryClient();
  const registrationTrackedRef = useRef(false);
  const [step, setStep] = useState('tipo_conta');
  const [autorizouVerificacao, setAutorizouVerificacao] = useState(false);
  const [tipoPessoa, setTipoPessoa] = useState('pf');
  const [cpf, setCpf] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [temPontoFisico, setTemPontoFisico] = useState(false);
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [nomFantasia, setNomeFantasia] = useState('');

  // Cadastro de Cliente PJ (empresa), opcional, com fotos do trabalho/empresa
  const [clienteTipoPessoa, setClienteTipoPessoa] = useState('pf');
  const [clienteCnpj, setClienteCnpj] = useState('');
  const [clienteRazaoSocial, setClienteRazaoSocial] = useState('');
  const [clienteNomeFantasia, setClienteNomeFantasia] = useState('');
  const [clienteFotos, setClienteFotos] = useState([]);
  const [formError, setFormError] = useState('');

  // Ao corrigir qualquer campo, a mensagem de erro anterior some.
  useEffect(() => {
    setFormError('');
  }, [tipoPessoa, cpf, cnpj, nomeCompleto, dataNascimento, autorizouVerificacao, clienteTipoPessoa, clienteCnpj]);

  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const redirectPrestador = async (email, name) => {
    // Cria o trial ANTES do redirect. O fire-and-forget anterior era abortado pela
    // navegação (window.location.replace) e o trial se perdia silenciosamente.
    // Cada chamada tem limite de tempo próprio (withTimeout): em rede lenta o
    // fluxo segue para /MeuPerfilPrestador em vez de travar ou cair no /Dashboard.
    try {
      await withTimeout(base44.functions.invoke('criarTrialPrestador', { user_email: email, user_name: name }));
    } catch {
      localStorage.setItem('trial_pendente', 'true');
    }

    // O cadastro completo acontece em MeuPerfilPrestador. Aqui criamos o registro
    // mínimo, já persistindo CPF/data de nascimento e a autorização LGPD
    // (necessários para a verificação automática de antecedentes).
    const providerData = {
      tipo_pessoa: tipoPessoa,
      full_name: nomeCompleto?.trim() || name?.trim() || '',
      email: email || '',
      // occupation é obrigatório pelo schema do ServiceProvider; sem ele o create
      // falha em silêncio (catch abaixo) e o registro mínimo nunca é persistido.
      // 'Outro' é o valor neutro do enum; a ocupação real é definida no perfil.
      occupation: 'Outro',
      cpf: cpf.replace(/\D/g, ''),
      data_nascimento: dataNascimento,
      autorizou_verificacao: autorizouVerificacao,
    };
    try {
      const providers = await withTimeout(base44.entities.ServiceProvider.filter({ created_by: email }));
      let providerId;
      if (!providers || providers.length === 0) {
        const created = await withTimeout(base44.entities.ServiceProvider.create(providerData));
        providerId = created.id;
      } else {
        providerId = providers[0].id;
        await withTimeout(base44.entities.ServiceProvider.update(providerId, providerData));
      }
      // PII em local seguro (LGPD): espelha CPF e data de nascimento no
      // ServiceProviderPrivate (nome_mae é coletado depois, no perfil).
      try {
        const privateRows = await withTimeout(base44.entities.ServiceProviderPrivate.filter({ service_provider_id: providerId }));
        const privateData = { cpf: providerData.cpf, data_nascimento: dataNascimento };
        if (privateRows?.length) {
          await withTimeout(base44.entities.ServiceProviderPrivate.update(privateRows[0].id, privateData));
        } else {
          await withTimeout(base44.entities.ServiceProviderPrivate.create({ service_provider_id: providerId, ...privateData }));
        }
      } catch (privateError) {
        console.warn('[CadastroTipo] ServiceProviderPrivate não persistido:', privateError);
      }
    } catch (error) {
      // O próprio perfil também consegue criar o registro; não deixe uma
      // falha transitória do upsert bloquear o único formulário do usuário.
      console.warn('[CadastroTipo] Não foi possível preparar o perfil:', error);
    }

    localStorage.setItem('user_type_prestador_pendente', Date.now().toString());
    window.location.replace('/MeuPerfilPrestador');
  };

  const updateUserMutation = useMutation({
    mutationFn: async (userType) => {
      const updated = await withTimeout(base44.auth.updateMe({ user_type: userType }));
      return { updated, userType };
    },
    onSuccess: ({ updated, userType }) => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      const email = updated?.email || user?.email || '';
      const name = updated?.full_name || user?.full_name || '';
      registrationTrackedRef.current = trackFirstRegistration(
        user,
        userType,
        registrationTrackedRef.current,
      );

      if (userType === 'prestador') {
        // Grava flag para PermissionChecker fazer bypass enquanto banco propaga
        localStorage.setItem('user_type_prestador_pendente', Date.now().toString());
        redirectPrestador(email, name);
      } else if (userType === 'lojista') {
        // Lojista: cadastro direto → painel de anúncios
        localStorage.setItem('user_type_lojista_pendente', Date.now().toString());
        window.location.replace('/DashboardLojista');
      } else {
        window.location.replace('/');
      }
    },
    onError: (_error, userType) => {
      // Prestador volta ao formulário com os dados preenchidos; cliente e
      // lojista voltam à escolha do tipo de conta (antes caíam no formulário
      // de prestador por engano).
      setStep(userType === 'prestador' ? 'tipo_pessoa' : 'tipo_conta');
      setFormError(ERRO_SALVAR);
    },
  });

  const handleClienteClick = () => updateUserMutation.mutate('cliente');

  const handleClientePjClick = () => setStep('cliente_perfil');

  const handleClientePjSubmit = async () => {
    if (clienteTipoPessoa === 'pj' && clienteCnpj.replace(/\D/g, '').length < 14) {
      setFormError('Informe um CNPJ válido.');
      return;
    }
    setFormError('');
    setStep('processando');
    if (clienteTipoPessoa === 'pj') {
      try {
        await base44.entities.ClientProfile.create({
          tipo_pessoa: 'pj',
          cnpj: clienteCnpj.replace(/\D/g, ''),
          razao_social: clienteRazaoSocial.trim(),
          nome_fantasia: clienteNomeFantasia.trim(),
          fotos_trabalho_empresa: clienteFotos,
        });
      } catch (error) {
        // Não bloqueia o cadastro por uma falha transitória ao salvar o perfil PJ;
        // o cliente pode completar os dados da empresa depois, em Configurações.
        console.warn('[CadastroTipo] Não foi possível salvar o perfil PJ do cliente:', error);
      }
    }
    updateUserMutation.mutate('cliente');
  };

  const handleLojistaClick = () => updateUserMutation.mutate('lojista');

  // O card "Sou Prestador" abre o formulário de CPF, nome completo e data de
  // nascimento. O tipo de conta só é gravado depois do formulário validado.
  const handlePrestadorClick = () => {
    setFormError('');
    setStep('tipo_pessoa');
  };

  const handlePrestadorSubmit = () => {
    const erro = validatePrestadorForm({
      tipoPessoa,
      cpf,
      nomeCompleto,
      dataNascimento,
      cnpj,
      autorizouVerificacao,
    });
    if (erro) {
      setFormError(erro);
      return;
    }
    setFormError('');
    setStep('processando');
    updateUserMutation.mutate('prestador');
  };

  if (isLoading || step === 'processando' || updateUserMutation.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-orange-400 mx-auto mb-4" />
          <p className="text-foreground font-medium">Configurando sua conta...</p>
          <p className="text-muted-foreground text-sm mt-1">Isso leva apenas alguns segundos.</p>
        </div>
      </div>
    );
  }

  // ─── Step 1: Tipo de conta (cliente ou prestador) ───
  if (step === 'tipo_conta') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key="tipo_conta"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-2xl"
          >
            <Card className="text-center shadow-2xl">
              <CardContent className="p-10">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <h1 className="text-3xl font-bold text-foreground mb-4">
                    {user?.user_type && user.user_type !== 'indefinido' ? 'Alterar tipo de conta' : 'Bem-vindo(a) ao Trancoso Resolve!'}
                  </h1>
                  <p className="text-muted-foreground mb-10 text-lg">Para começar, nos diga como você gostaria de usar a plataforma.</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { icon: User, title: 'Sou Cliente', desc: 'Quero encontrar e contratar os melhores serviços em Trancoso.', action: handleClienteClick, cta: null, secondaryLabel: 'Sou empresa (PJ)', secondaryAction: handleClientePjClick },
                    { icon: Briefcase, title: 'Sou Prestador', desc: 'Quero oferecer meus serviços na plataforma.', action: handlePrestadorClick, cta: 'Continuar' },
                    { icon: Building2, title: 'Sou Lojista', desc: 'Quero divulgar minha loja, restaurante ou negócio local com anúncios.', action: handleLojistaClick, cta: null },
                  ].map((opt, i) => (
                    <motion.div
                      key={opt.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.1, duration: 0.45 }}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    >
                      <Card
                        className="border-2 border-border hover:border-orange-500 hover:shadow-xl transition-all cursor-pointer h-full"
                        onClick={opt.action}
                      >
                        <CardContent className="p-8">
                          <motion.div
                            whileHover={{ scale: 1.08, rotate: -3 }}
                            transition={{ type: 'spring', stiffness: 280, damping: 12 }}
                            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-linear-to-br from-orange-400 to-orange-600 shadow-lg"
                          >
                            <opt.icon className="w-8 h-8 text-white" />
                          </motion.div>
                          <h2 className="text-xl font-semibold mb-2 text-foreground">{opt.title}</h2>
                          <p className="text-muted-foreground">{opt.desc}</p>
                          {opt.cta && (
                            <div className="mt-3 flex items-center justify-center gap-1 text-orange-400 text-sm font-medium">
                              {opt.cta} <ChevronRight className="w-4 h-4" />
                            </div>
                          )}
                          {opt.secondaryLabel && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); opt.secondaryAction(); }}
                              className="mt-3 text-xs text-muted-foreground hover:text-orange-400 underline underline-offset-2"
                            >
                              {opt.secondaryLabel}
                            </button>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {updateUserMutation.isPending && <p className="mt-8 text-muted-foreground">Salvando sua escolha...</p>}
                {formError && <div className="mt-8"><FormError message={formError} /></div>}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // ─── Step Cliente: Pessoa Física ou Empresa (PJ) + fotos do trabalho/empresa ───
  if (step === 'cliente_perfil') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          key="cliente_perfil"
          initial={{ opacity: 0, x: 32, scale: 0.97 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-2xl"
        >
          <Card className="shadow-2xl">
            <CardContent className="p-8 md:p-10">
              <button onClick={() => { setFormError(''); setStep('tipo_conta'); }} className="text-sm text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1">
                ← Voltar
              </button>
              <h1 className="text-2xl font-bold text-foreground mb-2">Cadastro de cliente</h1>
              <p className="text-muted-foreground mb-6 text-sm">Se você representa uma empresa, conte um pouco sobre ela e mostre fotos do seu trabalho.</p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setClienteTipoPessoa('pf')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${clienteTipoPessoa === 'pf' ? 'border-orange-500 bg-orange-500/5' : 'border-border'}`}
                >
                  <User className="w-5 h-5 text-orange-400 mb-2" />
                  <span className="block font-semibold text-foreground">Pessoa Física</span>
                </button>
                <button
                  type="button"
                  onClick={() => setClienteTipoPessoa('pj')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${clienteTipoPessoa === 'pj' ? 'border-orange-500 bg-orange-500/5' : 'border-border'}`}
                >
                  <Building2 className="w-5 h-5 text-orange-400 mb-2" />
                  <span className="block font-semibold text-foreground">Empresa (PJ)</span>
                </button>
              </div>

              {clienteTipoPessoa === 'pj' && (
                <div className="space-y-4 mb-6">
                  <div>
                    <Label htmlFor="cliente_cnpj" className="text-foreground">CNPJ <span className="text-destructive">*</span></Label>
                    <Input id="cliente_cnpj" placeholder="00.000.000/0000-00" value={clienteCnpj} onChange={(e) => setClienteCnpj(formatCnpj(e.target.value))} className="bg-background border-border text-foreground placeholder:text-muted-foreground" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-foreground">Razão Social</Label>
                      <Input placeholder="Opcional" value={clienteRazaoSocial} onChange={(e) => setClienteRazaoSocial(e.target.value)} className="bg-background border-border text-foreground placeholder:text-muted-foreground" />
                    </div>
                    <div>
                      <Label className="text-foreground">Nome Fantasia</Label>
                      <Input placeholder="Opcional" value={clienteNomeFantasia} onChange={(e) => setClienteNomeFantasia(e.target.value)} className="bg-background border-border text-foreground placeholder:text-muted-foreground" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-foreground mb-2 block">Fotos do seu trabalho e empresa</Label>
                    <PortfolioGallery images={clienteFotos} onChange={setClienteFotos} />
                  </div>
                </div>
              )}

              {formError && <div className="mb-4"><FormError message={formError} /></div>}

              <Button className="w-full bg-linear-to-r from-orange-500 to-orange-500 hover:from-orange-600 hover:to-orange-600 text-white" onClick={handleClientePjSubmit} disabled={updateUserMutation.isPending}>
                {updateUserMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {clienteTipoPessoa === 'pj' ? 'Concluir cadastro da empresa' : 'Continuar como Pessoa Física'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // ─── Step 2: Tipo de pessoa + dados jurídicos ───
  const isEmpresaComPonto = (tipoPessoa === 'mei' || tipoPessoa === 'pj') && temPontoFisico;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        key="tipo_pessoa"
        initial={{ opacity: 0, x: 32, scale: 0.97 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-2xl"
      >
      <Card className="shadow-2xl">
        <CardContent className="p-8 md:p-10">
          <button onClick={() => { setFormError(''); setStep('tipo_conta'); }} className="text-sm text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1">
            ← Voltar
          </button>
          <h1 className="text-2xl font-bold text-foreground mb-2">Dados do seu cadastro</h1>
          <p className="text-muted-foreground mb-6 text-sm">Essas informações são necessárias para verificação e definição do plano correto.</p>

          <div className="space-y-4">
            <div>
              <Label className="text-foreground">Tipo de pessoa <span className="text-destructive">*</span></Label>
              <Select value={tipoPessoa} onValueChange={setTipoPessoa}>
                <SelectTrigger className="bg-background border-border text-foreground"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="pf">Pessoa Física (CPF)</SelectItem>
                  <SelectItem value="mei">MEI: Microempreendedor Individual</SelectItem>
                  <SelectItem value="pj">Empresa / PJ (CNPJ)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="cpf_cad" className="text-foreground">CPF do responsável <span className="text-destructive">*</span></Label>
              <Input id="cpf_cad" placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(formatCpf(e.target.value))} className="bg-background border-border text-foreground placeholder:text-muted-foreground" />
            </div>

            <div>
              <Label htmlFor="nome_completo_cad" className="text-foreground">Nome completo <span className="text-destructive">*</span></Label>
              <Input id="nome_completo_cad" placeholder="Seu nome completo" value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} className="bg-background border-border text-foreground placeholder:text-muted-foreground" />
            </div>

            <div>
              <Label htmlFor="data_nasc_cad" className="text-foreground">Data de nascimento <span className="text-destructive">*</span></Label>
              <Input id="data_nasc_cad" type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} className="bg-background border-border text-foreground" />
            </div>

            {(tipoPessoa === 'mei' || tipoPessoa === 'pj') && (
              <>
                <div>
                  <Label htmlFor="cnpj_cad" className="text-foreground">CNPJ <span className="text-destructive">*</span></Label>
                  <Input id="cnpj_cad" placeholder="00.000.000/0000-00" value={cnpj} onChange={(e) => setCnpj(formatCnpj(e.target.value))} className="bg-background border-border text-foreground placeholder:text-muted-foreground" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-foreground">Razão Social</Label>
                    <Input placeholder="Opcional" value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} className="bg-background border-border text-foreground placeholder:text-muted-foreground" />
                  </div>
                  <div>
                    <Label className="text-foreground">Nome Fantasia</Label>
                    <Input placeholder="Opcional" value={nomFantasia} onChange={(e) => setNomeFantasia(e.target.value)} className="bg-background border-border text-foreground placeholder:text-muted-foreground" />
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <input type="checkbox" id="ponto_fisico_cad" checked={temPontoFisico} onChange={(e) => setTemPontoFisico(e.target.checked)} className="mt-0.5 accent-orange-400 w-4 h-4 shrink-0" />
                  <label htmlFor="ponto_fisico_cad" className="text-sm text-muted-foreground cursor-pointer">
                    <span className="font-semibold block mb-0.5 text-foreground">Possuo ponto físico em Trancoso</span>
                    Loja, restaurante, pousada, bar, beach club, clínica ou estabelecimento físico.
                  </label>
                </div>
              </>
            )}

            <div className="rounded-xl border border-amber-400/60 bg-amber-500/10 p-4 text-left" role="note">
              <p className="mb-1 text-sm font-extrabold uppercase tracking-wide text-amber-500">
                Atenção: a aprovação depende da conferência dos seus dados
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                O documento enviado (CNH, RG ou passaporte{(tipoPessoa === 'mei' || tipoPessoa === 'pj') ? ', ou CNPJ/certificado MEI' : ''}) deverá estar completo, nítido e pertencer ao titular do cadastro. Nossa equipe irá comparar o nome, CPF{(tipoPessoa === 'mei' || tipoPessoa === 'pj') ? '/CNPJ' : ''} e data de nascimento informados aqui com o documento enviado. Se a imagem estiver ilegível, cortada ou houver divergência, a verificação será recusada e o perfil não receberá o selo de verificado.
              </p>
            </div>

            {/* Aviso de redirecionamento para empresa */}
            {isEmpresaComPonto && (
              <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-start gap-3">
                <Building2 className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">Detectamos que você é uma empresa com ponto físico em Trancoso.</p>
                  <p className="text-xs text-muted-foreground">Para negócios locais (lojas, restaurantes, pousadas, bares, beach clubs, clínicas e similares), o plano correto é o <strong className="text-orange-400">Plano Empresas</strong>, que garante mais visibilidade e recursos específicos para o seu negócio.</p>
                </div>
              </div>
            )}

            {/* LGPD */}
            <div className="p-4 bg-muted border border-border rounded-xl text-left">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={autorizouVerificacao} onChange={(e) => setAutorizouVerificacao(e.target.checked)} className="mt-1 accent-orange-400 w-4 h-4 shrink-0" />
                <span className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground flex items-center gap-1 mb-1">
                    <Shield className="w-3 h-3 text-orange-400" /> Autorização de Verificação (obrigatória)
                  </span>
                  Autorizo a Trancoso Resolve a conferir meu documento, comparar os dados com as informações cadastradas e realizar consultas de antecedentes criminais e, quando aplicável, de CNPJ na Receita Federal, usando meus dados exclusivamente para validação cadastral, em conformidade com a LGPD.
                </span>
              </label>
            </div>

            <FormError message={formError} />

            <Button className="w-full bg-linear-to-r from-orange-500 to-orange-500 hover:from-orange-600 hover:to-orange-600 text-white" onClick={handlePrestadorSubmit} disabled={updateUserMutation.isPending}>
              {updateUserMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {isEmpresaComPonto ? 'Continuar com Plano Empresas' : 'Cadastrar como Prestador'}
            </Button>
          </div>
        </CardContent>
      </Card>
      </motion.div>
    </div>
  );
}