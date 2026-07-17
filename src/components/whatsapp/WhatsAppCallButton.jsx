import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { MessageCircle, Loader2, X } from "lucide-react";
import { chamarPrestador } from "@/functions/chamarPrestador";
import { toast } from "sonner";
import CompletarPerfilModal from "@/components/auth/CompletarPerfilModal";

// Sanitiza número: remove tudo que não é dígito, adiciona 55 se necessário
function sanitizeWhatsApp(number) {
  if (!number) return '';
  const digits = String(number).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('55') && digits.length >= 12) return digits;
  return '55' + digits;
}

function buildWhatsAppLink(number) {
  const clean = sanitizeWhatsApp(number);
  return clean ? `https://wa.me/${clean}` : null;
}

// Modal de contato estabelecido
function ContactModal({ providerName, whatsappPrestador, whatsappCliente, onClose }) {
  const modalRef = useRef(null);
  const linkPrestador = buildWhatsAppLink(whatsappPrestador);

  // Fechar com Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Foco inicial no modal
  useEffect(() => {
    modalRef.current?.focus();
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 outline-none"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 id="modal-title" className="text-lg font-bold text-slate-900">
            Contato estabelecido
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-full"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Número do prestador */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">
              Prestador: {providerName}
            </p>
            <p className="text-base font-bold text-slate-800 mb-3">
              {whatsappPrestador || 'Número não disponível'}
            </p>
            {linkPrestador && (
              <a
                href={linkPrestador}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
                aria-label={`Abrir conversa no WhatsApp com ${providerName}`}
              >
                <MessageCircle className="w-4 h-4" />
                Abrir conversa
              </a>
            )}
          </div>

          {/* Número do cliente */}
          {whatsappCliente && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                Seu número que o prestador verá
              </p>
              <p className="text-base text-slate-700">{whatsappCliente}</p>
            </div>
          )}
        </div>

        <Button
          variant="outline"
          className="w-full mt-5"
          onClick={onClose}
        >
          Fechar
        </Button>
      </div>
    </div>
  );
}

export default function WhatsAppCallButton({ provider, className = "", size = "default" }) {
  const [loading, setLoading] = useState(false);
  const [contactData, setContactData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: user, isSuccess: userLoaded } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  // Verifica assinatura do prestador na renderização
  const { data: subscription, isLoading: checkingSubscription } = useQuery({
    queryKey: ['providerSubscription', provider?.id, provider?.created_by],
    queryFn: async () => {
      if (!provider?.created_by) return null;
      const today = new Date().toISOString().split('T')[0];
      const subs = await base44.entities.Subscription.filter({ user_email: provider.created_by });
      return subs?.find(sub => {
        if (sub.status === 'active') {
          if (sub.next_billing_date && today > sub.next_billing_date) return false;
          return true;
        }
        if (sub.status === 'trial') {
          return sub.trial_end && today <= sub.trial_end;
        }
        return false;
      }) || null;
    },
    enabled: !!provider?.created_by && userLoaded && !!user,
    staleTime: 60000,
  });

  const isProviderActive = !!subscription && (provider?.status_verificacao === 'aprovado' || !provider?.status_verificacao);

  const handleCall = useCallback(async () => {
    if (!user) {
      sessionStorage.setItem('loginTimestamp', Date.now().toString());
      base44.auth.redirectToLogin(window.location.href);
      return;
    }

    // Cliente sem WhatsApp: abre modal de completar perfil
    if (!user.phone || user.phone.replace(/\D/g, '').length < 10) {
      setShowProfileModal(true);
      return;
    }

    // Já contatado nessa sessão — só exibe o modal
    if (contactData) {
      setShowModal(true);
      return;
    }

    setLoading(true);
    try {
      const res = await chamarPrestador({ id_prestador: provider.id });
      const data = res.data;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setContactData(data);
      setShowModal(true);
    } catch (err) {
      const msg = err?.response?.data?.error || 'Ocorreu um problema. Tente novamente em alguns instantes.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [user, contactData, provider]);

  // Usuário não carregou ainda
  if (!userLoaded) return null;

  // Não logado: exibe aviso com link de login
  if (!user) {
    return (
      <p className="text-sm text-slate-500 text-center">
        <button
          onClick={() => { sessionStorage.setItem('loginTimestamp', Date.now().toString()); base44.auth.redirectToLogin(window.location.href); }}
          className="text-blue-600 underline hover:text-blue-800 font-medium"
        >
          Faça login
        </button>{" "}
        para entrar em contato com este prestador.
      </p>
    );
  }

  const isDisabled = !isProviderActive || loading || checkingSubscription;

  return (
    <>
      {showProfileModal && (
        <CompletarPerfilModal
          user={user}
          open={showProfileModal}
          onClose={() => {
            setShowProfileModal(false);
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
          }}
        />
      )}
      <Button
        size={size}
        onClick={handleCall}
        disabled={isDisabled}
        aria-label={`Chamar prestador ${provider?.full_name} no WhatsApp`}
        className={`${
          isProviderActive
            ? 'bg-green-500 hover:bg-green-600 text-white'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
        } ${className}`}
        title={
          provider?.status_verificacao === 'reprovado' ? 'Prestador não verificado' :
          provider?.status_verificacao === 'pendente' || provider?.status_verificacao === 'em_analise_manual' ? 'Prestador em verificação' :
          !isProviderActive ? 'Prestador indisponível no momento' : ''
        }
      >
        {loading || checkingSubscription ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Conectando...</>
        ) : (
          <><MessageCircle className="w-4 h-4 mr-2" />
            {provider?.status_verificacao === 'pendente' || provider?.status_verificacao === 'em_analise_manual'
              ? 'Em verificação'
              : provider?.status_verificacao === 'reprovado'
              ? 'Não disponível'
              : isProviderActive ? 'Chamar no WhatsApp' : 'Prestador indisponível'}
          </>
        )}
      </Button>

      {showModal && contactData && (
        <ContactModal
          providerName={contactData.provider_name || provider?.full_name}
          whatsappPrestador={contactData.whatsapp_prestador}
          whatsappCliente={contactData.whatsapp_cliente}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}