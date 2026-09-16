import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

const SECTIONS = [
  {
    title: '1. Aceitação dos Termos',
    paragraphs: [
      'Estes Termos de Uso regulam o acesso e a utilização da plataforma Trancoso Resolve, operada por Toca Experience Inova Simples (I.S.), inscrita no CNPJ sob o nº 68.662.845/0001-86, com sede na R. Alameda Bom Jesus, 7, Trancoso, Porto Seguro/BA, CEP 46.098-000.',
      'Ao criar uma conta, navegar ou utilizar qualquer funcionalidade da plataforma, você declara ter lido, compreendido e aceitado integralmente estes Termos de Uso, a Política de Privacidade e a Política de Devoluções. Caso não concorde com qualquer disposição, você não deve utilizar a plataforma.'
    ]
  },
  {
    title: '2. Descrição do Serviço',
    paragraphs: [
      'O Trancoso Resolve é uma plataforma digital que conecta clientes a prestadores de serviços autônomos e estabelecimentos na região da Costa do Descobrimento (Trancoso, Arraial d\'Ajuda, Porto Seguro e Caraíva), nas categorias de limpeza, manutenção, construção, culinária, jardinagem, cuidados e outros serviços locais.',
      'A plataforma fornece ferramentas de busca, perfil, agendamento, avaliação e comunicação. A plataforma NÃO é empregadora, sócia, agente ou representante dos prestadores, e não é parte no contrato de prestação de serviços firmado entre cliente e prestador.'
    ]
  },
  {
    title: '3. Cadastro e Conta',
    paragraphs: [
      'Para utilizar as funcionalidades da plataforma, é necessário criar uma conta com informações verdadeiras, completas e atualizadas. É necessário ter no mínimo 18 anos.',
      'Você é responsável pela guarda da sua senha e por toda atividade realizada em sua conta. Contas são pessoais e intransferíveis. Na suspeita de acesso não autorizado, notifique imediatamente o suporte.',
      'Prestadores devem ainda fornecer dados de identificação válidos (nome completo, CPF e data de nascimento) e manter seus dados cadastrais e de contato sempre atualizados.'
    ]
  },
  {
    title: '4. Obrigações dos Usuários',
    paragraphs: [
      'Ao utilizar a plataforma, você concorda em: (a) usá-la apenas para fins lícitos; (b) não publicar conteúdo ofensivo, difamatório, discriminatório ou ilegal; (c) não se passar por outra pessoa ou prestar informações falsas; (d) não utilizar mecanismos automatizados (bots, scrapers) sem autorização expressa; (e) respeitar os direitos de propriedade intelectual da plataforma e de terceiros.',
      'O descumprimento destas obrigações pode resultar em suspensão ou exclusão definitiva da conta, sem prejuízo das medidas legais cabíveis.'
    ]
  },
  {
    title: '5. Prestadores de Serviços e Verificação',
    paragraphs: [
      'Os prestadores são profissionais ou estabelecimentos independentes, responsáveis pela qualidade, legalidade, segurança e adequação dos serviços que prestam, bem como por suas obrigações fiscais, previdenciárias e trabalhistas.',
      'A plataforma oferece um processo de verificação que pode incluir validação de documento de identidade e consulta de antecedentes criminais, mediante autorização expressa do prestador (LGPD). O selo "Verificado" atesta a realização dessas checagens em determinado momento e não constitui garantia ilimitada de conduta futura do prestador.',
      'A plataforma pode, a seu critério, recusar, suspender ou remover perfis que descumpram estes Termos ou apresentem risco à comunidade.'
    ]
  },
  {
    title: '6. Contratação, Preços e Pagamentos',
    paragraphs: [
      'Valores, formas de pagamento, prazo e demais condições do serviço são acordados diretamente entre cliente e prestador, salvo quando a contratação ocorrer por funcionalidade própria da plataforma.',
      'Assinaturas dos planos da plataforma (como os planos para prestadores) são cobradas recorrentemente via o processador de pagamentos parceiro. Os preços dos planos são divulgados na página de Planos e podem ser alterados mediante aviso prévio, respeitando os contratos em vigência.',
      'Cobranças efetuadas na plataforma seguem a Política de Devoluções e o direito de arrependimento previsto no Código de Defesa do Consumidor (art. 49), quando aplicável.'
    ]
  },
  {
    title: '7. Cancelamento e Exclusão de Conta',
    paragraphs: [
      'Você pode encerrar sua conta a qualquer momento através do suporte. A exclusão apaga seus dados pessoais conforme a Política de Privacidade e a LGPD, preservando registros cuja guarda seja exigida por lei ou necessária para a defesa de direitos.',
      'Assinaturas ativas devem ser canceladas antes da exclusão da conta para interromper cobranças futuras. O cancelamento de assinatura não gera reembolso proporcional do período já pago, salvo disposição legal ou prevista na Política de Devoluções.'
    ]
  },
  {
    title: '8. Avaliações e Conteúdo do Usuário',
    paragraphs: [
      'Avaliações devem refletir experiências reais. É proibido publicar avaliações falsas, compradas ou escritas com o objetivo de prejudicar terceiros. A plataforma pode remover avaliações que violem esta regra.',
      'Ao enviar fotos, textos ou outros conteúdos à plataforma, você garante ser titular dos direitos sobre eles e concede à plataforma licença gratuita, não exclusiva e worldwide para hospedar, exibir e distribuir esse conteúdo com a finalidade de operar e divulgar a plataforma.'
    ]
  },
  {
    title: '9. Privacidade e Proteção de Dados (LGPD)',
    paragraphs: [
      'O tratamento de dados pessoais segue a Lei nº 13.709/2018 (LGPD) e está detalhado na nossa Política de Privacidade, que integra estes Termos. Você pode exercer seus direitos de titular (acesso, correção, exclusão, portabilidade) a qualquer momento.',
      'Dados de identificação fornecidos para verificação (documento, antecedentes) são utilizados exclusivamente para esse fim, com base legal no consentimento, e não são compartilhados com outros usuários.'
    ]
  },
  {
    title: '10. Propriedade Intelectual',
    paragraphs: [
      'Marcas, logotipos, layouts, textos e demais elementos da plataforma são propriedade da Toca Experience Inova Simples (I.S.) ou de seus licenciantes, protegidos pela legislação de propriedade intelectual. É vedada a reprodução, total ou parcial, sem autorização prévia por escrito.'
    ]
  },
  {
    title: '11. Limitação de Responsabilidade',
    paragraphs: [
      'A plataforma atua como meio de conexão e não acompanha a execução dos serviços contratados. Assim, a plataforma não se responsabiliza por danos decorrentes da execução do serviço pelo prestador, atrasos, descumprimentos ou condutas entre cliente e prestador.',
      'Na máxima extensão permitida pela lei, a responsabilidade total da plataforma em relação a qualquer reclamação ligada a estes Termos é limitada ao valor efetivamente pago por você à plataforma nos 12 (doze) meses anteriores ao evento. Nada aqui exclui responsabilidades que não possam ser legalmente excluídas, inclusive as relativas a dolo ou má-fé.'
    ]
  },
  {
    title: '12. Disponibilidade e Modificações',
    paragraphs: [
      'Buscamos manter a plataforma disponível continuamente, mas não garantimos ininterruptabilidade. Manutenções programadas ou emergenciais podem suspendê-la temporariamente.',
      'Estes Termos podem ser atualizados para refletir novas funcionalidades ou exigências legais. Alterações relevantes serão comunicadas dentro da plataforma ou por e-mail; o uso continuado após a comunicação implica aceitação da nova versão.'
    ]
  },
  {
    title: '13. Legislação e Foro',
    paragraphs: [
      'Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca de Porto Seguro/BA para dirimir quaisquer controvérsias, com renúncia a qualquer outro, por mais privilegiado que seja.'
    ]
  }
];

