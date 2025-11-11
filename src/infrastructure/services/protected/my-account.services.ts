import { MyAccountResponse, UpdateMyAccountRequest } from '../../types/services/protected/my-account.types';
import api from '../api';

const myAccount = async () => {
    const response = await api.get<MyAccountResponse>("/distributor/my-account");
    return response.data;
};

const updateMyAccount = async (data: UpdateMyAccountRequest) => {
    const response = await api.post<MyAccountResponse>("/distributor/my-account", data);
    return response.data;
};

export {
    myAccount,
    updateMyAccount
}
