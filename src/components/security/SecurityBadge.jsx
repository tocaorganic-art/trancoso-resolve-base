import { Link } from 'react-router-dom';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

export default function SecurityBadge({ twoFaEnabled }) {
  if (twoFaEnabled) {
    return (
      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 border border-green-200 rounded-full px-2.5 py-1 text-xs font-semibold">
        <ShieldCheck className="w-3.5 h-3.5" />
        Conta Protegida
      </span>
    );
  }

  return (
    <Link to="/Seguranca">
      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-2.5 py-1 text-xs font-semibold hover:bg-amber-200 transition-colors cursor-pointer">
        <ShieldAlert className="w-3.5 h-3.5" />
        Ative o 2FA
      </span>
    </Link>
  );
}