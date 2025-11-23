import { ApiResponse } from '../api.types';

// Country
export interface DistributorCountry {
  id: number;
  name: string;
  code: string;
  phone_code: string;
  identification_min_length: string;
  identification_max_length: string;
  phone_min_length: string;
  phone_max_length: string;
  status: boolean;
  created_at: string;
  updated_at: string;
}

// State
export interface DistributorState {
  id: number;
  country_id: string;
  name: string;
  code: string | null;
  status: boolean;
  created_at: string;
  updated_at: string;
}

// Municipality
export interface DistributorMunicipality {
  id: number;
  state_id: string;
  name: string;
  code: string;
  status: boolean;
  created_at: string;
  updated_at: string;
}

// Distributor List Item
export interface DistributorListItem {
  id: number;
  business_name: string;
  contact_person_name: string;
  identification_number: string;
  email: string;
  phone: string;
  street_address: string;
  status: boolean;
  last_login: string;
  country: DistributorCountry;
  state: DistributorState;
  municipality: DistributorMunicipality;
  pending_orders_count: number;
  created_at: string;
}

// Distributor Detail
export interface DistributorDetail {
  id: number;
  country_id: string;
  state_id: string;
  municipality_id: string;
  business_name: string;
  identification_number: string;
  street_address: string;
  phone: string;
  email: string;
  contact_person_name: string;
  status: boolean;
  last_login: string;
  created_at: string;
  updated_at: string;
  country: DistributorCountry;
  state: DistributorState;
  municipality: DistributorMunicipality;
}

// Orders Summary
export interface DistributorOrdersSummary {
  recibido_farmacia: string;
}

// Distributor Detail Response Data
export interface DistributorDetailData {
  distributor: DistributorDetail;
  orders_summary: DistributorOrdersSummary;
}

// Pharmacy for orders
export interface OrderPharmacy {
  id: number;
  commercial_name: string;
  email: string;
  phone: string;
}

// Product for orders
export interface OrderProduct {
  id: number;
  name: string;
  description: string;
}

// Dose for orders
export interface OrderDose {
  id: number;
  dose: string;
}

// Restock Order Status
export type DistributorRestockOrderStatus =
  | 'solicitud_enviada'
  | 'recibido'
  | 'en_proceso'
  | 'enviando'
  | 'entregado'
  | 'recibido_farmacia';

// Distributor Restock Order
export interface DistributorRestockOrder {
  id: number;
  pharmacy: OrderPharmacy;
  product: OrderProduct;
  dose: OrderDose;
  quantity_requested: number;
  status: DistributorRestockOrderStatus;
  status_label: string;
  requested_at: string;
  received_at: string | null;
  processed_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  pharmacy_received_at: string | null;
  days_since_request: number;
  notes: string | null;
  created_at: string;
}

// Distributor Orders Response Data
export interface DistributorOrdersData {
  distributor: {
    id: number;
    business_name: string;
  };
  orders: DistributorRestockOrder[];
}

// API Responses
export type DistributorsListResponse = ApiResponse<DistributorListItem[]>;
export type DistributorDetailResponse = ApiResponse<DistributorDetailData>;
export type DistributorOrdersResponse = ApiResponse<DistributorOrdersData>;
