'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/src/presentation/components/layout/DashboardLayout';
import {
  getDistributorDetail,
  getDistributorOrders,
} from '@/src/infrastructure/services/protected/distributors.services';
import {
  DistributorDetailData,
  DistributorRestockOrder,
  DistributorRestockOrderStatus,
} from '@/src/infrastructure/types/services/protected/distributors.types';
import styles from '../distributors.module.scss';
import * as XLSX from 'xlsx';

export default function DistributorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const distributorId = Number(params.id);

  const [distributorData, setDistributorData] = useState<DistributorDetailData | null>(null);
  const [orders, setOrders] = useState<DistributorRestockOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<DistributorRestockOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Filtros
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [pharmacyFilter, setPharmacyFilter] = useState<string>('');
  const [productFilter, setProductFilter] = useState<string>('');
  const [doseFilter, setDoseFilter] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    if (distributorId) {
      loadDistributorDetail();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [distributorId]);

  useEffect(() => {
    if (distributorId) {
      loadOrders();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [distributorId]);

  useEffect(() => {
    applyFilters();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, statusFilter, pharmacyFilter, productFilter, doseFilter, startDate, endDate]);

  const loadDistributorDetail = async () => {
    try {
      setLoading(true);
      const response = await getDistributorDetail(distributorId);
      if (response.status === 200) {
        setDistributorData(response.data);
      }
    } catch (error) {
      console.error('Error loading distributor detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await getDistributorOrders(distributorId);
      if (response.status === 200) {
        setOrders(response.data.orders);
        setFilteredOrders(response.data.orders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];

    // Filtro por estado
    if (statusFilter) {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filtro por farmacia
    if (pharmacyFilter) {
      filtered = filtered.filter(order =>
        order.pharmacy.commercial_name.toLowerCase().includes(pharmacyFilter.toLowerCase())
      );
    }

    // Filtro por producto
    if (productFilter) {
      filtered = filtered.filter(order =>
        order.product.name.toLowerCase().includes(productFilter.toLowerCase())
      );
    }

    // Filtro por presentación
    if (doseFilter) {
      filtered = filtered.filter(order =>
        order.dose.dose.toLowerCase().includes(doseFilter.toLowerCase())
      );
    }

    // Filtro por fecha de inicio
    if (startDate) {
      filtered = filtered.filter(order =>
        new Date(order.requested_at) >= new Date(startDate)
      );
    }

    // Filtro por fecha de fin
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      filtered = filtered.filter(order =>
        new Date(order.requested_at) <= endDateTime
      );
    }

    setFilteredOrders(filtered);
  };

  const clearFilters = () => {
    setStatusFilter('');
    setPharmacyFilter('');
    setProductFilter('');
    setDoseFilter('');
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters = () => {
    return statusFilter || pharmacyFilter || productFilter || doseFilter || startDate || endDate;
  };

  const exportToExcel = () => {
    if (filteredOrders.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const data = filteredOrders.map((order) => ({
      'ID': order.id,
      'Farmacia': order.pharmacy.commercial_name,
      'Email Farmacia': order.pharmacy.email,
      'Teléfono Farmacia': order.pharmacy.phone,
      'Producto': order.product.name,
      'Presentación': order.dose.dose,
      'Cantidad Solicitada': order.quantity_requested,
      'Estado': order.status_label,
      'Fecha Solicitado': new Date(order.requested_at).toLocaleString('es-ES'),
      'Fecha Recibido': order.received_at ? new Date(order.received_at).toLocaleString('es-ES') : '',
      'Fecha Procesado': order.processed_at ? new Date(order.processed_at).toLocaleString('es-ES') : '',
      'Fecha Enviando': order.shipped_at ? new Date(order.shipped_at).toLocaleString('es-ES') : '',
      'Fecha Entregado': order.delivered_at ? new Date(order.delivered_at).toLocaleString('es-ES') : '',
      'Fecha Recibido Farmacia': order.pharmacy_received_at ? new Date(order.pharmacy_received_at).toLocaleString('es-ES') : '',
      'Días desde solicitud': Math.ceil(order.days_since_request),
      'Notas': order.notes || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Órdenes');

    // Ajustar anchos de columnas
    const columnWidths = [
      { wch: 8 },  // ID
      { wch: 25 }, // Farmacia
      { wch: 30 }, // Email
      { wch: 15 }, // Teléfono
      { wch: 30 }, // Producto
      { wch: 15 }, // Presentación
      { wch: 10 }, // Cantidad
      { wch: 20 }, // Estado
      { wch: 20 }, // Fecha Solicitado
      { wch: 20 }, // Fecha Recibido
      { wch: 20 }, // Fecha Procesado
      { wch: 20 }, // Fecha Enviando
      { wch: 20 }, // Fecha Entregado
      { wch: 20 }, // Fecha Recibido Farmacia
      { wch: 10 }, // Días
      { wch: 30 }, // Notas
    ];
    worksheet['!cols'] = columnWidths;

    const fileName = `ordenes_${distributorData?.distributor.business_name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Obtener listas únicas para los filtros
  const uniquePharmacies = useMemo(() => {
    const pharmacies = orders.map(o => o.pharmacy.commercial_name);
    return Array.from(new Set(pharmacies)).sort();
  }, [orders]);

  const uniqueProducts = useMemo(() => {
    const products = orders.map(o => o.product.name);
    return Array.from(new Set(products)).sort();
  }, [orders]);

  const uniqueDoses = useMemo(() => {
    const doses = orders.map(o => o.dose.dose);
    return Array.from(new Set(doses)).sort();
  }, [orders]);

  const getStatusColor = (status: DistributorRestockOrderStatus): string => {
    const colors: Record<DistributorRestockOrderStatus, string> = {
      solicitud_enviada: '#f59e0b',
      recibido: '#3b82f6',
      en_proceso: '#8b5cf6',
      enviando: '#06b6d4',
      entregado: '#10b981',
      recibido_farmacia: '#059669',
    };
    return colors[status] || '#6b7280';
  };

  if (loading) {
    return (
      <DashboardLayout title="Detalle del Distribuidor">
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Cargando información...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!distributorData) {
    return (
      <DashboardLayout title="Distribuidor no encontrado">
        <div className={styles.loading}>
          <p>No se encontró el distribuidor</p>
          <button onClick={() => router.push('/distributors')} className={styles.backButton}>
            Volver a la lista
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const { distributor, orders_summary } = distributorData;

  return (
    <DashboardLayout
      title={distributor.business_name}
      subtitle="Detalle del distribuidor y sus órdenes"
    >
      <div className={styles.container}>
        {/* Header with Back Button */}
        <div className={styles.header}>
          <button onClick={() => router.push('/distributors')} className={styles.backButton}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Volver
          </button>
        </div>

        {/* Distributor Info Card */}
        <div className={styles.distributorInfo}>
          <div className={styles.infoHeader}>
            <h3>{distributor.business_name}</h3>
            <span className={`${styles.statusBadge} ${distributor.status ? styles.active : styles.inactive}`}>
              {distributor.status ? 'Activo' : 'Inactivo'}
            </span>
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Contacto</span>
              <span className={styles.infoValue}>{distributor.contact_person_name}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Email</span>
              <span className={styles.infoValue}>{distributor.email}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Teléfono</span>
              <span className={styles.infoValue}>{distributor.phone}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Identificación</span>
              <span className={styles.infoValue}>{distributor.identification_number}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Dirección</span>
              <span className={styles.infoValue}>{distributor.street_address}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Ubicación</span>
              <span className={styles.infoValue}>
                {distributor.municipality.name}, {distributor.state.name}, {distributor.country.name}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Último Login</span>
              <span className={styles.infoValue}>
                {distributor.last_login
                  ? new Date(distributor.last_login).toLocaleString('es-ES')
                  : 'Nunca'}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Registrado</span>
              <span className={styles.infoValue}>
                {new Date(distributor.created_at).toLocaleDateString('es-ES')}
              </span>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className={styles.summaryCards}>
          <div className={styles.card} onClick={() => setStatusFilter('')}>
            <div className={styles.cardIcon} style={{ background: '#e0e7ff' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M3 9h18"/>
              </svg>
            </div>
            <div className={styles.cardContent}>
              <p className={styles.cardLabel}>Total Órdenes</p>
              <p className={styles.cardValue}>{orders.length}</p>
            </div>
          </div>

          <div className={styles.card} onClick={() => setStatusFilter('recibido_farmacia')}>
            <div className={styles.cardIcon} style={{ background: '#d1fae5' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div className={styles.cardContent}>
              <p className={styles.cardLabel}>Recibido por Farmacia</p>
              <p className={styles.cardValue}>{orders_summary.recibido_farmacia}</p>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className={styles.filtersSection}>
          <div className={styles.filtersHeader}>
            <h3 className={styles.sectionTitle}>Filtros Avanzados</h3>
            <div className={styles.filterActions}>
              {hasActiveFilters() && (
                <button onClick={clearFilters} className={styles.clearAllFilters}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  Limpiar todos
                </button>
              )}
              <button onClick={exportToExcel} className={styles.exportButton}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Exportar a Excel
              </button>
            </div>
          </div>

          <div className={styles.filtersGrid}>
            <div className={styles.filterGroup}>
              <label>Farmacia:</label>
              <select
                value={pharmacyFilter}
                onChange={(e) => setPharmacyFilter(e.target.value)}
                className={styles.select}
              >
                <option value="">Todas las farmacias</option>
                {uniquePharmacies.map((pharmacy) => (
                  <option key={pharmacy} value={pharmacy}>
                    {pharmacy}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Producto:</label>
              <select
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                className={styles.select}
              >
                <option value="">Todos los productos</option>
                {uniqueProducts.map((product) => (
                  <option key={product} value={product}>
                    {product}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Presentación:</label>
              <select
                value={doseFilter}
                onChange={(e) => setDoseFilter(e.target.value)}
                className={styles.select}
              >
                <option value="">Todas las presentaciones</option>
                {uniqueDoses.map((dose) => (
                  <option key={dose} value={dose}>
                    {dose}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Estado:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={styles.select}
              >
                <option value="">Todos los estados</option>
                <option value="solicitud_enviada">Solicitud Enviada</option>
                <option value="recibido">Recibido</option>
                <option value="en_proceso">En Proceso</option>
                <option value="enviando">Enviando</option>
                <option value="entregado">Entregado</option>
                <option value="recibido_farmacia">Recibido por Farmacia</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Fecha Inicio:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={styles.dateInput}
              />
            </div>

            <div className={styles.filterGroup}>
              <label>Fecha Fin:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={styles.dateInput}
              />
            </div>
          </div>

          {hasActiveFilters() && (
            <div className={styles.filterSummary}>
              Mostrando {filteredOrders.length} de {orders.length} órdenes
            </div>
          )}
        </div>

        {/* Orders Table */}
        <h3 className={styles.sectionTitle}>Órdenes de Reabastecimiento</h3>
        <div className={styles.tableContainer}>
          {loadingOrders ? (
            <div className={styles.modalLoading}>
              <div className={styles.spinner}></div>
              <p>Cargando órdenes...</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Farmacia</th>
                  <th>Producto</th>
                  <th>Presentación</th>
                  <th>Cantidad</th>
                  <th>Estado</th>
                  <th>Días</th>
                  <th>Solicitado</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className={styles.noData}>
                      {hasActiveFilters() ? 'No se encontraron órdenes con los filtros aplicados' : 'No hay órdenes para mostrar'}
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>
                        <strong>{order.pharmacy.commercial_name}</strong>
                        <br />
                        <small style={{ color: '#6b7280' }}>{order.pharmacy.email}</small>
                      </td>
                      <td>{order.product.name}</td>
                      <td>{order.dose.dose}</td>
                      <td>{order.quantity_requested}</td>
                      <td>
                        <span
                          className={styles.orderStatusBadge}
                          style={{ background: getStatusColor(order.status) }}
                        >
                          {order.status_label}
                        </span>
                      </td>
                      <td>{Math.ceil(order.days_since_request)} días</td>
                      <td>{new Date(order.requested_at).toLocaleDateString('es-ES')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
