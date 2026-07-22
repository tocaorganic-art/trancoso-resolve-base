import { useState } from 'react';
import { trackClienteCadastro, trackPrestadorCadastro } from '@/utils/analytics.js';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Briefcase, Shield, Building2, ChevronRight, Loader2 } from 'lucide-react';
import { criarTrialPrestador } from '@/functions/criarTrialPrestador';
import { verificarAntecedentes } from '@/functions/verificarAntecedentes';

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

// step: 'tipo_conta' | 'tipo_pessoa' | 'processando'
export default function CadastroTipoPage() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState('tipo_conta');
  const [autorizouVerificacao, setAutorizouVerificacao] = useState(false);
  const [tipoPessoa, setTipoPessoa] = useState('pf');
  const [cpf, setCpf] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [temPontoFisico, setTemPontoFisico] = useState(false);
  const [razaoSocial, setRazaoSocial] = useState('');
  const [nomFantasia, setNomeFantasia] = useState('');

  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const redirectPrestador = async (email, name) => {
    // Fire-and-forget: cria trial em paralelo
    criarTrialPrestador({ user_email: email, user_name: name }).catch(() => {
      localStorage.setItem('trial_pendente', 'true');
    });

    // Fire-and-forget: salva CPF e dispara verificação
    const cpfLimpo = cpf.replace(/\D/g, '');
    base44.entities.ServiceProvider.filter({ created_by: email })
      .then(async (providers) => {
        if (!providers || providers.length === 0) return;
        const providerId = providers[0].id;
        const providerData = {
          tipo_pessoa: tipoPessoa,
          cpf: cpfLimpo,
          ...(cnpj && { cnpj: cnpj.replace(/\D/g, '') }),
          tem_ponto_fisico_em_trancoso: temPontoFisico,
          ...(razaoSocial && { razao_social: razaoSocial }),
          ...(nomFantasia && { nome_fantasia: nomFantasia }),
        };
        await base44.entities.ServiceProvider.update(providerId, providerData);
        verificarAntecedentes({ service_provider_id: providerId }).catch(() => {});
      })
      .catch(() => {});

    // Aguarda o banco propagar o user_type antes de redirecionar (polling com timeout)
    localStorage.setItem('user_type_prestador_pendente', Date.now().toString());
    const maxWait = Date.now() + 15000; // máximo 15s
    while (Date.now() < maxWait) {
      await new Promise(r => setTimeout(r, 1000));
      try {
        const freshUser = await base44.auth.me();
        if (freshUser?.user_type === 'prestador') {
          console.log('[CadastroTipo] user_type propagado, redirecionando...');
          break;
        }
        console.log('[CadastroTipo] Aguardando propagação...', freshUser?.user_type);
      } catch (e) {
        console.warn('[CadastroTipo] Erro ao verificar user_type:', e);
      }
    }
    window.location.replace('/Dashboard');
  };

  const updateUserMutation = useMutation({
    mutationFn: async (userType) => {
      const updated = await base44.auth.updateMe({ user_type: userType });
      return { updated, userType };
    },
    onSuccess: ({ updated, userType }) => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      const email = updated?.email || user?.email || '';
      const name = updated?.full_name || user?.full_name || '';

      if (userType === 'prestador') {
        // Grava flag para PermissionChecker fazer bypass enquanto banco propaga
        localStorage.setItem('user_type_prestador_pendente', Date.now().toString());
        trackPrestadorCadastro();
        redirectPrestador(email, name);
      } else {
        trackClienteCadastro();
        window.location.replace('/');
      }
    },
    onError: () => {
      setStep('tipo_pessoa');
    },
  });

  const handleClienteClick = () => updateUserMutation.mutate('cliente');

  const handlePrestadorSubmit = () => {
    if (!autorizouVerificacao) {
      alert('Autorize a verificação de antecedentes para continuar como prestador.');
      return;
    }
    if (!cpf || cpf.replace(/\D/g,'').length < 11) {
      alert('Informe um CPF válido.');
      return;
    }
    if ((tipoPessoa === 'mei' || tipoPessoa === 'pj') && cnpj.replace(/\D/g,'').length < 14) {
      alert('Informe um CNPJ válido.');
      return;
    }
    setStep('processando');
    updateUserMutation.mutate('prestador');

    // Timeout de segurança: se travar por mais de 12s, força o redirect
    setTimeout(() => {
      window.location.replace('/Dashboard');
    }, 12000);
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
        <Card className="w-full max-w-2xl text-center shadow-2xl">
          <CardContent className="p-10">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              {user?.user_type && user.user_type !== 'indefinido' ? 'Alterar tipo de conta' : 'Bem-vindo(a) ao Trancoso Resolve!'}
            </h1>
            <p className="text-muted-foreground mb-10 text-lg">Para começar, nos diga como você gostaria de usar a plataforma.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card
                className="border-2 border-border hover:border-orange-500 hover:shadow-lg transition-all cursor-pointer"
                onClick={handleClienteClick}
              >
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-gradient-to-br from-orange-400 to-orange-500">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2 text-foreground">Sou Cliente</h2>
                  <p className="text-muted-foreground">Quero encontrar e contratar os melhores serviços em Trancoso.</p>
                </CardContent>
              </Card>

              <Card
                className="border-2 border-border hover:border-orange-500 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => setStep('tipo_pessoa')}
              >
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-gradient-to-br from-orange-400 to-orange-500">
                    <Briefcase className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2 text-foreground">Sou Prestador / Empresa</h2>
                  <p className="text-muted-foreground">Quero oferecer serviços ou cadastrar meu negócio em Trancoso.</p>
                  <div className="mt-3 flex items-center justify-center gap-1 text-orange-400 text-sm font-medium">
                    Continuar <ChevronRight className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {updateUserMutation.isPending && <p className="mt-8 text-muted-foreground">Salvando sua escolha...</p>}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Step 2: Tipo de pessoa + dados jurídicos ───
  const isEmpresaComPonto = (tipoPessoa === 'mei' || tipoPessoa === 'pj') && temPontoFisico;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardContent className="p-8 md:p-10">
          <button onClick={() => setStep('tipo_conta')} className="text-sm text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1">
            ← Voltar
          </button>
          <h1 className="text-2xl font-bold text-foreground mb-2">Dados do seu cadastro</h1>
          <p className="text-muted-foreground mb-6 text-sm">Essas informações são necessárias para verificação e definição do plano correto.</p>

          <div className="space-y-4">
            <div>
              <Label className="text-foreground">Tipo de pessoa <span className="text-red-400">*</span></Label>
              <Select value={tipoPessoa} onValueChange={setTipoPessoa}>
                <SelectTrigger className="bg-background border-border text-foreground"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="pf">Pessoa Física (CPF)</SelectItem>
                  <SelectItem value="mei">MEI – Microempreendedor Individual</SelectItem>
                  <SelectItem value="pj">Empresa / PJ (CNPJ)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="cpf_cad" className="text-foreground">CPF do responsável <span className="text-red-400">*</span></Label>
              <Input id="cpf_cad" placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(formatCpf(e.target.value))} className="bg-background border-border text-foreground placeholder:text-muted-foreground" />
            </div>

            {(tipoPessoa === 'mei' || tipoPessoa === 'pj') && (
              <>
                <div>
                  <Label htmlFor="cnpj_cad" className="text-foreground">CNPJ <span className="text-red-400">*</span></Label>
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

            {/* Aviso de redirecionamento para empresa */}
            {isEmpresaComPonto && (
              <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-start gap-3">
                <Building2 className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">Detectamos que você é uma empresa com ponto físico em Trancoso.</p>
                  <p className="text-xs text-muted-foreground">Para negócios locais — lojas, restaurantes, pousadas, bares, beach clubs, clínicas e similares — o plano correto é o <strong className="text-orange-400">Plano Empresas</strong>, que garante mais visibilidade e recursos específicos para o seu negócio.</p>
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
                  Autorizo a Trancoso Resolve a realizar consultas de antecedentes criminais e, quando aplicável, verificação de CNPJ na Receita Federal, usando meus dados exclusivamente para fins de validação cadastral, em conformidade com a LGPD.
                </span>
              </label>
            </div>

            <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-500 hover:from-orange-600 hover:to-orange-600 text-white" onClick={handlePrestadorSubmit} disabled={updateUserMutation.isPending}>
              {updateUserMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {isEmpresaComPonto ? 'Continuar com Plano Empresas' : 'Cadastrar como Prestador'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}