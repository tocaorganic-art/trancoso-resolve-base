import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    try {
      // Timeout de segurança: sem isso, uma rede lenta/instável (comum em
      // celular) deixa o app inteiro preso no spinner para sempre, porque
      // base44.auth.me() nunca resolve nem rejeita e o finally nunca roda.
      const currentUser = await Promise.race([
        base44.auth.me(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('auth_timeout')), 10000)),
      ]);
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (err) {
      // Usuário não logado, token inválido ou timeout de rede - trata como
      // não autenticado para não travar o app público (cadastro/login).
      if (err?.status === 403 && err?.data?.extra_data?.reason === 'user_not_registered') {
        setAuthError({ type: 'user_not_registered', message: 'User not registered' });
      }
      setIsAuthenticated(false);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings: false,
      authError,
      appPublicSettings: null,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};