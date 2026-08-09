import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import TwoFactorVerification from "@/components/auth/TwoFactorVerification";
import { motion } from "framer-motion";

function MicrosoftIcon({ className }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 23" fill="none">
      <rect x="1" y="1" width="10" height="10" fill="#F25022" />
      <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
      <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
      <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
    </svg>
  );
}

function FacebookIcon({ className }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.234 2.686.234v2.953h-1.514c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  );
}

export default function Login() {
  const [twoFAState, setTwoFAState] = useState(null); // null | { maskedEmail }
  const location = useLocation();
  const fromPath = location.state?.from?.pathname || null;

  useEffect(() => {
    document.title = 'Entrar | Trancoso Resolve';
    const desc = 'Acesse sua conta na Trancoso Resolve para contratar ou gerenciar seus serviços em Trancoso, Bahia.';
    let m = document.querySelector('meta[name="description"]');
    if (m) m.content = desc;

    // Check if we just returned from OAuth and user needs 2FA
    checkPostLoginUser();
  }, []);

  const checkPostLoginUser = async () => {
    try {
      const user = await base44.auth.me();
      if (!user) return;

      // Already verified this session
      if (sessionStorage.getItem('2fa_verified') === 'true') {
        redirectAfterLogin(user);
        return;
      }

      // Only require 2FA for prestadores who have it enabled
      if (user.user_type === 'prestador' && user.two_fa_enabled) {
        const res = await base44.functions.invoke('twoFactor', { action: 'send' });
        setTwoFAState({ maskedEmail: res?.data?.maskedEmail || user.email });
        return;
      }

      redirectAfterLogin(user);
    } catch {
      // Not logged in yet, show login buttons
    }
  };

  const redirectAfterLogin = (user) => {
    if (!user) { window.location.href = "/"; return; }
    if (!user.user_type || user.user_type === "indefinido") {
      window.location.href = "/CadastroTipo";
      return;
    }
    if (fromPath && fromPath !== '/login') {
      window.location.href = fromPath;
      return;
    }
    if (user.user_type === "prestador") {
      window.location.href = "/MeuPerfilPrestador";
    } else if (user.user_type === "cliente") {
      window.location.href = "/MeusPedidos";
    } else {
      window.location.href = "/";
    }
  };

  const handleGoogle = () => base44.auth.loginWithProvider("google", "/login");
  const handleMicrosoft = () => base44.auth.loginWithProvider("microsoft", "/login");
  const handleFacebook = () => base44.auth.loginWithProvider("facebook", "/login");

  if (twoFAState) {
    return (
      <TwoFactorVerification
        maskedEmail={twoFAState.maskedEmail}
        onSuccess={async () => {
          const user = await base44.auth.me();
          redirectAfterLogin(user);
        }}
        onCancel={() => {
          base44.auth.logout('/login');
        }}
      />
    );
  }

  return (
    <AuthLayout
      icon={LogIn}
      title="Bem-vindo(a)"
      subtitle="Entre com sua conta para continuar"
      footer={
        <>
          Não tem conta?{" "}
          <a href="/register" className="text-orange-400 font-medium hover:underline">
            Criar conta
          </a>
        </>
      }
    >
      <div className="space-y-3">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.45 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <Button
            className="w-full h-12 text-sm font-medium bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-900/30"
            onClick={() => base44.auth.redirectToLogin('/login')}
          >
            <LogIn className="w-5 h-5 mr-2" />
            Entrar com Email
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="relative my-4"
        >
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#2d1200] px-2 text-white/40">ou continue com</span>
          </div>
        </motion.div>

        {[
          { icon: <GoogleIcon className="w-5 h-5 mr-2" />, label: 'Continuar com Google', onClick: handleGoogle },
          { icon: <MicrosoftIcon className="w-5 h-5 mr-2" />, label: 'Continuar com Microsoft', onClick: handleMicrosoft },
          { icon: <FacebookIcon className="w-5 h-5 mr-2" />, label: 'Continuar com Facebook', onClick: handleFacebook },
        ].map((btn, i) => (
          <motion.div
            key={btn.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 + i * 0.08, duration: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button
              variant="outline"
              className="w-full h-12 text-sm font-medium border-white/20 text-white hover:bg-white/10"
              onClick={btn.onClick}
            >
              {btn.icon}
              {btn.label}
            </Button>
          </motion.div>
        ))}
      </div>
    </AuthLayout>
  );
}