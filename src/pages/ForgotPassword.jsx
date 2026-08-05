import { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AuthLayout from "@/components/AuthLayout";

function FloatingInput({ id, label, type = 'text', value, onChange, ...props }) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || !!value;
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="peer w-full pt-5 pb-2 px-3 bg-white/8 border border-white/20 rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
        {...props}
      />
      <label
        htmlFor={id}
        className="absolute left-3 text-white/60 pointer-events-none transition-all duration-200"
        style={{
          top: lifted ? '6px' : '50%',
          transform: lifted ? 'none' : 'translateY(-50%)',
          fontSize: lifted ? '10px' : '14px',
        }}
      >
        {label}
      </label>
    </div>
  );
}

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await base44.auth.resetPasswordRequest(email);
    } catch {
      // Always show success regardless
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <AuthLayout
      icon={Mail}
      title="Redefinir senha"
      subtitle="Enviaremos um link para redefinir"
      footer={
        <Link to="/login" className="text-orange-400 font-medium hover:underline">
          <ArrowLeft className="w-3 h-3 inline mr-1" />Voltar para entrar
        </Link>
      }
    >
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 14 }}
            className="text-center py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 250, damping: 12, delay: 0.1 }}
              className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="w-8 h-8 text-green-400" />
            </motion.div>
            <p className="text-sm text-white/80">
              Se houver uma conta com esse e-mail, você receberá um link de redefinição em breve.
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <FloatingInput
              id="email"
              label="Endereço de e-mail"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Button type="submit" className="w-full h-12 font-medium bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-900/30" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar link de redefinição"
                )}
              </Button>
            </motion.div>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}