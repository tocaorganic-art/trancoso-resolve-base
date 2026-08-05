import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Lock, Loader2, AlertTriangle } from "lucide-react";
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

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("As senhas não correspondem");
      return;
    }
    setLoading(true);
    try {
      await base44.auth.resetPassword({ resetToken, newPassword });
      window.location.href = "/login";
    } catch (err) {
      setError(err.message || "Falha ao redefinir senha");
    } finally {
      setLoading(false);
    }
  };

  if (!resetToken) {
    return (
      <AuthLayout
        icon={AlertTriangle}
        title="Link inválido"
        subtitle="Este link de redefinição está ausente ou inválido"
        footer={
          <Link to="/forgot-password" className="text-orange-400 font-medium hover:underline">
            Solicitar novo link
          </Link>
        }
      >
        <p className="text-sm text-white/80 text-center">
          O link parece estar incompleto. Solicite um novo e-mail de redefinição de senha.
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={Lock}
      title="Nova senha"
      subtitle="Digite sua nova senha abaixo"
    >
      <AnimatePresence>
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="mb-4 p-3 rounded-lg bg-red-500/10 text-red-400 text-sm border border-red-500/20"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FloatingInput
          id="password"
          label="Nova senha"
          type="password"
          autoComplete="new-password"
          autoFocus
          placeholder="••••••••"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <FloatingInput
          id="confirm"
          label="Confirmar senha"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <Button type="submit" className="w-full h-12 font-medium bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-900/30" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Redefinindo...
              </>
            ) : (
              "Redefinir senha"
            )}
          </Button>
        </motion.div>
      </form>
    </AuthLayout>
  );
}