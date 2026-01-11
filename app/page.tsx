'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
import * as XLSX from 'xlsx';

export default function Home() {
  const router = useRouter();
  const { isOpen, openModal, closeModal } = useModal();
  const { toast, showSuccess, showError, hideToast } = useToast();

  const [orders, setOrders] = useState<RestockOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<RestockOrder[]>([]);
  const [summary, setSummary] = useState<RestockOrdersSummary | null>(null);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<RestockOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [pharmacyFilter, setPharmacyFilter] = useState<string>('');
  const [productFilter, setProductFilter] = useState<string>('');
  const [doseFilter, setDoseFilter] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyFilters();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, statusFilter, pharmacyFilter, productFilter, doseFilter, startDate, endDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersResponse, summaryResponse, pharmaciesResponse] = await Promise.all([
        getRestockOrders(),
        getRestockOrdersSummary(),
        getPharmacies(),
      ]);

      if (ordersResponse.status === 200) {
        setOrders(ordersResponse.data);
        setFilteredOrders(ordersResponse.data);
      }
      if (summaryResponse.status === 200) setSummary(summaryResponse.data);
      if (pharmaciesResponse.status === 200) setPharmacies(pharmaciesResponse.data);
    } catch (error) {
      console.error('Error loading data:', error);
      showError('Error al cargar las órdenes');
    } finally {
      setLoading(false);
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
      'Producto': order.product.name,
      'Presentación': order.dose.dose,
      'Cantidad Solicitada': order.quantity_requested,
      'Estado': order.status_label,
      'Fecha Solicitado': new Date(order.requested_at).toLocaleString('es-ES'),
      'Fecha Recibido': order.received_at ? new Date(order.received_at).toLocaleString('es-ES') : '',
      'Fecha Procesado': order.processed_at ? new Date(order.processed_at).toLocaleString('es-ES') : '',
      'Fecha Enviando': order.shipped_at ? new Date(order.shipped_at).toLocaleString('es-ES') : '',
      'Fecha Entregado': order.delivered_at ? new Date(order.delivered_at).toLocaleString('es-ES') : '',
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
      { wch: 30 }, // Producto
      { wch: 15 }, // Presentación
      { wch: 10 }, // Cantidad
      { wch: 20 }, // Estado
      { wch: 20 }, // Fecha Solicitado
      { wch: 20 }, // Fecha Recibido
      { wch: 20 }, // Fecha Procesado
      { wch: 20 }, // Fecha Enviando
      { wch: 20 }, // Fecha Entregado
      { wch: 10 }, // Días
      { wch: 30 }, // Notas
    ];
    worksheet['!cols'] = columnWidths;

    const fileName = `ordenes_reabastecimiento_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Obtener listas únicas para los filtros
  const uniquePharmacies = useMemo(() => {
    const pharms = orders.map(o => o.pharmacy.commercial_name);
    return Array.from(new Set(pharms)).sort();
  }, [orders]);

  const uniqueProducts = useMemo(() => {
    const products = orders.map(o => o.product.name);
    return Array.from(new Set(products)).sort();
  }, [orders]);

  const uniqueDoses = useMemo(() => {
    const doses = orders.map(o => o.dose.dose);
    return Array.from(new Set(doses)).sort();
  }, [orders]);

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

            <div
              className={styles.card}
              onClick={() => router.push('/reports')}
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
            </div>
          </div>
        )}

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
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className={styles.noData}>
                    {hasActiveFilters() ? 'No se encontraron órdenes con los filtros aplicados' : 'No hay órdenes para mostrar'}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
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
