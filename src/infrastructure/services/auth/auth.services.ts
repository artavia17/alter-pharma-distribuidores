import { LoginResponse, ResetPasswordResponse, ActivateAccountResponse, ActivateAccountData } from '../../types/services/auth/auth.types';
import api from '../api';

const login = async (data: { email: string; password: string }) => {
    const response = await api.post<LoginResponse>("/distributor/auth/login", data);
    return response.data;
};

const activateAccount = async (data: ActivateAccountData) => {
    const response = await api.post<ActivateAccountResponse>("/distributor/auth/activate-account", data);
    return response.data;
};

const resetPassword = async (data: { email: string }) => {
    const response = await api.post<ResetPasswordResponse>("/distributor/auth/forgot-password", data);
    return response.data;
};

const resetPasswordCreate = async (data: {
    email: string;
    token: string;
    password: string;
    password_confirmation: string;
}) => {
    const response = await api.post<ResetPasswordResponse>("/distributor/auth/reset-password", data);
    return response.data;
};

const updatePassword = async (data: {
    password: string;
    password_confirmation: string;
}) => {
    const response = await api.post<ResetPasswordResponse>("/distributor/auth/update-password", data);
    return response.data;
};

export {
    login,
    activateAccount,
    resetPassword,
    resetPasswordCreate,
    updatePassword,
}
