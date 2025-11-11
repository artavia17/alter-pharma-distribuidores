import { StatesResponse, MunicipalitiesResponse } from '../../types/services/protected/locations.types';
import api from '../api';

const getStates = async () => {
  const response = await api.get<StatesResponse>('/distributor/states');
  return response.data;
};

const getMunicipalities = async (stateId: number) => {
  const response = await api.get<MunicipalitiesResponse>(`/distributor/states/${stateId}/municipalities`);
  return response.data;
};

export { getStates, getMunicipalities };
