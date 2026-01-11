// Administrator Reports Types

// Distributors List Report
export interface DistributorsReportFilters {
  distributor_id?: number;
  search?: string;
  date_from?: string;
  date_to?: string;
}

export interface DistributorInfo {
  id: number;
  business_name: string;
  contact_person_name: string;
  phone: string;
  email: string;
  address: string;
}

export interface StatusBreakdown {
  count: number;
  quantity: number;
}

export interface DistributorStats {
  total_orders: number;
  total_quantity: number;
  by_status: {
    pending?: StatusBreakdown;
    in_process?: StatusBreakdown;
    shipped?: StatusBreakdown;
    delivered?: StatusBreakdown;
  };
  pharmacies_served: number;
  sub_pharmacies_served: number;
}

export interface DistributorReportItem {
  distributor: DistributorInfo;
  stats: DistributorStats;
}

export interface DistributorsReport {
  total_distributors: number;
  filters_applied: {
    date_from?: string;
    date_to?: string;
  };
  distributors: DistributorReportItem[];
}

export interface DistributorsReportResponse {
  success: boolean;
  data: DistributorsReport;
}

// Distributor Detailed Report
export interface DistributorDetailedFilters {
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

export interface PharmacyStats {
  total_orders: number;
  total_quantity: number;
  by_status: {
    pending?: StatusBreakdown;
    in_process?: StatusBreakdown;
    shipped?: StatusBreakdown;
    delivered?: StatusBreakdown;
  };
  top_products: TopProduct[];
}

export interface SubPharmacyDetailed {
  id: number;
  commercial_name: string;
  phone: string;
  email: string;
  stats: PharmacyStats;
}

export interface PharmacyInfo {
  id: number;
  legal_name: string;
  commercial_name: string;
  phone: string;
  email: string;
  address: string;
  is_chain: boolean;
}

export interface PharmacyDetailedData {
  pharmacy: PharmacyInfo;
  main_pharmacy_stats: PharmacyStats;
  sub_pharmacies: SubPharmacyDetailed[];
  sub_pharmacies_count: number;
  sub_pharmacies_total: {
    total_orders: number;
    total_quantity: number;
    by_status: {
      pending?: StatusBreakdown;
      in_process?: StatusBreakdown;
      shipped?: StatusBreakdown;
      delivered?: StatusBreakdown;
    };
  };
  grand_total: {
    total_orders: number;
    total_quantity: number;
    by_status: {
      pending?: StatusBreakdown;
      in_process?: StatusBreakdown;
      shipped?: StatusBreakdown;
      delivered?: StatusBreakdown;
    };
  };
}

export interface DistributorDetailedReport {
  distributor: {
    id: number;
    business_name: string;
    contact_person_name: string;
    phone: string;
    email: string;
  };
  total_pharmacies_served: number;
  pharmacies: PharmacyDetailedData[];
  filters_applied: {
    date_from?: string;
    date_to?: string;
  };
}

export interface DistributorDetailedReportResponse {
  success: boolean;
  data: DistributorDetailedReport;
}

// Global Summary Report
export interface GlobalSummaryFilters {
  date_from?: string;
  date_to?: string;
}

export interface GlobalSummary {
  total_orders: number;
  total_quantity_distributed: number;
  orders_by_status: {
    pending: number;
    in_process: number;
    shipped: number;
    delivered: number;
  };
  total_distributors: number;
  active_distributors: number;
  filters_applied: {
    date_from?: string;
    date_to?: string;
  };
}

export interface GlobalSummaryResponse {
  success: boolean;
  data: GlobalSummary;
}
