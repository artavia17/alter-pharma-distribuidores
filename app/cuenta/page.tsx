'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/src/presentation/components/layout/DashboardLayout';
import Modal from '@/src/presentation/components/common/Modal';
import Toast from '@/src/presentation/components/common/Toast';
import { useModal } from '@/src/presentation/hooks/useModal';
import { useToast } from '@/src/presentation/hooks/useToast';
import { myAccount, updateMyAccount } from '@/src/infrastructure/services/protected/my-account.services';
import { getStates, getMunicipalities } from '@/src/infrastructure/services/protected/locations.services';
import { DistributorAccount } from '@/src/infrastructure/types/services/protected/my-account.types';
import { State, Municipality } from '@/src/infrastructure/types/services/protected/locations.types';
import styles from './cuenta.module.scss';

export default function CuentaPage() {
  const { isOpen, openModal, closeModal } = useModal();
  const { toast, showSuccess, showError, hideToast } = useToast();
  const [profile, setProfile] = useState<DistributorAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [states, setStates] = useState<State[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);
  const [formData, setFormData] = useState({
    business_name: '',
    contact_person_name: '',
    phone: '',
    email: '',
    street_address: '',
    state_id: 0,
    municipality_id: 0,
    password: '',
    password_confirmation: '',
  });

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const profileResponse = await myAccount();

      if (profileResponse.status === 200 && profileResponse.data) {
        const profileData = profileResponse.data;
        setProfile(profileData);

        setFormData({
          business_name: profileData.business_name,
          contact_person_name: profileData.contact_person_name,
          phone: profileData.phone,
          email: profileData.email,
          street_address: profileData.street_address,
          state_id: profileData.state_id,
          municipality_id: profileData.municipality_id,
          password: '',
          password_confirmation: '',
        });

        // Cargar estados
        await loadStates();

        // Cargar municipios del estado del distribuidor
        if (profileData.state_id) {
          await loadMunicipalities(profileData.state_id);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStates = async () => {
    try {
      setLoadingStates(true);
      const response = await getStates();
      if (response.status === 200 && response.data) {
        setStates(response.data);
      }
    } catch (error) {
      console.error('Error loading states:', error);
    } finally {
      setLoadingStates(false);
    }
  };

  const loadMunicipalities = async (stateId: number) => {
    try {
      setLoadingMunicipalities(true);
      const response = await getMunicipalities(stateId);
      if (response.status === 200 && response.data) {
        setMunicipalities(response.data);
      }
    } catch (error) {
      console.error('Error loading municipalities:', error);
    } finally {
      setLoadingMunicipalities(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name.includes('_id') ? Number(value) : value }));
  };

  const handleStateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateId = Number(e.target.value);
    setFormData(prev => ({ ...prev, state_id: stateId, municipality_id: 0 }));
    setMunicipalities([]);

    if (stateId) {
      await loadMunicipalities(stateId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const dataToSend: {
        business_name: string;
        contact_person_name: string;
        phone: string;
        email: string;
        street_address: string;
        state_id: number;
        municipality_id: number;
        password?: string;
        password_confirmation?: string;
      } = {
        business_name: formData.business_name,
        contact_person_name: formData.contact_person_name,
        phone: formData.phone,
        email: formData.email,
        street_address: formData.street_address,
        state_id: formData.state_id,
        municipality_id: formData.municipality_id,
      };

      // Si hay contraseña, agregarla
      if (formData.password) {
        if (formData.password !== formData.password_confirmation) {
          showError('Las contraseñas no coinciden');
          return;
        }
        dataToSend.password = formData.password;
        dataToSend.password_confirmation = formData.password_confirmation;
      }

      const response = await updateMyAccount(dataToSend);

      if (response.status === 200 && response.data) {
        // Recargar todos los datos del perfil
        await loadData();
        closeModal();
        showSuccess('✓ Perfil actualizado exitosamente');
      }
    } catch (error: unknown) {
      console.error('Error updating profile:', error);
      const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Error al actualizar el perfil';
      showError(errorMessage);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Cargando...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className={styles.error}>Error al cargar el perfil</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Mi Cuenta</h1>
            <p className={styles.subtitle}>Información de la empresa</p>
          </div>
          <button className={styles.editButton} onClick={openModal}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Actualizar Perfil
          </button>
        </div>

        <div className={styles.sections}>
          {/* Información de la Empresa */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Información de la Empresa
            </h2>
            <div className={styles.infoList}>
              <div className={styles.infoRow}>
                <div className={styles.infoCell}>
                  <span className={styles.infoLabel}>Nombre de la Empresa</span>
                  <span className={styles.infoValue}>{profile.business_name}</span>
                </div>
                <div className={styles.infoCell}>
                  <span className={styles.infoLabel}>Número de Identificación</span>
                  <span className={styles.infoValue}>{profile.identification_number}</span>
                </div>
              </div>

              <div className={styles.infoRow}>
                <div className={styles.infoCell}>
                  <span className={styles.infoLabel}>Persona de Contacto</span>
                  <span className={styles.infoValue}>{profile.contact_person_name}</span>
                </div>
              </div>

              <div className={styles.infoRow}>
                <div className={styles.infoCell}>
                  <span className={styles.infoLabel}>Correo Electrónico</span>
                  <span className={styles.infoValue}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    {profile.email}
                  </span>
                </div>
                <div className={styles.infoCell}>
                  <span className={styles.infoLabel}>Teléfono</span>
                  <span className={styles.infoValue}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    {profile.phone}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Ubicación */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              Ubicación
            </h2>
            <div className={styles.infoList}>
              <div className={styles.infoRow}>
                <div className={styles.infoCell} style={{ gridColumn: '1 / -1' }}>
                  <span className={styles.infoLabel}>Dirección</span>
                  <span className={styles.infoValue}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                    {profile.street_address}
                  </span>
                </div>
              </div>

              <div className={styles.infoRow}>
                <div className={styles.infoCell}>
                  <span className={styles.infoLabel}>País</span>
                  <span className={styles.infoValue}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="2" y1="12" x2="22" y2="12"/>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                    {profile.country?.name}
                  </span>
                </div>
                <div className={styles.infoCell}>
                  <span className={styles.infoLabel}>Estado/Provincia</span>
                  <span className={styles.infoValue}>{profile.state?.name}</span>
                </div>
              </div>

              <div className={styles.infoRow}>
                <div className={styles.infoCell}>
                  <span className={styles.infoLabel}>Municipio/Cantón</span>
                  <span className={styles.infoValue}>{profile.municipality?.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} title="Actualizar Perfil">
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Nombre de la Empresa</label>
              <input
                type="text"
                name="business_name"
                value={formData.business_name}
                onChange={handleChange}
                className={styles.formInput}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Persona de Contacto</label>
              <input
                type="text"
                name="contact_person_name"
                value={formData.contact_person_name}
                onChange={handleChange}
                className={styles.formInput}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Teléfono</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={styles.formInput}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Correo Electrónico</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={styles.formInput}
                required
              />
            </div>

            <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
              <label className={styles.formLabel}>Dirección</label>
              <input
                type="text"
                name="street_address"
                value={formData.street_address}
                onChange={handleChange}
                className={styles.formInput}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Estado/Provincia</label>
              <select
                name="state_id"
                value={formData.state_id}
                onChange={handleStateChange}
                className={styles.formInput}
                required
                disabled={loadingStates}
              >
                <option value="">Seleccionar estado...</option>
                {states.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Municipio/Cantón</label>
              <select
                name="municipality_id"
                value={formData.municipality_id}
                onChange={handleChange}
                className={styles.formInput}
                required
                disabled={loadingMunicipalities || !formData.state_id}
              >
                <option value="">Seleccionar municipio...</option>
                {municipalities.map((municipality) => (
                  <option key={municipality.id} value={municipality.id}>
                    {municipality.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Nueva Contraseña (Opcional)</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={styles.formInput}
                minLength={8}
              />
              <span className={styles.formHint}>Dejar en blanco para no cambiar</span>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Confirmar Contraseña</label>
              <input
                type="password"
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                className={styles.formInput}
                minLength={8}
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={closeModal} className={styles.cancelButton}>
              Cancelar
            </button>
            <button type="submit" className={styles.submitButton}>
              Guardar Cambios
            </button>
          </div>
        </form>
      </Modal>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </DashboardLayout>
  );
}
