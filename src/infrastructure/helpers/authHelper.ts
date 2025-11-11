import { Distributor } from '../types/services/auth/auth.types';
import { getCookie } from './cookieHelper';

export const getDistributorData = (): Distributor | null => {
  const distributorData = getCookie('distributor_data');

  if (!distributorData) {
    return null;
  }

  try {
    return JSON.parse(distributorData) as Distributor;
  } catch (error) {
    console.error('Error parsing distributor data:', error);
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  const token = getCookie('user_token');
  return !!token;
};
