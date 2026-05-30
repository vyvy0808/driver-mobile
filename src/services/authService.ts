import api from "../api/axios";
import { ENDPOINTS } from "../api/endpoints";
import { LoginRequest, LoginResponse } from "../types/auth";

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>(ENDPOINTS.AUTH.LOGIN, data);
    return res.data;
  },
};