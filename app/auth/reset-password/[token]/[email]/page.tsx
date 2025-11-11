'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { resetPasswordCreate } from '@/src/infrastructure/services/auth/auth.services';
import styles from './reset-password.module.scss';

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; password_confirmation?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenError, setTokenError] = useState(false);
  const [tokenErrorMessage, setTokenErrorMessage] = useState('');

  const token = params.token as string;
  const email = decodeURIComponent(params.email as string);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validación local de contraseñas
    if (password !== passwordConfirmation) {
      setErrors({
        password_confirmation: 'Las contraseñas no coinciden'
      });
      return;
    }

    // Validación de longitud mínima
    if (password.length < 8) {
      setErrors({
        password: 'La contraseña debe tener al menos 8 caracteres'
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await resetPasswordCreate({
        email,
        token,
        password,
        password_confirmation: passwordConfirmation,
      });

      if (response.status === 200) {
        // Password reseteada exitosamente
        setSuccess(true);

        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          router.push('/auth/sign-in');
        }, 3000);
      }
    } catch (err: unknown) {
      console.error('Error en reset password:', err);

      const status = (err as { response?: { status?: number } }).response?.status;
      const errorData = (err as { response?: { data?: { data?: { password?: string; password_confirmation?: string } } } }).response?.data?.data;
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message;

      // Error 400 - Token inválido o expirado
      if (status === 400) {
        setTokenError(true);
        setTokenErrorMessage(errorMessage || 'El token de restablecimiento es inválido o ya ha sido utilizado.');
      }
      // Error 422 - Errores de validación
      else if (status === 422 && errorData) {
        setErrors(errorData);
      }
      // Otros errores
      else {
        setErrors({
          password: errorMessage || 'Hubo un error al restablecer la contraseña. Intenta nuevamente.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Si hay error de token o no hay token/email
  if (!token || !email || tokenError) {
    return (
      <div className={styles.container}>
        {/* Video Background */}
        <video
          className={styles.videoBackground}
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/videos/background.mp4" type="video/mp4" />
        </video>

        {/* Overlay */}
        <div className={styles.overlay}></div>

        <div className={styles.card}>
          <div className={styles.errorIcon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2"/>
              <path d="M12 8v4M12 16h.01" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className={styles.title}>Enlace Inválido</h1>
          <p className={styles.description}>
            {tokenErrorMessage || 'El enlace de restablecimiento no es válido o ha expirado.'}
          </p>
          <Link href="/auth/forgot-password" className={styles.submitButton}>
            Solicitar nuevo enlace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Video Background */}
      <video
        className={styles.videoBackground}
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/videos/background.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className={styles.overlay}></div>

      {/* Reset Password Card */}
      <div className={styles.card}>
        {!success ? (
          <>
            <h1 className={styles.title}>Restablecer Contraseña</h1>
            <p className={styles.description}>
              Ingresa tu nueva contraseña para <strong>{email}</strong>
            </p>

            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Password Input */}
              <div className={styles.formGroup}>
                <label className={styles.label}>NUEVA CONTRASEÑA</label>
                <div className={styles.passwordWrapper}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                    placeholder="Ingresa tu nueva contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={8}
                  />
                  <button
                    type="button"
                    className={styles.togglePassword}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5C5.63636 5 2 12 2 12C2 12 5.63636 19 12 19C18.3636 19 22 12 22 12C22 12 18.3636 5 12 5Z" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M3 3L21 21M12 5C5.63636 5 2 12 2 12C2 12 3.5 15 6.5 17M12 19C18.3636 19 22 12 22 12C22 12 20.5 9 17.5 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M9.9 9.9C9.33 10.47 9 11.23 9 12C9 13.66 10.34 15 12 15C12.77 15 13.53 14.67 14.1 14.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <span className={styles.errorText}>{errors.password}</span>
                )}
              </div>

              {/* Password Confirmation Input */}
              <div className={styles.formGroup}>
                <label className={styles.label}>CONFIRMAR CONTRASEÑA</label>
                <div className={styles.passwordWrapper}>
                  <input
                    type={showPasswordConfirmation ? 'text' : 'password'}
                    className={`${styles.input} ${errors.password_confirmation ? styles.inputError : ''}`}
                    placeholder="Confirma tu nueva contraseña"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={8}
                  />
                  <button
                    type="button"
                    className={styles.togglePassword}
                    onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                    aria-label={showPasswordConfirmation ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    disabled={isLoading}
                  >
                    {showPasswordConfirmation ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5C5.63636 5 2 12 2 12C2 12 5.63636 19 12 19C18.3636 19 22 12 22 12C22 12 18.3636 5 12 5Z" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M3 3L21 21M12 5C5.63636 5 2 12 2 12C2 12 3.5 15 6.5 17M12 19C18.3636 19 22 12 22 12C22 12 20.5 9 17.5 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M9.9 9.9C9.33 10.47 9 11.23 9 12C9 13.66 10.34 15 12 15C12.77 15 13.53 14.67 14.1 14.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password_confirmation && (
                  <span className={styles.errorText}>{errors.password_confirmation}</span>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isLoading}
              >
                {isLoading ? 'Restableciendo...' : 'Restablecer contraseña'}
              </button>
            </form>

            {/* Back to Login */}
            <div className={styles.backToLogin}>
              <Link href="/auth/sign-in" className={styles.backLink}>
                ← Volver al inicio de sesión
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className={styles.successIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#5dd9c1" strokeWidth="2"/>
                <path d="M8 12L11 15L16 9" stroke="#5dd9c1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className={styles.title}>Contraseña Restablecida</h1>
            <p className={styles.description}>
              Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
            <p className={styles.note}>
              Serás redirigido al inicio de sesión en unos segundos...
            </p>

            <Link href="/auth/sign-in" className={styles.submitButton}>
              Ir al inicio de sesión
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
