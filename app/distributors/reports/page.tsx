'use client';

import { useState } from 'react';
import DashboardLayout from '@/src/presentation/components/layout/DashboardLayout';
import Toast from '@/src/presentation/components/common/Toast';
import { useToast } from '@/src/presentation/hooks/useToast';
import {
  getDistributorsReport,
  getDistributorDetailedReport,
  getGlobalSummary,
} from '@/src/infrastructure/services/protected/admin-reports.services';
import type {
  DistributorsReport,
  DistributorDetailedReport,
  GlobalSummary,
} from '@/src/infrastructure/types/services/protected/admin-reports.types';
import styles from './admin-reports.module.scss';
import * as XLSX from 'xlsx';

export default function AdminReportsPage() {
  const { toast, showSuccess, showError, hideToast } = useToast();

  // Reports state
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [distributorsReportData, setDistributorsReportData] = useState<DistributorsReport | null>(null);
  const [distributorDetailedData, setDistributorDetailedData] = useState<DistributorDetailedReport | null>(null);
  const [globalSummaryData, setGlobalSummaryData] = useState<GlobalSummary | null>(null);

  // Filters
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedDistributorId, setSelectedDistributorId] = useState<string>('');

  // Load reports functions
  const loadDistributorsReport = async () => {
    try {
      setLoadingReport(true);
      setActiveReport('distributors');

      const filters = {
        date_from: startDate || undefined,
        date_to: endDate || undefined,
      };

      const response = await getDistributorsReport(filters);

      if (response.success) {
        setDistributorsReportData(response.data);
      }
    } catch (error) {
      console.error('Error loading distributors report:', error);
      showError('Error al cargar el reporte de distribuidores');
    } finally {
      setLoadingReport(false);
    }
  };

  const loadDistributorDetailedReport = async () => {
    if (!selectedDistributorId) {
      showError('Por favor selecciona un distribuidor');
      return;
    }

    try {
      setLoadingReport(true);
      setActiveReport('distributor-detailed');

      const filters = {
        date_from: startDate || undefined,
        date_to: endDate || undefined,
      };

      const response = await getDistributorDetailedReport(Number(selectedDistributorId), filters);

      if (response.success) {
        setDistributorDetailedData(response.data);
      }
    } catch (error) {
      console.error('Error loading distributor detailed report:', error);
      showError('Error al cargar el reporte detallado del distribuidor');
    } finally {
      setLoadingReport(false);
    }
  };

  const loadGlobalSummary = async () => {
    try {
      setLoadingReport(true);
      setActiveReport('global-summary');

      const filters = {
        date_from: startDate || undefined,
        date_to: endDate || undefined,
      };

      const response = await getGlobalSummary(filters);

      if (response.success) {
        setGlobalSummaryData(response.data);
      }
    } catch (error) {
      console.error('Error loading global summary:', error);
      showError('Error al cargar el resumen global');
    } finally {
      setLoadingReport(false);
    }
  };

  const closeReport = () => {
    setActiveReport(null);
    setDistributorsReportData(null);
    setDistributorDetailedData(null);
    setGlobalSummaryData(null);
  };

  // Export functions
  const exportDistributorsToExcel = () => {
    if (!distributorsReportData) return;

    const exportData = distributorsReportData.distributors.map((item: any) => ({
      'ID': item.distributor.id,
      'Empresa': item.distributor.business_name,
      'Contacto': item.distributor.contact_person_name,
      'Teléfono': item.distributor.phone,
      'Email': item.distributor.email,
      'Dirección': item.distributor.address,
      'Total Órdenes': item.stats.total_orders,
      'Cantidad Total': item.stats.total_quantity,
      'Pendientes': item.stats.by_status.pending?.count || 0,
      'En Proceso': item.stats.by_status.in_process?.count || 0,
      'Enviando': item.stats.by_status.shipped?.count || 0,
      'Entregadas': item.stats.by_status.delivered?.count || 0,
      'Farmacias Servidas': item.stats.pharmacies_served,
      'Sub-Farmacias': item.stats.sub_pharmacies_served,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Distribuidores');

    const columnWidths = [
      { wch: 8 }, { wch: 35 }, { wch: 25 }, { wch: 15 },
      { wch: 30 }, { wch: 40 }, { wch: 12 }, { wch: 12 },
      { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
      { wch: 12 }, { wch: 12 },
    ];
    worksheet['!cols'] = columnWidths;

    const fileName = `reporte_distribuidores_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    showSuccess('Reporte exportado exitosamente');
  };

  const exportDistributorDetailedToExcel = () => {
    if (!distributorDetailedData) return;

    const exportData: any[] = [];

    // Distributor info
    exportData.push({
      'Información': 'Distribuidor',
      'Valor': distributorDetailedData.distributor.business_name,
    });
    exportData.push({
      'Información': 'Contacto',
      'Valor': distributorDetailedData.distributor.contact_person_name,
    });
    exportData.push({
      'Información': 'Teléfono',
      'Valor': distributorDetailedData.distributor.phone,
    });
    exportData.push({
      'Información': 'Email',
      'Valor': distributorDetailedData.distributor.email,
    });
    exportData.push({});

    // Pharmacies
    distributorDetailedData.pharmacies
      .filter((p: any) => p.grand_total.total_orders >= 1)
      .forEach((pharmacy: any) => {
        exportData.push({
          'Tipo': 'Farmacia Principal',
          'Nombre': pharmacy.pharmacy.commercial_name,
          'Total Órdenes': pharmacy.main_pharmacy_stats.total_orders,
          'Cantidad': pharmacy.main_pharmacy_stats.total_quantity,
          'Pendientes': pharmacy.main_pharmacy_stats.by_status.pending?.count || 0,
          'Entregadas': pharmacy.main_pharmacy_stats.by_status.delivered?.count || 0,
        });

        pharmacy.sub_pharmacies.forEach((sub: any) => {
          exportData.push({
            'Tipo': 'Sucursal',
            'Nombre': sub.commercial_name,
            'Total Órdenes': sub.stats.total_orders,
            'Cantidad': sub.stats.total_quantity,
            'Pendientes': sub.stats.by_status.pending?.count || 0,
            'Entregadas': sub.stats.by_status.delivered?.count || 0,
          });
        });

        exportData.push({
          'Tipo': 'TOTAL',
          'Nombre': pharmacy.pharmacy.commercial_name,
          'Total Órdenes': pharmacy.grand_total.total_orders,
          'Cantidad': pharmacy.grand_total.total_quantity,
          'Pendientes': pharmacy.grand_total.by_status.pending?.count || 0,
          'Entregadas': pharmacy.grand_total.by_status.delivered?.count || 0,
        });
        exportData.push({});
      });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Detalle Distribuidor');

    const columnWidths = [
      { wch: 20 }, { wch: 40 }, { wch: 15 },
      { wch: 15 }, { wch: 12 }, { wch: 12 },
    ];
    worksheet['!cols'] = columnWidths;

    const fileName = `detalle_distribuidor_${distributorDetailedData.distributor.business_name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    showSuccess('Reporte exportado exitosamente');
  };

  const exportGlobalSummaryToExcel = () => {
    if (!globalSummaryData) return;

    const exportData: Array<{ 'Métrica': string; 'Valor': string | number }> = [
      { 'Métrica': 'Total de Órdenes', 'Valor': globalSummaryData.total_orders },
      { 'Métrica': 'Cantidad Total Distribuida', 'Valor': globalSummaryData.total_quantity_distributed },
      { 'Métrica': 'Órdenes Pendientes', 'Valor': globalSummaryData.orders_by_status.pending },
      { 'Métrica': 'Órdenes en Proceso', 'Valor': globalSummaryData.orders_by_status.in_process },
      { 'Métrica': 'Órdenes Enviando', 'Valor': globalSummaryData.orders_by_status.shipped },
      { 'Métrica': 'Órdenes Entregadas', 'Valor': globalSummaryData.orders_by_status.delivered },
      { 'Métrica': 'Total Distribuidores', 'Valor': globalSummaryData.total_distributors },
      { 'Métrica': 'Distribuidores Activos', 'Valor': globalSummaryData.active_distributors },
    ];

    if (globalSummaryData.filters_applied.date_from || globalSummaryData.filters_applied.date_to) {
      exportData.push({ 'Métrica': '', 'Valor': '' });
      exportData.push({ 'Métrica': 'Filtros Aplicados', 'Valor': '' });
      if (globalSummaryData.filters_applied.date_from) {
        exportData.push({ 'Métrica': 'Fecha Inicio', 'Valor': globalSummaryData.filters_applied.date_from });
      }
      if (globalSummaryData.filters_applied.date_to) {
        exportData.push({ 'Métrica': 'Fecha Fin', 'Valor': globalSummaryData.filters_applied.date_to });
      }
    }

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Resumen Global');

    const columnWidths = [{ wch: 35 }, { wch: 25 }];
    worksheet['!cols'] = columnWidths;

    const fileName = `resumen_global_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    showSuccess('Reporte exportado exitosamente');
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedDistributorId('');
  };

  return (
    <DashboardLayout title="Reportes Administrativos" subtitle="Reportes globales del sistema de distribución">
      <div className={styles.container}>
        {/* Date Filters */}
        <div className={styles.filtersSection}>
          <h3 className={styles.sectionTitle}>Filtros</h3>
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

          {(startDate || endDate || selectedDistributorId) && (
            <button onClick={clearFilters} className={styles.clearFiltersButton}>
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Reports Cards */}
        <div className={styles.reportsSection}>
          <h3 className={styles.sectionTitle}>Reportes Disponibles</h3>
          <p className={styles.reportsDescription}>
            Selecciona un reporte para ver los datos del sistema de distribución
          </p>

          <div className={styles.reportsGrid}>
            <div className={styles.reportCard}>
              <div className={styles.reportIcon} style={{ background: '#dbeafe' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div className={styles.reportContent}>
                <h4>Todos los Distribuidores</h4>
                <p>Lista completa de distribuidores con sus estadísticas de rendimiento</p>
                <button onClick={loadDistributorsReport} className={styles.reportButton} disabled={loadingReport}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  {loadingReport && activeReport === 'distributors' ? 'Cargando...' : 'Ver Reporte'}
                </button>
              </div>
            </div>

            <div className={styles.reportCard}>
              <div className={styles.reportIcon} style={{ background: '#fef3c7' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <div className={styles.reportContent}>
                <h4>Detalle de Distribuidor</h4>
                <p>Reporte detallado de un distribuidor específico con todas sus farmacias</p>
                <div className={styles.selectWrapper}>
                  <select
                    value={selectedDistributorId}
                    onChange={(e) => setSelectedDistributorId(e.target.value)}
                    className={styles.select}
                  >
                    <option value="">Selecciona un distribuidor</option>
                    {distributorsReportData?.distributors.map((item: any) => (
                      <option key={item.distributor.id} value={item.distributor.id}>
                        {item.distributor.business_name}
                      </option>
                    ))}
                  </select>
                </div>
                <button onClick={loadDistributorDetailedReport} className={styles.reportButton} disabled={loadingReport || !selectedDistributorId}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  {loadingReport && activeReport === 'distributor-detailed' ? 'Cargando...' : 'Ver Reporte'}
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
                <h4>Resumen Global</h4>
                <p>Resumen estadístico de todo el sistema de distribución</p>
                <button onClick={loadGlobalSummary} className={styles.reportButton} disabled={loadingReport}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  {loadingReport && activeReport === 'global-summary' ? 'Cargando...' : 'Ver Reporte'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Report Data Display - Distributors */}
        {activeReport === 'distributors' && distributorsReportData && (
          <div className={styles.reportDataSection}>
            <div className={styles.reportDataHeader}>
              <h3>Reporte: Todos los Distribuidores</h3>
              <div className={styles.reportHeaderActions}>
                <button onClick={exportDistributorsToExcel} className={styles.exportReportButton}>
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
              <p><strong>Total de Distribuidores:</strong> {distributorsReportData.total_distributors}</p>
              {distributorsReportData.filters_applied.date_from && (
                <p><strong>Desde:</strong> {distributorsReportData.filters_applied.date_from}</p>
              )}
              {distributorsReportData.filters_applied.date_to && (
                <p><strong>Hasta:</strong> {distributorsReportData.filters_applied.date_to}</p>
              )}
            </div>

            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Empresa</th>
                    <th>Contacto</th>
                    <th>Teléfono</th>
                    <th>Órdenes</th>
                    <th>Cantidad</th>
                    <th>Farmacias</th>
                    <th>Pendientes</th>
                    <th>Entregadas</th>
                  </tr>
                </thead>
                <tbody>
                  {distributorsReportData.distributors.map((item: any) => (
                    <tr key={item.distributor.id}>
                      <td>{item.distributor.business_name}</td>
                      <td>{item.distributor.contact_person_name}</td>
                      <td>{item.distributor.phone}</td>
                      <td>{item.stats.total_orders}</td>
                      <td>{item.stats.total_quantity}</td>
                      <td>{item.stats.pharmacies_served}</td>
                      <td>{item.stats.by_status.pending?.count || 0}</td>
                      <td>{item.stats.by_status.delivered?.count || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Report Data Display - Distributor Detailed */}
        {activeReport === 'distributor-detailed' && distributorDetailedData && (
          <div className={styles.reportDataSection}>
            <div className={styles.reportDataHeader}>
              <h3>Reporte: Detalle de {distributorDetailedData.distributor.business_name}</h3>
              <div className={styles.reportHeaderActions}>
                <button onClick={exportDistributorDetailedToExcel} className={styles.exportReportButton}>
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

            <div className={styles.distributorInfo}>
              <div className={styles.infoCard}>
                <span className={styles.infoLabel}>Contacto:</span>
                <span className={styles.infoValue}>{distributorDetailedData.distributor.contact_person_name}</span>
              </div>
              <div className={styles.infoCard}>
                <span className={styles.infoLabel}>Teléfono:</span>
                <span className={styles.infoValue}>{distributorDetailedData.distributor.phone}</span>
              </div>
              <div className={styles.infoCard}>
                <span className={styles.infoLabel}>Email:</span>
                <span className={styles.infoValue}>{distributorDetailedData.distributor.email}</span>
              </div>
              <div className={styles.infoCard}>
                <span className={styles.infoLabel}>Farmacias Servidas:</span>
                <span className={styles.infoValue}>{distributorDetailedData.total_pharmacies_served}</span>
              </div>
            </div>

            {distributorDetailedData.pharmacies.filter((p: any) => p.grand_total.total_orders >= 1).length === 0 ? (
              <div className={styles.noData}>
                <p>No hay farmacias con órdenes en el periodo seleccionado</p>
              </div>
            ) : (
              distributorDetailedData.pharmacies
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

                  {/* Top Products */}
                  {pharmacyData.main_pharmacy_stats.top_products && pharmacyData.main_pharmacy_stats.top_products.length > 0 && (
                    <div className={styles.topProducts}>
                      <h5>Top 5 Productos Más Distribuidos</h5>
                      <div className={styles.productsList}>
                        {pharmacyData.main_pharmacy_stats.top_products.map((product: any, pIdx: number) => (
                          <div key={pIdx} className={styles.productItem}>
                            <div className={styles.productRank}>{pIdx + 1}</div>
                            <div className={styles.productInfo}>
                              <p className={styles.productName}>{product.product_name}</p>
                              <p className={styles.productDose}>{product.dose}</p>
                            </div>
                            <div className={styles.productStats}>
                              <span>{product.order_count} órdenes</span>
                              <span>{product.total_quantity} unidades</span>
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

        {/* Report Data Display - Global Summary */}
        {activeReport === 'global-summary' && globalSummaryData && (
          <div className={styles.reportDataSection}>
            <div className={styles.reportDataHeader}>
              <h3>Resumen Global del Sistema</h3>
              <div className={styles.reportHeaderActions}>
                <button onClick={exportGlobalSummaryToExcel} className={styles.exportReportButton}>
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
                <p className={styles.bigNumber}>{globalSummaryData.total_orders}</p>
              </div>
              <div className={styles.summaryCard}>
                <h4>Cantidad Distribuida</h4>
                <p className={styles.bigNumber}>{globalSummaryData.total_quantity_distributed}</p>
              </div>
              <div className={styles.summaryCard}>
                <h4>Total Distribuidores</h4>
                <p className={styles.bigNumber}>{globalSummaryData.total_distributors}</p>
              </div>
              <div className={styles.summaryCard}>
                <h4>Distribuidores Activos</h4>
                <p className={styles.bigNumber}>{globalSummaryData.active_distributors}</p>
              </div>
            </div>

            <div className={styles.statusBreakdown}>
              <h4>Desglose por Estado</h4>
              <div className={styles.statusGrid}>
                <div className={styles.statusItem}>
                  <span className={styles.statusLabel}>Pendientes</span>
                  <span className={styles.statusValue}>{globalSummaryData.orders_by_status.pending}</span>
                </div>
                <div className={styles.statusItem}>
                  <span className={styles.statusLabel}>En Proceso</span>
                  <span className={styles.statusValue}>{globalSummaryData.orders_by_status.in_process}</span>
                </div>
                <div className={styles.statusItem}>
                  <span className={styles.statusLabel}>Enviando</span>
                  <span className={styles.statusValue}>{globalSummaryData.orders_by_status.shipped}</span>
                </div>
                <div className={styles.statusItem}>
                  <span className={styles.statusLabel}>Entregadas</span>
                  <span className={styles.statusValue}>{globalSummaryData.orders_by_status.delivered}</span>
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
