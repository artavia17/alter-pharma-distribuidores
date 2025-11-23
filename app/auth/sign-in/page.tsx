'use client';

import { useState } from 'react';
import styles from './sign-in.module.scss';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { login, updatePassword } from '@/src/infrastructure/services/auth/auth.services';
import { setCookieHelper } from '@/src/infrastructure/helpers/cookieHelper';
import FirstLoginModal from '@/src/presentation/components/auth/FirstLoginModal';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showFirstLoginModal, setShowFirstLoginModal] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const response = await login({ email, password });

      if (response.status === 200 && 'token' in response.data) {
        // Login exitoso - guardar token y datos del distribuidor
        const { token, distributor, is_administrator } = response.data;

        // Guardar token
        setCookieHelper('user_token', token);

        // Guardar datos del distribuidor
        setCookieHelper('distributor_data', JSON.stringify(distributor));

        // Guardar flag de administrador
        setCookieHelper('is_administrator', String(is_administrator));

        // Redireccionar según el tipo de usuario
        if (is_administrator) {
          router.push('/distributors');
        } else {
          router.push('/');
        }
      }
    } catch (error: unknown) {
      console.error('Error en login:', error);

      const status = (error as { response?: { status?: number } }).response?.status;
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      const data = (error as { response?: { data?: { data?: { email?: string; password?: string } } } }).response?.data?.data;

      // Error 422 - Errores de validación
      if (status === 422 && data) {
        setErrors(data);
      }
      // Error 401 - Credenciales inválidas
      else if (status === 401) {
        setErrors({
          email: message || 'Credenciales inválidas'
        });
      }
      // Otros errores
      else {
        setErrors({
          email: message || 'Error al iniciar sesión. Por favor, intenta nuevamente.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (newPassword: string, passwordConfirmation: string) => {
    await updatePassword({
      password: newPassword,
      password_confirmation: passwordConfirmation
    });

    // Cerrar modal y redirigir al home
    setShowFirstLoginModal(false);
    router.push('/');
  };

  return (
    <>
      <FirstLoginModal
        isOpen={showFirstLoginModal}
        onClose={() => {}} // No permitir cerrar el modal sin cambiar la contraseña
        onSubmit={handlePasswordUpdate}
      />

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

      {/* Login Card */}
      <div className={styles.card}>
        <h1 className={styles.title}>Bienvenido</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Email Input */}
          <div className={styles.formGroup}>
            <label className={styles.label}>CORREO ELECTRÓNICO</label>
            <input
              type="email"
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              placeholder="Ingresa tu correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
            {errors.email && (
              <span className={styles.errorText}>{errors.email}</span>
            )}
          </div>

          {/* Password Input */}
          <div className={styles.formGroup}>
            <label className={styles.label}>CONTRASEÑA</label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
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

          {/* Forgot Password */}
          <div className={styles.forgotPassword}>
            <Link href="/auth/forgot-password" className={styles.forgotLink}>
              Olvidé mi contraseña
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Iniciando sesión...' : 'Continuar'}
          </button>
        </form>
      </div>
    </div>
    </>
  );
}
