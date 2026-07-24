import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Briefcase, Calendar, ArrowRight, X, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function GettingStartedGuide({ onDismiss }) {
  const steps = [
    {
      icon: <User className="w-6 h-6 text-orange-400" />,
      gradient: 'from-orange-500/20 to-orange-600/10',
      border: 'border-orange-500/20',
      title: "1. Complete seu Perfil",
      description: "Um perfil completo com foto, biografia e especialidades aumenta sua credibilidade e atrai mais clientes.",
      link: createPageUrl('MeuPerfilPrestador'),
      cta: "Ir para Perfil"
    },
    {
      icon: <Briefcase className="w-6 h-6 text-orange-300" />,
      gradient: 'from-orange-400/20 to-amber-500/10',
      border: 'border-orange-400/20',
      title: "2. Adicione Seus Serviços",
      description: "Liste os serviços que você oferece, com descrições claras e preços, para que os clientes saibam o que esperar.",
      link: createPageUrl('MeusServicos'),
      cta: "Adicionar Serviços"
    },
    {
      icon: <Calendar className="w-6 h-6 text-amber-400" />,
      gradient: 'from-amber-500/20 to-orange-400/10',
      border: 'border-amber-400/20',
      title: "3. Configure sua Agenda",
      description: "Defina seus horários de trabalho para que os clientes possam solicitar agendamentos com você.",
      link: createPageUrl('MinhaAgenda'),
      cta: "Ver Agenda"
    }
  ];

  return (
    <Card
      className="mb-8 relative border"
      style={{
        background: 'rgba(232, 87, 26, 0.05)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(232, 87, 26, 0.15)',
        borderRadius: 20,
      }}
    >
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 text-muted-foreground hover:bg-muted"
          onClick={onDismiss}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Bem-vindo(a) ao seu Painel!</h3>
        </div>
        <p className="text-muted-foreground mb-6 ml-12">Siga estes passos para configurar sua conta e começar a receber solicitações.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((step, index) => (
            <Card
              key={index}
              style={{
                background: `linear-gradient(135deg, rgba(232, 87, 26, 0.08), rgba(232, 87, 26, 0.04))`,
                border: '1px solid rgba(232, 87, 26, 0.15)',
                borderRadius: 16,
              }}
            >
              <CardContent className="p-5 flex flex-col items-center text-center">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    background: 'linear-gradient(135deg, rgba(232, 87, 26, 0.2), rgba(193, 68, 14, 0.1))',
                    border: '1px solid rgba(232, 87, 26, 0.2)'
                  }}
                >
                  {step.icon}
                </div>
                <h4 className="font-semibold text-sm text-foreground mb-2">{step.title}</h4>
                <p className="text-xs text-muted-foreground mb-4 flex-grow leading-relaxed">{step.description}</p>
                <Link to={step.link} className="w-full">
                  <Button size="sm" className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-sm">
                    {step.cta} <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}