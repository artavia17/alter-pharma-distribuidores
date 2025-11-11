'use client';

import { useState } from 'react';
import styles from './FirstLoginModal.module.scss';

interface FirstLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string, passwordConfirmation: string) => Promise<void>;
}

export default function FirstLoginModal({ isOpen, onClose, onSubmit }: FirstLoginModalProps) {
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; password_confirmation?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validaciones básicas
    if (password.length < 8) {
      setErrors({ password: 'La contraseña debe tener al menos 8 caracteres' });
      return;
    }

    if (password !== passwordConfirmation) {
      setErrors({ password_confirmation: 'Las contraseñas no coinciden' });
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(password, passwordConfirmation);
      // El onSubmit manejará el cierre y redirección
    } catch (error: unknown) {
      console.error('Error al actualizar contraseña:', error);

      // Manejo de errores del servidor
      const errorData = (error as { response?: { data?: { data?: { password?: string; password_confirmation?: string } } } }).response?.data?.data;
      const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message;

      if (errorData) {
        setErrors(errorData);
      } else {
        setErrors({
          password: errorMessage || 'Error al actualizar la contraseña'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && !isLoading && onClose()}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.iconContainer}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h2 className={styles.title}>Cambiar Contraseña</h2>
          <p className={styles.subtitle}>
            Es tu primer inicio de sesión. Por seguridad, debes cambiar tu contraseña.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Nueva Contraseña */}
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
            <p className={styles.hint}>La contraseña debe tener al menos 8 caracteres</p>
          </div>

          {/* Confirmar Contraseña */}
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

          {/* Botones */}
          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? 'Actualizando...' : 'Cambiar Contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
