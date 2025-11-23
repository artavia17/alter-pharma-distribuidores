import {
  DistributorsListResponse,
  DistributorDetailResponse,
  DistributorOrdersResponse,
} from '../../types/services/protected/distributors.types';
import api from '../api';

const getDistributors = async () => {
  const response = await api.get<DistributorsListResponse>('/distributor/distributors');
  return response.data;
};

const getDistributorDetail = async (distributorId: number) => {
  const response = await api.get<DistributorDetailResponse>(`/distributor/distributors/${distributorId}`);
  return response.data;
};

const getDistributorOrders = async (distributorId: number, status?: string) => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);

  const queryString = params.toString();
  const url = queryString
    ? `/distributor/distributors/${distributorId}/restock-orders?${queryString}`
    : `/distributor/distributors/${distributorId}/restock-orders`;

  const response = await api.get<DistributorOrdersResponse>(url);
  return response.data;
};

export {
  getDistributors,
  getDistributorDetail,
  getDistributorOrders,
};
