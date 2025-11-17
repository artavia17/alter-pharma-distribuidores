'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/src/presentation/components/layout/DashboardLayout';
import Modal from '@/src/presentation/components/common/Modal';
import Toast from '@/src/presentation/components/common/Toast';
import { useModal } from '@/src/presentation/hooks/useModal';
import { useToast } from '@/src/presentation/hooks/useToast';
import {
  getRestockOrders,
  getRestockOrdersSummary,
  getPharmacies,
  getRestockOrderDetail,
  updateOrderStatus,
} from '@/src/infrastructure/services/protected/restock-orders.services';
import {
  RestockOrder,
  RestockOrderDetail,
  RestockOrdersSummary,
  Pharmacy,
  RestockOrderStatus,
} from '@/src/infrastructure/types/services/protected/restock-orders.types';
import styles from './home.module.scss';

export default function Home() {
  const { isOpen, openModal, closeModal } = useModal();
  const { toast, showSuccess, showError, hideToast } = useToast();

  const [orders, setOrders] = useState<RestockOrder[]>([]);
  const [summary, setSummary] = useState<RestockOrdersSummary | null>(null);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<RestockOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [pharmacyFilter, setPharmacyFilter] = useState<number | undefined>();

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, pharmacyFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersResponse, summaryResponse, pharmaciesResponse] = await Promise.all([
        getRestockOrders(statusFilter, pharmacyFilter),
        getRestockOrdersSummary(),
        getPharmacies(),
      ]);

      if (ordersResponse.status === 200) setOrders(ordersResponse.data);
      if (summaryResponse.status === 200) setSummary(summaryResponse.data);
      if (pharmaciesResponse.status === 200) setPharmacies(pharmaciesResponse.data);
    } catch (error) {
      console.error('Error loading data:', error);
      showError('Error al cargar las órdenes');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (orderId: number) => {
    try {
      setLoadingDetail(true);
      openModal();
      const response = await getRestockOrderDetail(orderId);
      if (response.status === 200) {
        setSelectedOrder(response.data);
      }
    } catch (error) {
      console.error('Error loading order detail:', error);
      showError('Error al cargar el detalle de la orden');
      closeModal();
    } finally {
      setLoadingDetail(false);
    }
  };

  const getNextStatus = (currentStatus: RestockOrderStatus): RestockOrderStatus | null => {
    const statusFlow: RestockOrderStatus[] = ['solicitud_enviada', 'recibido', 'en_proceso', 'enviando', 'entregado'];
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex === statusFlow.length - 1) return null;
    return statusFlow[currentIndex + 1];
  };

  const getStatusLabel = (status: RestockOrderStatus): string => {
    const labels: Record<RestockOrderStatus, string> = {
      solicitud_enviada: 'Solicitud Enviada',
      recibido: 'Recibido',
      en_proceso: 'En Proceso',
      enviando: 'Enviando',
      entregado: 'Entregado',
    };
    return labels[status] || status;
  };

  const handleUpdateStatus = async (orderId: number, newStatus: RestockOrderStatus, notes?: string) => {
    try {
      setUpdatingStatus(true);
      const response = await updateOrderStatus(orderId, { status: newStatus, notes });

      if (response.status === 200) {
        showSuccess('✓ Estado actualizado exitosamente');
        await loadData();
        if (selectedOrder) {
          const detailResponse = await getRestockOrderDetail(orderId);
          if (detailResponse.status === 200) {
            setSelectedOrder(detailResponse.data);
          }
        }
      }
    } catch (error: unknown) {
      console.error('Error updating status:', error);
      const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Error al actualizar el estado';
      showError(errorMessage);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status: RestockOrderStatus): string => {
    const colors: Record<RestockOrderStatus, string> = {
      solicitud_enviada: '#f59e0b',
      recibido: '#3b82f6',
      en_proceso: '#8b5cf6',
      enviando: '#06b6d4',
      entregado: '#10b981',
    };
    return colors[status] || '#6b7280';
  };

  if (loading) {
    return (
      <DashboardLayout title="Órdenes de Reabastecimiento">
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Cargando órdenes...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Órdenes de Reabastecimiento" subtitle="Gestiona las solicitudes de reabastecimiento">
      <div className={styles.container}>
        {/* Summary Cards */}
        {summary && (
          <div className={styles.summaryCards}>
            <div className={styles.card} onClick={() => setStatusFilter('')}>
              <div className={styles.cardIcon} style={{ background: '#e0e7ff' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="M3 9h18"/>
                </svg>
              </div>
              <div className={styles.cardContent}>
                <p className={styles.cardLabel}>Total</p>
                <p className={styles.cardValue}>{summary.total}</p>
              </div>
            </div>

            <div className={styles.card} onClick={() => setStatusFilter('recibido')}>
              <div className={styles.cardIcon} style={{ background: '#dbeafe' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div className={styles.cardContent}>
                <p className={styles.cardLabel}>Recibidas</p>
                <p className={styles.cardValue}>{summary.recibido}</p>
              </div>
            </div>

            <div className={styles.card} onClick={() => setStatusFilter('en_proceso')}>
              <div className={styles.cardIcon} style={{ background: '#ede9fe' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div className={styles.cardContent}>
                <p className={styles.cardLabel}>En Proceso</p>
                <p className={styles.cardValue}>{summary.en_proceso}</p>
              </div>
            </div>

            <div className={styles.card} onClick={() => setStatusFilter('enviando')}>
              <div className={styles.cardIcon} style={{ background: '#cffafe' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2">
                  <rect x="1" y="3" width="15" height="13"/>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                  <circle cx="5.5" cy="18.5" r="2.5"/>
                  <circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
              </div>
              <div className={styles.cardContent}>
                <p className={styles.cardLabel}>Enviando</p>
                <p className={styles.cardValue}>{summary.enviando}</p>
              </div>
            </div>

            <div className={styles.card} onClick={() => setStatusFilter('entregado')}>
              <div className={styles.cardIcon} style={{ background: '#d1fae5' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div className={styles.cardContent}>
                <p className={styles.cardLabel}>Entregadas</p>
                <p className={styles.cardValue}>{summary.entregado}</p>
              </div>
            </div>

            <div className={styles.card} onClick={() => setStatusFilter('recibido_farmacia')}>
              <div className={styles.cardIcon} style={{ background: '#fef3c7' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div className={styles.cardContent}>
                <p className={styles.cardLabel}>Recibido por Farmacia</p>
                <p className={styles.cardValue}>{summary.recibido_farmacia}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label>Farmacia:</label>
            <select
              value={pharmacyFilter || ''}
              onChange={(e) => setPharmacyFilter(e.target.value ? Number(e.target.value) : undefined)}
              className={styles.select}
            >
              <option value="">Todas las farmacias</option>
              {pharmacies.map((pharmacy) => (
                <option key={pharmacy.id} value={pharmacy.id}>
                  {pharmacy.commercial_name}
                </option>
              ))}
            </select>
          </div>

          {statusFilter && (
            <button onClick={() => setStatusFilter('')} className={styles.clearFilter}>
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Orders Table */}
        <div className={styles.tableContainer}>
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
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className={styles.noData}>
                    No hay órdenes para mostrar
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.pharmacy.commercial_name}</td>
                    <td>{order.product.name}</td>
                    <td>{order.dose.dose}</td>
                    <td>{order.quantity_requested}</td>
                    <td>
                      <span
                        className={styles.statusBadge}
                        style={{ background: getStatusColor(order.status) }}
                      >
                        {order.status_label}
                      </span>
                    </td>
                    <td>{Math.ceil(order.days_since_request)} días</td>
                    <td>{new Date(order.requested_at).toLocaleDateString('es-ES')}</td>
                    <td>
                      <button
                        onClick={() => handleViewDetail(order.id)}
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

      {/* Order Detail Modal */}
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        title={selectedOrder ? `Orden #${selectedOrder.id}` : 'Detalle de Orden'}
        size="large"
      >
        {loadingDetail ? (
          <div className={styles.modalLoading}>
            <div className={styles.spinner}></div>
            <p>Cargando detalle...</p>
          </div>
        ) : selectedOrder ? (
          <div className={styles.orderDetail}>
            {/* Order Info */}
            <div className={styles.detailSection}>
              <h3>Información de la Orden</h3>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Farmacia:</span>
                  <span className={styles.detailValue}>{selectedOrder.pharmacy.commercial_name}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Producto:</span>
                  <span className={styles.detailValue}>{selectedOrder.product.name}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Presentación:</span>
                  <span className={styles.detailValue}>{selectedOrder.dose.dose}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Cantidad:</span>
                  <span className={styles.detailValue}>{selectedOrder.quantity_requested}</span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className={styles.detailSection}>
              <h3>Línea de Tiempo</h3>
              <div className={styles.timeline}>
                {selectedOrder.timeline.map((item) => {
                  // Un estado está completado solo si tiene fecha
                  const isCompleted = item.date !== null;

                  return (
                    <div
                      key={item.status}
                      className={`${styles.timelineItem} ${isCompleted ? styles.completed : ''}`}
                    >
                      <div className={styles.timelineIcon}>
                        {isCompleted ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        ) : (
                          <div className={styles.timelineDot}></div>
                        )}
                      </div>
                      <div className={styles.timelineContent}>
                        <p className={styles.timelineLabel}>{item.label}</p>
                        {item.date && (
                          <p className={styles.timelineDate}>
                            {new Date(item.date).toLocaleString('es-ES')}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Update Status */}
            {getNextStatus(selectedOrder.status) && (
              <div className={styles.detailSection}>
                <h3>Actualizar Estado</h3>
                <button
                  onClick={() => {
                    const nextStatus = getNextStatus(selectedOrder.status);
                    if (nextStatus) {
                      handleUpdateStatus(selectedOrder.id, nextStatus);
                    }
                  }}
                  className={styles.updateButton}
                  disabled={updatingStatus}
                >
                  {updatingStatus ? 'Actualizando...' : `Marcar como ${getStatusLabel(getNextStatus(selectedOrder.status)!)}`}
                </button>
              </div>
            )}
          </div>
        ) : null}
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
