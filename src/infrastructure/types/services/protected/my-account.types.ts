import { ApiResponse } from '../api.types';
import { Country, State, Municipality } from '../auth/auth.types';

export interface DistributorAccount {
  id: number;
  country_id: number;
  state_id: number;
  municipality_id: number;
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
  country: Country;
  state: State;
  municipality: Municipality;
}

export interface UpdateMyAccountRequest {
  business_name?: string;
  contact_person_name?: string;
  phone?: string;
  email?: string;
  street_address?: string;
  state_id?: number;
  municipality_id?: number;
  password?: string;
  password_confirmation?: string;
}

export type MyAccountResponse = ApiResponse<DistributorAccount>;
