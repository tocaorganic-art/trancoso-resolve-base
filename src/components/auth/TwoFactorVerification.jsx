import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Loader2, RefreshCw } from 'lucide-react';

export default function TwoFactorVerification({ maskedEmail, onSuccess, onCancel }) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [status, setStatus] = useState('idle'); // idle | loading | error | success
  const [errorMsg, setErrorMsg] = useState('');
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resendLoading, setResendLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const handleChange = (idx, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newCode = [...code];
    newCode[idx] = digit;
    setCode(newCode);
    if (digit && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) return;
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await base44.functions.invoke('twoFactor', { action: 'verify', code: fullCode });
      if (res?.data?.success) {
        setStatus('success');
        sessionStorage.setItem('2fa_verified', 'true');
        onSuccess();
      } else {
        setErrorMsg(res?.data?.error || 'Código inválido.');
        setStatus('error');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setErrorMsg('Erro ao verificar. Tente novamente.');
      setStatus('error');
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await base44.functions.invoke('twoFactor', { action: 'send' });
      setResendCooldown(60);
      setCode(['', '', '', '', '', '']);
      setErrorMsg('');
      inputRefs.current[0]?.focus();
    } catch {
      setErrorMsg('Erro ao reenviar. Tente novamente.');
    } finally {
      setResendLoading(false);
    }
  };

  const fullCode = code.join('');

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-amber-700" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Verificação de segurança</h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            Enviamos um código de 6 dígitos para <strong className="text-slate-700">{maskedEmail}</strong>. Válido por 10 minutos.
          </p>
        </div>

        {/* Code inputs */}
        <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
          {code.map((digit, idx) => (
            <input
              key={idx}
              ref={el => inputRefs.current[idx] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(idx, e.target.value)}
              onKeyDown={e => handleKeyDown(idx, e)}
              className="w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl focus:outline-none focus:border-amber-500 bg-slate-50 text-slate-900 transition-colors"
              style={{ borderColor: digit ? '#b45309' : undefined }}
            />
          ))}
        </div>

        {errorMsg && (
          <p className="text-red-600 text-sm text-center mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            {errorMsg}
          </p>
        )}

        <Button
          onClick={handleVerify}
          disabled={fullCode.length !== 6 || status === 'loading'}
          className="w-full bg-amber-700 hover:bg-amber-800 text-white font-bold text-base h-12 mb-4"
        >
          {status === 'loading' ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verificando...</>
          ) : 'Verificar'}
        </Button>

        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handleResend}
            disabled={resendCooldown > 0 || resendLoading}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {resendCooldown > 0
              ? `Reenviar código em ${resendCooldown}s`
              : resendLoading ? 'Enviando...' : 'Reenviar código'
            }
          </button>
          <button
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            ← Voltar para o início
          </button>
        </div>
      </div>
    </div>
  );
}