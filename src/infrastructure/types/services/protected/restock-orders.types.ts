import { ApiResponse } from '../api.types';

export type RestockOrderStatus = 'solicitud_enviada' | 'recibido' | 'en_proceso' | 'enviando' | 'entregado';

export interface Pharmacy {
  id: number;
  commercial_name: string;
  phone?: string;
  email?: string;
  street_address?: string;
  legal_name?: string;
  identification_number?: string;
  administrator_name?: string;
  is_chain?: boolean;
  status?: boolean;
  country_id?: number;
  state_id?: number;
  municipality_id?: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
}

export interface Dose {
  id: number;
  dose: string;
}

export interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  second_last_name: string;
  identification_type: string;
  identification_number: string;
  email: string;
  phone: string;
}

export interface RedemptionTransaction {
  id: number;
  redemption_date: string;
  patient: Patient;
}

export interface TimelineItem {
  status: RestockOrderStatus;
  label: string;
  date: string | null;
  completed: boolean;
}

export interface RestockOrder {
  id: number;
  pharmacy: Pharmacy;
  product: Product;
  dose: Dose;
  quantity_requested: number;
  status: RestockOrderStatus;
  status_label: string;
  requested_at: string;
  received_at: string | null;
  processed_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  days_since_request: number;
  redemption_transaction_id: number;
  notes: string;
  created_at: string;
}

export interface RestockOrderDetail extends RestockOrder {
  redemption_transaction: RedemptionTransaction;
  timeline: TimelineItem[];
  updated_at: string;
}

export interface RestockOrdersSummary {
  total: number;
  solicitud_enviada: number;
  recibido: number;
  en_proceso: number;
  enviando: number;
  entregado: number;
  recibido_farmacia: number;
  pending: number;
}

export interface UpdateStatusRequest {
  status: RestockOrderStatus;
  notes?: string;
}

export type RestockOrdersResponse = ApiResponse<RestockOrder[]>;
export type RestockOrderDetailResponse = ApiResponse<RestockOrderDetail>;
export type RestockOrdersSummaryResponse = ApiResponse<RestockOrdersSummary>;
export type PharmaciesResponse = ApiResponse<Pharmacy[]>;
export type UpdateStatusResponse = ApiResponse<{ message: string }>;
