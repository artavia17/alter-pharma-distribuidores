'use client';

import { useState, useEffect } from 'react';
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

export default function DistributorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const distributorId = Number(params.id);

  const [distributorData, setDistributorData] = useState<DistributorDetailData | null>(null);
  const [orders, setOrders] = useState<DistributorRestockOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');

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
  }, [distributorId, statusFilter]);

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
      const response = await getDistributorOrders(distributorId, statusFilter || undefined);
      if (response.status === 200) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

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

        {/* Filters */}
        <div className={styles.filters}>
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

          {statusFilter && (
            <button onClick={() => setStatusFilter('')} className={styles.clearFilter}>
              Limpiar filtros
            </button>
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
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className={styles.noData}>
                      No hay órdenes para mostrar
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
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
