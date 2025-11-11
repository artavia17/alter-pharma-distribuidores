'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { myAccount } from '@/src/infrastructure/services/protected/my-account.services';
import { clearCookies } from '@/src/infrastructure/helpers/cookieHelper';
import { isAuthenticated } from '@/src/infrastructure/helpers/authHelper';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const validateSession = async () => {
      // Primero verificar si hay token
      if (!isAuthenticated()) {
        clearCookies();
        router.push('/auth/sign-in');
        return;
      }

      try {
        // Validar sesión con el backend
        const response = await myAccount();

        if (response.status === 200) {
          setIsAuthorized(true);
        } else {
          // Si no es 200, limpiar y redirigir
          clearCookies();
          router.push('/auth/sign-in');
        }
      } catch (error: unknown) {
        console.error('Error validating session:', error);

        // Si hay error 401 o cualquier error, limpiar y redirigir
        clearCookies();
        router.push('/auth/sign-in');
      } finally {
        setIsValidating(false);
      }
    };

    validateSession();
  }, [router]);

  // Mostrar loading mientras valida
  if (isValidating) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#f9fafb'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e5e7eb',
            borderTopColor: '#5dd9c1',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{
            color: '#6b7280',
            fontSize: '14px',
            margin: 0
          }}>
            Validando sesión...
          </p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Solo renderizar children si está autorizado
  return isAuthorized ? <>{children}</> : null;
}
