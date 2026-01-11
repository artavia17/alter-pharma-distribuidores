// Pharmacy Chain Reports
export interface PharmacyChainFilters {
  pharmacy_id?: number;
  search?: string;
  date_from?: string;
  date_to?: string;
}

export interface TopProduct {
  product_name: string;
  dose: string;
  order_count: number;
  total_quantity: number;
}

export interface StatusBreakdown {
  count: number;
  quantity: number;
}

export interface OrdersByStatus {
  pending?: StatusBreakdown;
  in_process?: StatusBreakdown;
  shipped?: StatusBreakdown;
  delivered?: StatusBreakdown;
}

export interface PharmacyStats {
  total_orders: number;
  total_quantity: number;
  by_status: OrdersByStatus;
  top_products: TopProduct[];
}

export interface SubPharmacy {
  id: number;
  commercial_name: string;
  phone: string;
  email: string;
  stats: PharmacyStats;
}

export interface Pharmacy {
  id: number;
  legal_name: string;
  commercial_name: string;
  phone: string;
  email: string;
  address: string;
  is_chain: boolean;
}

export interface PharmacyChainData {
  pharmacy: Pharmacy;
  main_pharmacy_stats: PharmacyStats;
  sub_pharmacies: SubPharmacy[];
  sub_pharmacies_count: number;
  sub_pharmacies_total: {
    total_orders: number;
    total_quantity: number;
    by_status: OrdersByStatus;
  };
  grand_total: {
    total_orders: number;
    total_quantity: number;
    by_status: OrdersByStatus;
  };
}

export interface PharmacyChainReport {
  distributor_id: number;
  total_chains: number;
  filters_applied: {
    date_from?: string;
    date_to?: string;
  };
  pharmacies: PharmacyChainData[];
}

// Product Distribution Reports
export interface ProductDistributionFilters {
  status?: string;
  pharmacy_id?: number;
  product_id?: number;
  date_from?: string;
  date_to?: string;
  per_page?: number;
  page?: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  product_group_id: number;
}

export interface ProductDose {
  id: number;
  dose: string;
  product_id: number;
  product: Product;
}

export interface PharmacyInfo {
  id: number;
  legal_name: string;
  commercial_name: string;
  phone: string;
  email: string;
}

export interface SubPharmacyInfo {
  id: number;
  commercial_name: string;
  phone: string;
  email: string;
}

export interface ProductDistributionOrder {
  id: number;
  pharmacy_id: number;
  distributor_id: number;
  product_dose_id: number;
  redemption_transaction_id: number;
  quantity_requested: number;
  status: string;
  requested_at: string;
  received_at: string | null;
  processed_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  notes: string | null;
  product_dose: ProductDose;
  pharmacy: PharmacyInfo;
  sub_pharmacy: SubPharmacyInfo | null;
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface ProductDistributionReport {
  current_page: number;
  data: ProductDistributionOrder[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

// Dashboard Summary Reports
export interface DashboardSummaryFilters {
  date_from?: string;
  date_to?: string;
}

export interface DashboardSummary {
  total_orders: number;
  total_quantity_distributed: number;
  orders_by_status: {
    pending: number;
    in_process: number;
    shipped: number;
    delivered: number;
  };
  total_pharmacies_served: number;
  total_sub_pharmacies_served: number;
  filters_applied: {
    date_from?: string;
    date_to?: string;
  };
}

// API Response Types
export interface PharmacyChainReportResponse {
  success: boolean;
  data: PharmacyChainReport;
}

export interface ProductDistributionReportResponse {
  success: boolean;
  data: ProductDistributionReport;
}

export interface DashboardSummaryResponse {
  success: boolean;
  data: DashboardSummary;
}
