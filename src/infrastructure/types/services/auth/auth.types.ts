import { ApiResponse } from "../api.types";

// Country
export interface Country {
  id: number;
  name: string;
  code: string;
  phone_code: string;
  identification_min_length: number;
  identification_max_length: number;
  phone_min_length: number;
  phone_max_length: number;
  status: boolean;
  created_at: string;
  updated_at: string;
}

// State
export interface State {
  id: number;
  country_id: number;
  name: string;
  code: string | null;
  status: boolean;
  created_at: string;
  updated_at: string;
}

// Municipality
export interface Municipality {
  id: number;
  state_id: number;
  name: string;
  code: string;
  status: boolean;
  created_at: string;
  updated_at: string;
}

// Distributor (según respuesta real de la API)
export interface Distributor {
  id: number;
  country_id: number;
  state_id: number;
  municipality_id: number;
  business_name: string;
  identification_number: string;
  street_address: string;
  phone: string;
  email: string;
  contact_person_name: string;  // Nombre de la persona de contacto
  status: boolean;
  last_login: string;
  created_at: string;
  updated_at: string;
  country?: Country;
  state?: State;
  municipality?: Municipality;
}

// Login Success Data
export interface LoginSuccessData {
  token: string;
  distributor: Distributor;
  is_first_login: boolean;  // Flag para saber si es el primer login
}

// Login Error - Account not validated
export interface LoginIncompleteSignupData {
  requires_signup: boolean;
}

// Login Error Data
export interface LoginErrorData {
  email?: string;
  password?: string;
}

// Reset Password Error Data
export interface ResetPasswordErrorData {
  email?: string;
}

// Activate Account Data
export interface ActivateAccountData {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
  terms_accepted: boolean;
  privacy_notice_accepted: boolean;
}

// Activate Account Error Data
export interface ActivateAccountErrorData {
  email?: string;
  password?: string;
  password_confirmation?: string;
  terms_accepted?: string;
  privacy_notice_accepted?: string;
}

// Activate Account Success Data
export interface ActivateAccountSuccessData {
  token: string;
  distributor: Distributor;
}

// Exportar los tipados
export type LoginResponse =
    | ApiResponse<LoginSuccessData>
    | ApiResponse<LoginErrorData>;

export type LoginIncompleteResponse = ApiResponse<LoginIncompleteSignupData>;

export type ResetPasswordResponse =
    | ApiResponse<{ message: string }>
    | ApiResponse<ResetPasswordErrorData>;

export type ActivateAccountResponse =
    | ApiResponse<ActivateAccountSuccessData>
    | ApiResponse<ActivateAccountErrorData>;
