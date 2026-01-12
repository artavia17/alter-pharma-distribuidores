'use client';

import { useState, useEffect, useMemo } from 'react';
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

  // Advanced filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [stateFilter, setStateFilter] = useState<string>('');
  const [countryFilter, setCountryFilter] = useState<string>('');

  useEffect(() => {
    loadDistributors();
  }, []);

  useEffect(() => {
    filterDistributors();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, stateFilter, countryFilter, distributors]);

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
    let filtered = [...distributors];

    // Filtro por búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((distributor) => {
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
    }

    // Filtro por estado (activo/inactivo)
    if (statusFilter) {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter((distributor) => distributor.status === isActive);
    }

    // Filtro por estado/provincia
    if (stateFilter) {
      filtered = filtered.filter((distributor) => distributor.state.name === stateFilter);
    }

    // Filtro por país
    if (countryFilter) {
      filtered = filtered.filter((distributor) => distributor.country.name === countryFilter);
    }

    setFilteredDistributors(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setStateFilter('');
    setCountryFilter('');
  };

  const hasActiveFilters = () => {
    return searchTerm || statusFilter || stateFilter || countryFilter;
  };

  // Obtener listas únicas para los filtros
  const uniqueStates = useMemo(() => {
    const states = distributors.map((d) => d.state.name);
    return Array.from(new Set(states)).sort();
  }, [distributors]);

  const uniqueCountries = useMemo(() => {
    const countries = distributors.map((d) => d.country.name);
    return Array.from(new Set(countries)).sort();
  }, [distributors]);

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

          {/* <div
            className={styles.card}
            onClick={() => router.push('/distributors/reports')}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.cardIcon} style={{ background: '#ddd6fe' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <div className={styles.cardContent}>
              <p className={styles.cardLabel}>Reportes</p>
              <p className={styles.cardValue} style={{ fontSize: '16px', marginTop: '4px' }}>Ver reportes</p>
            </div>
          </div> */}
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

        {/* Advanced Filters */}
        <div className={styles.filtersSection}>
          <div className={styles.filtersHeader}>
            <h3 className={styles.sectionTitle}>Filtros Avanzados</h3>
            {hasActiveFilters() && (
              <button onClick={clearFilters} className={styles.clearAllFilters}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Limpiar todos
              </button>
            )}
          </div>

          <div className={styles.filtersGrid}>
            <div className={styles.filterGroup}>
              <label>Estado:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={styles.select}
              >
                <option value="">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Estado/Provincia:</label>
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className={styles.select}
              >
                <option value="">Todos los estados</option>
                {uniqueStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>País:</label>
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className={styles.select}
              >
                <option value="">Todos los países</option>
                {uniqueCountries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {hasActiveFilters() && (
            <div className={styles.filterSummary}>
              Mostrando {filteredDistributors.length} de {distributors.length} distribuidores
            </div>
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
