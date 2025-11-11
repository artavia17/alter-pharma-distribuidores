import { ApiResponse } from '../api.types';

export interface State {
  id: number;
  country_id: number;
  name: string;
  code: string | null;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export interface Municipality {
  id: number;
  state_id: number;
  name: string;
  code: string;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export type StatesResponse = ApiResponse<State[]>;
export type MunicipalitiesResponse = ApiResponse<Municipality[]>;
