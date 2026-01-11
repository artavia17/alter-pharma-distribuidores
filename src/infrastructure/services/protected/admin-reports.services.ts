import api from '../api';
import type {
  DistributorsReportResponse,
  DistributorDetailedReportResponse,
  GlobalSummaryResponse,
  DistributorsReportFilters,
  DistributorDetailedFilters,
  GlobalSummaryFilters,
} from '../../types/services/protected/admin-reports.types';

/**
 * Get all distributors report
 */
export const getDistributorsReport = async (filters?: DistributorsReportFilters) => {
  const params = new URLSearchParams();

  if (filters?.distributor_id) {
    params.append('distributor_id', filters.distributor_id.toString());
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
  const url = `/administrator/reports/distributors${queryString ? `?${queryString}` : ''}`;

  const response = await api.get<DistributorsReportResponse>(url);
  return response.data;
};

/**
 * Get detailed report for a specific distributor
 */
export const getDistributorDetailedReport = async (
  distributorId: number,
  filters?: DistributorDetailedFilters
) => {
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
  const url = `/administrator/reports/distributors/${distributorId}/detailed${queryString ? `?${queryString}` : ''}`;

  const response = await api.get<DistributorDetailedReportResponse>(url);
  return response.data;
};

/**
 * Get global summary report
 */
export const getGlobalSummary = async (filters?: GlobalSummaryFilters) => {
  const params = new URLSearchParams();

  if (filters?.date_from) {
    params.append('date_from', filters.date_from);
  }
  if (filters?.date_to) {
    params.append('date_to', filters.date_to);
  }

  const queryString = params.toString();
  const url = `/administrator/reports/distributors/global-summary${queryString ? `?${queryString}` : ''}`;

  const response = await api.get<GlobalSummaryResponse>(url);
  return response.data;
};