export default function TermosDeUso() {
  useEffect(() => {
    document.title = 'Termos de Uso - Trancoso Resolve';
    const meta = document.querySelector('meta[name="description"]') ||
      (() => { const m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); return m; })();
    meta.content = 'Termos de Uso da plataforma Trancoso Resolve — regras para clientes e prestadores de serviços na Costa do Descobrimento.';
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" /> Termos de Uso
          </h1>
          <p className="text-muted-foreground mt-3">
            Última atualização: 16 de setembro de 2026
          </p>
        </motion.div>

        <div className="mt-8 space-y-8">
          {SECTIONS.map((section, idx) => (
            <motion.section
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35 }}
              className="space-y-3"
            >
              <h2 className="text-2xl font-bold text-primary">{section.title}</h2>
              {section.paragraphs.map((p, i) => (
                <p key={i} className="text-sm md:text-base leading-relaxed text-foreground/90">{p}</p>
              ))}
            </motion.section>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35 }}
          className="mt-12 border-t border-border pt-8 flex flex-wrap gap-3"
        >
          <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
            <Link to="/PoliticaPrivacidade">Política de Privacidade</Link>
          </Button>
          <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
            <Link to="/PoliticaDevolucoes">Política de Devoluções</Link>
          </Button>
          <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
            <Link to="/TermosDeServico">Termos de Serviço</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}