import api from '../api';
import type {
  PharmacyChainReportResponse,
  ProductDistributionReportResponse,
  DashboardSummaryResponse,
  PharmacyChainFilters,
  ProductDistributionFilters,
  DashboardSummaryFilters,
} from '../../types/services/protected/reports.types';

/**
 * Get pharmacy chains report
 */
export const getPharmacyChainReport = async (filters?: PharmacyChainFilters) => {
  const params = new URLSearchParams();

  if (filters?.pharmacy_id) {
    params.append('pharmacy_id', filters.pharmacy_id.toString());
  }
  if (filters?.search) {
    params.append('search', filters.search);
  }
  if (filters?.date_from) {
    params.append('date_from', filters.date_from);
  }
  if (filters?.date_to) {
    params.append('date_to', filters.date_to);
  }

  const queryString = params.toString();
  const url = `/distributor/reports/pharmacy-chains${queryString ? `?${queryString}` : ''}`;

  const response = await api.get<PharmacyChainReportResponse>(url);
  return response.data;
};

/**
 * Get product distribution report (paginated)
 */
export const getProductDistributionReport = async (filters?: ProductDistributionFilters) => {
  const params = new URLSearchParams();

  if (filters?.status) {
    params.append('status', filters.status);
  }
  if (filters?.pharmacy_id) {
    params.append('pharmacy_id', filters.pharmacy_id.toString());
  }
  if (filters?.product_id) {
    params.append('product_id', filters.product_id.toString());
  }
  if (filters?.date_from) {
    params.append('date_from', filters.date_from);
  }
  if (filters?.date_to) {
    params.append('date_to', filters.date_to);
  }
  if (filters?.per_page) {
    params.append('per_page', filters.per_page.toString());
  }
  if (filters?.page) {
    params.append('page', filters.page.toString());
  }

  const queryString = params.toString();
  const url = `/distributor/reports/product-distribution${queryString ? `?${queryString}` : ''}`;

  const response = await api.get<ProductDistributionReportResponse>(url);
  return response.data;
};

/**
 * Get dashboard summary report
 */
export const getDashboardSummary = async (filters?: DashboardSummaryFilters) => {
  const params = new URLSearchParams();

  if (filters?.date_from) {
    params.append('date_from', filters.date_from);
  }
  if (filters?.date_to) {
    params.append('date_to', filters.date_to);
  }

  const queryString = params.toString();
  const url = `/distributor/reports/dashboard-summary${queryString ? `?${queryString}` : ''}`;

  const response = await api.get<DashboardSummaryResponse>(url);
  return response.data;
};
