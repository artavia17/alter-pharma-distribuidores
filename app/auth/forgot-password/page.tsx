'use client';

import { useState } from 'react';
import Link from 'next/link';
import { resetPassword } from '@/src/infrastructure/services/auth/auth.services';
import styles from './forgot-password.module.scss';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await resetPassword({ email });

      if (response.status === 200) {
        // Email enviado exitosamente
        setSubmitted(true);
      }
    } catch (err: unknown) {
      console.error('Error en forgot password:', err);

      const status = (err as { response?: { status?: number } }).response?.status;
      const message = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      const errorData = (err as { response?: { data?: { data?: { email?: string } } } }).response?.data?.data;

      // Error 404 - Usuario no encontrado
      if (status === 404) {
        setError(message || 'Usuario no encontrado');
      }
      // Errores de validación (422)
      else if (status === 422 && errorData?.email) {
        setError(errorData.email);
      }
      // Otros errores
      else {
        setError(message || 'Hubo un error al enviar el correo. Intenta nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

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

      {/* Forgot Password Card */}
      <div className={styles.card}>
        {!submitted ? (
          <>
            <h1 className={styles.title}>Recuperar Contraseña</h1>
            <p className={styles.description}>
              Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
            </p>

            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Email Input */}
              <div className={styles.formGroup}>
                <label className={styles.label}>CORREO ELECTRÓNICO</label>
                <input
                  type="email"
                  className={`${styles.input} ${error ? styles.inputError : ''}`}
                  placeholder="Ingresa tu correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
                {error && (
                  <span className={styles.errorText}>{error}</span>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isLoading}
              >
                {isLoading ? 'Enviando...' : 'Enviar instrucciones'}
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
            <h1 className={styles.title}>Revisa tu correo</h1>
            <p className={styles.description}>
              Hemos enviado instrucciones para restablecer tu contraseña a <strong>{email}</strong>
            </p>
            <p className={styles.note}>
              Si no recibes el correo en unos minutos, revisa tu carpeta de spam.
            </p>

            <Link href="/auth/sign-in" className={styles.submitButton}>
              Volver al inicio de sesión
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
