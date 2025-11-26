'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/src/presentation/components/layout/DashboardLayout';
import { getDistributors } from '@/src/infrastructure/services/protected/distributors.services';
import { DistributorListItem } from '@/src/infrastructure/types/services/protected/distributors.types';
import styles from './distributors.module.scss';

export default function DistributorsPage() {
  const router = useRouter();
  const [distributors, setDistributors] = useState<DistributorListItem[]>([]);
  const [filteredDistributors, setFilteredDistributors] = useState<DistributorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDistributors();
  }, []);

  useEffect(() => {
    filterDistributors();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, distributors]);

  const loadDistributors = async () => {
    try {
      setLoading(true);
      const response = await getDistributors();
      if (response.status === 200) {
        setDistributors(response.data);
        setFilteredDistributors(response.data);
      }
    } catch (error) {
      console.error('Error loading distributors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDistributors = () => {
    if (!searchTerm.trim()) {
      setFilteredDistributors(distributors);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = distributors.filter((distributor) => {
      return (
        distributor.business_name.toLowerCase().includes(term) ||
        distributor.contact_person_name.toLowerCase().includes(term) ||
        distributor.email.toLowerCase().includes(term) ||
        distributor.phone.toLowerCase().includes(term) ||
        distributor.identification_number.toLowerCase().includes(term) ||
        distributor.municipality.name.toLowerCase().includes(term) ||
        distributor.state.name.toLowerCase().includes(term) ||
        distributor.country.name.toLowerCase().includes(term)
      );
    });
    setFilteredDistributors(filtered);
  };

  const handleViewDistributor = (distributorId: number) => {
    router.push(`/distributors/${distributorId}`);
  };

  const getTotalPendingOrders = () => {
    return distributors.reduce((sum, d) => sum + d.pending_orders_count, 0);
  };

  if (loading) {
    return (
      <DashboardLayout title="Distribuidores">
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Cargando distribuidores...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Distribuidores" subtitle="Gestiona los distribuidores del sistema">
      <div className={styles.container}>
        {/* Summary Cards */}
        <div className={styles.summaryCards}>
          <div className={styles.card}>
            <div className={styles.cardIcon} style={{ background: '#e0e7ff' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div className={styles.cardContent}>
              <p className={styles.cardLabel}>Total Distribuidores</p>
              <p className={styles.cardValue}>{distributors.length}</p>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon} style={{ background: '#d1fae5' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div className={styles.cardContent}>
              <p className={styles.cardLabel}>Activos</p>
              <p className={styles.cardValue}>{distributors.filter(d => d.status).length}</p>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon} style={{ background: '#fef3c7' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div className={styles.cardContent}>
              <p className={styles.cardLabel}>Ordenes Pendientes</p>
              <p className={styles.cardValue}>{getTotalPendingOrders()}</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className={styles.searchContainer}>
          <div className={styles.searchWrapper}>
            <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Buscar por empresa, contacto, email, teléfono, ubicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className={styles.clearSearch}
                onClick={() => setSearchTerm('')}
                aria-label="Limpiar búsqueda"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
          {searchTerm && (
            <p className={styles.searchResults}>
              {filteredDistributors.length} {filteredDistributors.length === 1 ? 'resultado' : 'resultados'}
            </p>
          )}
        </div>

        {/* Distributors Table */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Contacto</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Ubicación</th>
                <th>Ordenes Pendientes</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredDistributors.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.noData}>
                    {searchTerm ? 'No se encontraron distribuidores' : 'No hay distribuidores para mostrar'}
                  </td>
                </tr>
              ) : (
                filteredDistributors.map((distributor) => (
                  <tr key={distributor.id}>
                    <td>
                      <strong>{distributor.business_name}</strong>
                    </td>
                    <td>{distributor.contact_person_name}</td>
                    <td>{distributor.email}</td>
                    <td>{distributor.phone}</td>
                    <td>
                      {distributor.municipality.name}, {distributor.state.name}
                      <br />
                      <small style={{ color: '#6b7280' }}>{distributor.country.name}</small>
                    </td>
                    <td>
                      {distributor.pending_orders_count > 0 ? (
                        <span className={styles.pendingBadge}>
                          {distributor.pending_orders_count}
                        </span>
                      ) : (
                        <span style={{ color: '#9ca3af' }}>0</span>
                      )}
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${distributor.status ? styles.active : styles.inactive}`}>
                        {distributor.status ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleViewDistributor(distributor.id)}
                        className={styles.actionButton}
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
