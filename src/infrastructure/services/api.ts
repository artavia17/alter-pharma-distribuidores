import axios from "axios";
import { clearCookies, getCookie } from "../helpers/cookieHelper";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string;

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 100000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Handles user authentication.
api.interceptors.request.use(config => {
    const token = getCookie('user_token');
    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
}, error => {
    return Promise.reject(error);
});

// Interceptor to handle responses and errors.
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            if(error.config?.url !== "/distributor/auth/login"){
                clearCookies();
                window.location.href = "/auth/sign-in";
            }
        }

        console.error("Api Error: ", error.response);
        return Promise.reject(error);
    }
)

export default api;
