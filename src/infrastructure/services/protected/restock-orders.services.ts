import {
  RestockOrdersResponse,
  RestockOrderDetailResponse,
  RestockOrdersSummaryResponse,
  PharmaciesResponse,
  UpdateStatusRequest,
  UpdateStatusResponse,
} from '../../types/services/protected/restock-orders.types';
import api from '../api';

const getRestockOrders = async (status?: string, pharmacy_id?: number) => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (pharmacy_id) params.append('pharmacy_id', pharmacy_id.toString());

  const queryString = params.toString();
  const url = queryString ? `/distributor/restock-orders?${queryString}` : '/distributor/restock-orders';

  const response = await api.get<RestockOrdersResponse>(url);
  return response.data;
};

const getRestockOrdersSummary = async () => {
  const response = await api.get<RestockOrdersSummaryResponse>('/distributor/restock-orders/summary');
  return response.data;
};

const getPharmacies = async () => {
  const response = await api.get<PharmaciesResponse>('/distributor/restock-orders/pharmacies');
  return response.data;
};

const getRestockOrderDetail = async (orderId: number) => {
  const response = await api.get<RestockOrderDetailResponse>(`/distributor/restock-orders/${orderId}`);
  return response.data;
};

const updateOrderStatus = async (orderId: number, data: UpdateStatusRequest) => {
  const response = await api.patch<UpdateStatusResponse>(`/distributor/restock-orders/${orderId}/status`, data);
  return response.data;
};

export {
  getRestockOrders,
  getRestockOrdersSummary,
  getPharmacies,
  getRestockOrderDetail,
  updateOrderStatus,
};
