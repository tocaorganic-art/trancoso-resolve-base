import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, LogOut } from 'lucide-react';

const ADMIN_WHITELIST = ['tocaorganic@gmail.com'];

const MAX_RETRIES = 10;
const RETRY_INTERVAL_MS = 1000;
const TIMEOUT_MS = 30000; // 30s total máximo

export default function PermissionChecker({ children, requiredRole = null, requiredUserType = null }) {
  const [permissionStatus, setPermissionStatus] = useState('checking');
  const [errorDetails, setErrorDetails] = useState(null);
  const retryCountRef = useRef(0);
  const timedOutRef = useRef(false);
  const timerRef = useRef(null);

  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: 1,
    retryDelay: 500,
    staleTime: 0,
  });

  // Timeout global: só dispara se ainda estiver em 'checking' (nunca se já foi autorizado)
  useEffect(() => {
    const timeout = setTimeout(() => {
      timedOutRef.current = true;
      // Só mostra timeout se ainda não foi autorizado
      if (permissionStatus === 'checking') {
        localStorage.removeItem('user_type_prestador_pendente');
        setPermissionStatus('timeout');
      }
    }, TIMEOUT_MS);
    // Cancela o timeout se o status mudar para 'authorized' antes do prazo
    if (permissionStatus === 'authorized') {
      clearTimeout(timeout);
    }
    return () => clearTimeout(timeout);
  }, [permissionStatus]);

  useEffect(() => {
    // Limpa retry timer anterior
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (timedOutRef.current) return;
    if (isLoading) {
      setPermissionStatus('checking');
      return;
    }

    if (error) {
      setPermissionStatus('error');
      setErrorDetails({ message: error.message });
      return;
    }

    if (!user) {
      setPermissionStatus('unauthorized');
      return;
    }

    // Verificar role (whitelist de emails admin sempre passa)
    const isAdminByEmail = ADMIN_WHITELIST.includes(user.email);
    if (requiredRole && user.role !== requiredRole && !isAdminByEmail) {
      setPermissionStatus('forbidden');
      setErrorDetails({
        code: 'INSUFFICIENT_ROLE',
        details: `Esta página requer perfil "${requiredRole}". Seu perfil: "${user.role || 'indefinido'}"`,
      });
      return;
    }

    // Verificar user_type
    if (requiredUserType) {
      if (user.user_type === requiredUserType) {
        // Correto! Limpa flags e autoriza
        localStorage.removeItem('user_type_prestador_pendente');
        setPermissionStatus('authorized');
        return;
      }

      const userTypeUndefined = !user.user_type || user.user_type === 'indefinido';
      const cadastroTs = localStorage.getItem('user_type_prestador_pendente');
      const cadastroRecente = cadastroTs && (Date.now() - parseInt(cadastroTs)) < 30000;

      // Se cadastro recente OU user_type indefinido: tenta até MAX_RETRIES
      if ((cadastroRecente || userTypeUndefined) && retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current += 1;
        setPermissionStatus('checking');
        timerRef.current = setTimeout(() => {
          refetch();
        }, RETRY_INTERVAL_MS);
        return;
      }

      // Esgotou tentativas com cadastro recente → deixa passar (benefício da dúvida)
      if (cadastroRecente) {
        localStorage.removeItem('user_type_prestador_pendente');
        setPermissionStatus('authorized');
        return;
      }

      // user_type indefinido após retries → cadastro incompleto
      if (userTypeUndefined) {
        setPermissionStatus('needs_setup');
        return;
      }

      // user_type definido mas errado (ex: cliente tentando acessar área de prestador)
      setPermissionStatus('forbidden');
      setErrorDetails({
        code: 'INSUFFICIENT_USER_TYPE',
        details: `Esta página é exclusiva para prestadores de serviço.`,
      });
      return;
    }

    // Sem requiredUserType: verifica se precisa fazer setup
    const userTypeUndefined = !user.user_type || user.user_type === 'indefinido';
    if (userTypeUndefined && window.location.pathname !== '/CadastroTipo') {
      setPermissionStatus('needs_setup');
      return;
    }

    setPermissionStatus('authorized');
  }, [user, isLoading, error, requiredRole, requiredUserType]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timedOutRef.current = true;
    };
  }, []);

  if (permissionStatus === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-sand/30">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <RefreshCw className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Verificando acesso...</h2>
            <p className="text-slate-600">Aguarde enquanto validamos suas credenciais.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (permissionStatus === 'timeout') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <Card className="w-full max-w-md border-red-200">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Não foi possível carregar seu perfil</h2>
            <p className="text-slate-600 mb-6">
              Tente fazer login novamente. Se o problema persistir, entre em contato com o suporte.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => window.location.href = '/SejaPrestador'}
                className="flex-1"
              >
                Ir para Cadastro
              </Button>
              <Button
                onClick={() => base44.auth.logout()}
                variant="destructive"
                className="flex-1"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Fazer login novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (permissionStatus === 'needs_setup') {
    window.location.href = '/CadastroTipo';
    return null;
  }

  if (permissionStatus === 'unauthorized') {
    base44.auth.redirectToLogin(window.location.pathname);
    return null;
  }

  if (permissionStatus === 'forbidden') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
        <Card className="w-full max-w-md border-amber-200">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Acesso Restrito</h2>
            <p className="text-slate-600 mb-6">{errorDetails?.details}</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => window.location.href = '/'} className="flex-1">
                Ir para Início
              </Button>
              <Button onClick={() => base44.auth.logout()} variant="destructive" className="flex-1">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (permissionStatus === 'error') {
    base44.auth.redirectToLogin(window.location.pathname);
    return null;
  }

  return <>{children}</>;
}