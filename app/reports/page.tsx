'use client';

import { useState } from 'react';
import DashboardLayout from '@/src/presentation/components/layout/DashboardLayout';
import Toast from '@/src/presentation/components/common/Toast';
import { useToast } from '@/src/presentation/hooks/useToast';
import {
  getPharmacyChainReport,
  getProductDistributionReport,
  getDashboardSummary,
} from '@/src/infrastructure/services/protected/reports.services';
import styles from './reports.module.scss';
import * as XLSX from 'xlsx';

export default function ReportsPage() {
  const { toast, showSuccess, showError, hideToast } = useToast();

  // Reports state
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [pharmacyChainData, setPharmacyChainData] = useState<any>(null);
  const [productDistributionData, setProductDistributionData] = useState<any>(null);
  const [dashboardSummaryData, setDashboardSummaryData] = useState<any>(null);

  // Filters
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Load reports functions
  const loadPharmacyChainReport = async () => {
    try {
      setLoadingReport(true);
      setActiveReport('pharmacy-chains');

      const filters = {
        date_from: startDate || undefined,
        date_to: endDate || undefined,
      };

      const response = await getPharmacyChainReport(filters);

      if (response.success) {
        setPharmacyChainData(response.data);
      }
    } catch (error) {
      console.error('Error loading pharmacy chain report:', error);
      showError('Error al cargar el reporte de cadenas');
    } finally {
      setLoadingReport(false);
    }
  };

  const loadProductDistributionReport = async () => {
    try {
      setLoadingReport(true);
      setActiveReport('product-distribution');

      const filters = {
        date_from: startDate || undefined,
        date_to: endDate || undefined,
        per_page: 100,
      };

      const response = await getProductDistributionReport(filters);

      if (response.success) {
        setProductDistributionData(response.data);
      }
    } catch (error) {
      console.error('Error loading product distribution report:', error);
      showError('Error al cargar el reporte de distribución');
    } finally {
      setLoadingReport(false);
    }
  };

  const loadDashboardSummary = async () => {
    try {
      setLoadingReport(true);
      setActiveReport('dashboard-summary');

      const filters = {
        date_from: startDate || undefined,
        date_to: endDate || undefined,
      };

      const response = await getDashboardSummary(filters);

      if (response.success) {
        setDashboardSummaryData(response.data);
      }
    } catch (error) {
      console.error('Error loading dashboard summary:', error);
      showError('Error al cargar el resumen del dashboard');
    } finally {
      setLoadingReport(false);
    }
  };

  const closeReport = () => {
    setActiveReport(null);
    setPharmacyChainData(null);
    setProductDistributionData(null);
    setDashboardSummaryData(null);
  };

  // Export functions
  const exportPharmacyChainToExcel = () => {
    if (!pharmacyChainData) return;

    const exportData: any[] = [];

    pharmacyChainData.pharmacies
      .filter((p: any) => p.grand_total.total_orders >= 1)
      .forEach((pharmacy: any) => {
        exportData.push({
          'Tipo': 'Farmacia Principal',
          'Nombre Comercial': pharmacy.pharmacy.commercial_name,
          'Nombre Legal': pharmacy.pharmacy.legal_name,
          'Teléfono': pharmacy.pharmacy.phone,
          'Email': pharmacy.pharmacy.email,
          'Dirección': pharmacy.pharmacy.address,
          'Total Órdenes': pharmacy.main_pharmacy_stats.total_orders,
          'Cantidad Total': pharmacy.main_pharmacy_stats.total_quantity,
          'Pendientes': pharmacy.main_pharmacy_stats.by_status.pending?.count || 0,
          'En Proceso': pharmacy.main_pharmacy_stats.by_status.in_process?.count || 0,
          'Enviando': pharmacy.main_pharmacy_stats.by_status.shipped?.count || 0,
          'Entregados': pharmacy.main_pharmacy_stats.by_status.delivered?.count || 0,
        });

        pharmacy.sub_pharmacies.forEach((subPharmacy: any) => {
          exportData.push({
            'Tipo': 'Sucursal',
            'Nombre Comercial': subPharmacy.commercial_name,
            'Nombre Legal': pharmacy.pharmacy.legal_name,
            'Teléfono': subPharmacy.phone,
            'Email': subPharmacy.email,
            'Dirección': '-',
            'Total Órdenes': subPharmacy.stats.total_orders,
            'Cantidad Total': subPharmacy.stats.total_quantity,
            'Pendientes': subPharmacy.stats.by_status.pending?.count || 0,
            'En Proceso': subPharmacy.stats.by_status.in_process?.count || 0,
            'Enviando': subPharmacy.stats.by_status.shipped?.count || 0,
            'Entregados': subPharmacy.stats.by_status.delivered?.count || 0,
          });
        });

        exportData.push({
          'Tipo': 'TOTAL CADENA',
          'Nombre Comercial': pharmacy.pharmacy.commercial_name,
          'Nombre Legal': '',
          'Teléfono': '',
          'Email': '',
          'Dirección': '',
          'Total Órdenes': pharmacy.grand_total.total_orders,
          'Cantidad Total': pharmacy.grand_total.total_quantity,
          'Pendientes': pharmacy.grand_total.by_status.pending?.count || 0,
          'En Proceso': pharmacy.grand_total.by_status.in_process?.count || 0,
          'Enviando': pharmacy.grand_total.by_status.shipped?.count || 0,
          'Entregados': pharmacy.grand_total.by_status.delivered?.count || 0,
        });

        exportData.push({});
      });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cadenas de Farmacias');

    const columnWidths = [
      { wch: 20 }, { wch: 35 }, { wch: 35 }, { wch: 15 },
      { wch: 30 }, { wch: 40 }, { wch: 12 }, { wch: 12 },
      { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
    ];
    worksheet['!cols'] = columnWidths;

    const fileName = `reporte_cadenas_farmacias_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    showSuccess('Reporte exportado exitosamente');
  };

  const exportProductDistributionToExcel = () => {
    if (!productDistributionData) return;

    const orders = productDistributionData.data;

    const exportData = orders.map((order: any) => ({
      'ID Orden': order.id,
      'Farmacia': order.pharmacy.commercial_name,
      'Farmacia Legal': order.pharmacy.legal_name,
      'Sucursal': order.sub_pharmacy?.commercial_name || 'N/A',
      'Producto': order.product_dose.product.name,
      'Presentación': order.product_dose.dose,
      'Cantidad': order.quantity_requested,
      'Estado': order.status,
      'Fecha Solicitado': new Date(order.requested_at).toLocaleString('es-ES'),
      'Fecha Recibido': order.received_at ? new Date(order.received_at).toLocaleString('es-ES') : '',
      'Fecha Procesado': order.processed_at ? new Date(order.processed_at).toLocaleString('es-ES') : '',
      'Fecha Enviado': order.shipped_at ? new Date(order.shipped_at).toLocaleString('es-ES') : '',
      'Fecha Entregado': order.delivered_at ? new Date(order.delivered_at).toLocaleString('es-ES') : '',
      'Notas': order.notes || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Distribución Productos');

    const columnWidths = [
      { wch: 10 }, { wch: 30 }, { wch: 30 }, { wch: 30 },
      { wch: 30 }, { wch: 15 }, { wch: 10 }, { wch: 15 },
      { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 },
      { wch: 20 }, { wch: 30 },
    ];
    worksheet['!cols'] = columnWidths;

    const fileName = `reporte_distribucion_productos_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    showSuccess('Reporte exportado exitosamente');
  };

  const exportDashboardSummaryToExcel = () => {
    if (!dashboardSummaryData) return;

    const data = dashboardSummaryData;

    const exportData = [
      { 'Métrica': 'Total de Órdenes', 'Valor': data.total_orders },
      { 'Métrica': 'Cantidad Total Distribuida', 'Valor': data.total_quantity_distributed },
      { 'Métrica': 'Órdenes Pendientes', 'Valor': data.orders_by_status.pending },
      { 'Métrica': 'Órdenes en Proceso', 'Valor': data.orders_by_status.in_process },
      { 'Métrica': 'Órdenes Enviando', 'Valor': data.orders_by_status.shipped },
      { 'Métrica': 'Órdenes Entregadas', 'Valor': data.orders_by_status.delivered },
      { 'Métrica': 'Total Farmacias Servidas', 'Valor': data.total_pharmacies_served },
      { 'Métrica': 'Total Sub-Farmacias Servidas', 'Valor': data.total_sub_pharmacies_served },
    ];

    if (data.filters_applied.date_from || data.filters_applied.date_to) {
      exportData.push({ 'Métrica': '', 'Valor': '' });
      exportData.push({ 'Métrica': 'Filtros Aplicados', 'Valor': '' });
      if (data.filters_applied.date_from) {
        exportData.push({ 'Métrica': 'Fecha Inicio', 'Valor': data.filters_applied.date_from });
      }
      if (data.filters_applied.date_to) {
        exportData.push({ 'Métrica': 'Fecha Fin', 'Valor': data.filters_applied.date_to });
      }
    }

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Resumen Dashboard');

    const columnWidths = [{ wch: 35 }, { wch: 25 }];
    worksheet['!cols'] = columnWidths;

    const fileName = `resumen_dashboard_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    showSuccess('Reporte exportado exitosamente');
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'solicitud_enviada': '#fef3c7',
      'recibido': '#dbeafe',
      'en_proceso': '#fef3c7',
      'enviando': '#cffafe',
      'entregado': '#d1fae5',
      'recibido_farmacia': '#fef3c7',
    };
    return colors[status] || '#f3f4f6';
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  return (
    <DashboardLayout title="Reportes" subtitle="Genera y visualiza reportes detallados">
      <div className={styles.container}>
        {/* Date Filters */}
        <div className={styles.filtersSection}>
          <h3 className={styles.sectionTitle}>Filtros de Fecha</h3>
          <div className={styles.filtersGrid}>
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

          {(startDate || endDate) && (
            <button onClick={clearFilters} className={styles.clearFiltersButton}>
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Reports Cards */}
        <div className={styles.reportsSection}>
          <h3 className={styles.sectionTitle}>Reportes Disponibles</h3>
          <p className={styles.reportsDescription}>
            Selecciona un reporte para ver los datos basados en los filtros de fecha aplicados
          </p>

          <div className={styles.reportsGrid}>
            <div className={styles.reportCard}>
              <div className={styles.reportIcon} style={{ background: '#dbeafe' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <div className={styles.reportContent}>
                <h4>Cadenas de Farmacias</h4>
                <p>Reporte completo de cadenas con sus sucursales y estadísticas</p>
                <button onClick={loadPharmacyChainReport} className={styles.reportButton} disabled={loadingReport}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  {loadingReport && activeReport === 'pharmacy-chains' ? 'Cargando...' : 'Ver Reporte'}
                </button>
              </div>
            </div>

            <div className={styles.reportCard}>
              <div className={styles.reportIcon} style={{ background: '#fef3c7' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <div className={styles.reportContent}>
                <h4>Distribución de Productos</h4>
                <p>Detalle completo de productos distribuidos con información de órdenes</p>
                <button onClick={loadProductDistributionReport} className={styles.reportButton} disabled={loadingReport}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  {loadingReport && activeReport === 'product-distribution' ? 'Cargando...' : 'Ver Reporte'}
                </button>
              </div>
            </div>

            <div className={styles.reportCard}>
              <div className={styles.reportIcon} style={{ background: '#d1fae5' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <line x1="3" y1="9" x2="21" y2="9"/>
                  <line x1="9" y1="21" x2="9" y2="9"/>
                </svg>
              </div>
              <div className={styles.reportContent}>
                <h4>Resumen Dashboard</h4>
                <p>Resumen estadístico general con métricas clave del periodo</p>
                <button onClick={loadDashboardSummary} className={styles.reportButton} disabled={loadingReport}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  {loadingReport && activeReport === 'dashboard-summary' ? 'Cargando...' : 'Ver Reporte'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Report Data Display - Pharmacy Chains */}
        {activeReport === 'pharmacy-chains' && pharmacyChainData && (
          <div className={styles.reportDataSection}>
            <div className={styles.reportDataHeader}>
              <h3>Reporte: Cadenas de Farmacias</h3>
              <div className={styles.reportHeaderActions}>
                <button onClick={exportPharmacyChainToExcel} className={styles.exportReportButton}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Exportar a Excel
                </button>
                <button onClick={closeReport} className={styles.closeReportButton}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  Cerrar
                </button>
              </div>
            </div>
            <div className={styles.reportStats}>
              <p><strong>Total de Cadenas:</strong> {pharmacyChainData.pharmacies.filter((p: any) => p.grand_total.total_orders >= 1).length}</p>
              {pharmacyChainData.filters_applied.date_from && (
                <p><strong>Desde:</strong> {pharmacyChainData.filters_applied.date_from}</p>
              )}
              {pharmacyChainData.filters_applied.date_to && (
                <p><strong>Hasta:</strong> {pharmacyChainData.filters_applied.date_to}</p>
              )}
            </div>

            {pharmacyChainData.pharmacies.filter((p: any) => p.grand_total.total_orders >= 1).length === 0 ? (
              <div className={styles.noData}>
                <p>No hay farmacias con órdenes en el periodo seleccionado</p>
              </div>
            ) : (
              pharmacyChainData.pharmacies
                .filter((pharmacyData: any) => pharmacyData.grand_total.total_orders >= 1)
                .map((pharmacyData: any, idx: number) => (
                <div key={idx} className={styles.pharmacyChainBlock}>
                  <div className={styles.pharmacyMainInfo}>
                    <h4>{pharmacyData.pharmacy.commercial_name}</h4>
                    <p className={styles.legalName}>{pharmacyData.pharmacy.legal_name}</p>
                    <div className={styles.contactInfo}>
                      <span>{pharmacyData.pharmacy.phone}</span>
                      <span>{pharmacyData.pharmacy.email}</span>
                    </div>
                  </div>

                  <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                      <span className={styles.statLabel}>Total Órdenes</span>
                      <span className={styles.statValue}>{pharmacyData.grand_total.total_orders}</span>
                    </div>
                    <div className={styles.statCard}>
                      <span className={styles.statLabel}>Cantidad Total</span>
                      <span className={styles.statValue}>{pharmacyData.grand_total.total_quantity}</span>
                    </div>
                    <div className={styles.statCard}>
                      <span className={styles.statLabel}>Pendientes</span>
                      <span className={styles.statValue}>{pharmacyData.grand_total.by_status.pending?.count || 0}</span>
                    </div>
                    <div className={styles.statCard}>
                      <span className={styles.statLabel}>Entregadas</span>
                      <span className={styles.statValue}>{pharmacyData.grand_total.by_status.delivered?.count || 0}</span>
                    </div>
                  </div>

                  {pharmacyData.sub_pharmacies.length > 0 && (
                    <div className={styles.subPharmacies}>
                      <h5>Sucursales ({pharmacyData.sub_pharmacies_count})</h5>
                      <div className={styles.subPharmaciesList}>
                        {pharmacyData.sub_pharmacies.map((sub: any) => (
                          <div key={sub.id} className={styles.subPharmacyCard}>
                            <p className={styles.subName}>{sub.commercial_name}</p>
                            <div className={styles.subStats}>
                              <span>Órdenes: {sub.stats.total_orders}</span>
                              <span>Cantidad: {sub.stats.total_quantity}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Report Data Display - Product Distribution */}
        {activeReport === 'product-distribution' && productDistributionData && (
          <div className={styles.reportDataSection}>
            <div className={styles.reportDataHeader}>
              <h3>Reporte: Distribución de Productos</h3>
              <div className={styles.reportHeaderActions}>
                <button onClick={exportProductDistributionToExcel} className={styles.exportReportButton}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Exportar a Excel
                </button>
                <button onClick={closeReport} className={styles.closeReportButton}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  Cerrar
                </button>
              </div>
            </div>
            <p className={styles.reportStats}>
              <strong>Total de registros:</strong> {productDistributionData.total} |
              <strong> Mostrando:</strong> {productDistributionData.from} - {productDistributionData.to}
            </p>

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
                    <th>Solicitado</th>
                  </tr>
                </thead>
                <tbody>
                  {productDistributionData.data.map((order: any) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>
                        {order.pharmacy.commercial_name}
                        {order.sub_pharmacy && (
                          <span className={styles.subLabel}> - {order.sub_pharmacy.commercial_name}</span>
                        )}
                      </td>
                      <td>{order.product_dose.product.name}</td>
                      <td>{order.product_dose.dose}</td>
                      <td>{order.quantity_requested}</td>
                      <td>
                        <span className={styles.statusBadge} style={{ background: getStatusColor(order.status) }}>
                          {order.status}
                        </span>
                      </td>
                      <td>{new Date(order.requested_at).toLocaleDateString('es-ES')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Report Data Display - Dashboard Summary */}
        {activeReport === 'dashboard-summary' && dashboardSummaryData && (
          <div className={styles.reportDataSection}>
            <div className={styles.reportDataHeader}>
              <h3>Resumen Dashboard</h3>
              <div className={styles.reportHeaderActions}>
                <button onClick={exportDashboardSummaryToExcel} className={styles.exportReportButton}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Exportar a Excel
                </button>
                <button onClick={closeReport} className={styles.closeReportButton}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  Cerrar
                </button>
              </div>
            </div>

            <div className={styles.summaryGrid}>
              <div className={styles.summaryCard}>
                <h4>Total de Órdenes</h4>
                <p className={styles.bigNumber}>{dashboardSummaryData.total_orders}</p>
              </div>
              <div className={styles.summaryCard}>
                <h4>Cantidad Distribuida</h4>
                <p className={styles.bigNumber}>{dashboardSummaryData.total_quantity_distributed}</p>
              </div>
              <div className={styles.summaryCard}>
                <h4>Farmacias Servidas</h4>
                <p className={styles.bigNumber}>{dashboardSummaryData.total_pharmacies_served}</p>
              </div>
              <div className={styles.summaryCard}>
                <h4>Sub-Farmacias</h4>
                <p className={styles.bigNumber}>{dashboardSummaryData.total_sub_pharmacies_served}</p>
              </div>
            </div>

            <div className={styles.statusBreakdown}>
              <h4>Desglose por Estado</h4>
              <div className={styles.statusGrid}>
                <div className={styles.statusItem}>
                  <span className={styles.statusLabel}>Pendientes</span>
                  <span className={styles.statusValue}>{dashboardSummaryData.orders_by_status.pending}</span>
                </div>
                <div className={styles.statusItem}>
                  <span className={styles.statusLabel}>En Proceso</span>
                  <span className={styles.statusValue}>{dashboardSummaryData.orders_by_status.in_process}</span>
                </div>
                <div className={styles.statusItem}>
                  <span className={styles.statusLabel}>Enviando</span>
                  <span className={styles.statusValue}>{dashboardSummaryData.orders_by_status.shipped}</span>
                </div>
                <div className={styles.statusItem}>
                  <span className={styles.statusLabel}>Entregadas</span>
                  <span className={styles.statusValue}>{dashboardSummaryData.orders_by_status.delivered}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </DashboardLayout>
  );
}
