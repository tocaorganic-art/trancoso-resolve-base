import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

const DefaultFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
  </div>
);

const AdminOnlyNotice = () => (
  <div className="min-h-screen flex items-center justify-center px-4">
    <Card className="w-full max-w-md border-amber-200">
      <CardContent className="p-8 text-center">
        <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Acesso Restrito</h2>
        <p className="text-muted-foreground mb-6">Esta página é exclusiva para administradores da plataforma.</p>
        <Button onClick={() => window.location.href = '/'} className="w-full">Ir para Início</Button>
      </CardContent>
    </Card>
  </div>
);

export default function ProtectedRoute({ fallback = <DefaultFallback />, unauthenticatedElement, requireAdmin = false }) {
  const { isAuthenticated, isLoadingAuth, authError, user } = useAuth();
  const location = useLocation();

  if (isLoadingAuth) {
    return fallback;
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
    return unauthenticatedElement ?? <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAuthenticated) {
    return unauthenticatedElement ?? <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <AdminOnlyNotice />;
  }

  return <Outlet />;
}
