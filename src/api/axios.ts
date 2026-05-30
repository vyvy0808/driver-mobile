import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { CONFIG } from "../constants/config";
import { STORAGE_KEYS } from "../constants/storageKeys";

const api = axios.create({
  baseURL: CONFIG.BASE_URL,

  timeout: 15000,

  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync(STORAGE_KEYS.TOKEN);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("REQUEST:", config.method, config.url);

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    console.log("RESPONSE:", response.config.url, response.status);

    return response;
  },
  (error) => {
  console.log("API ERROR STATUS:", error?.response?.status);
  console.log("API ERROR DATA:", error?.response?.data);
  console.log("API ERROR MESSAGE:", error?.message);
  console.log("API ERROR URL:", error?.config?.baseURL + error?.config?.url);

  return Promise.reject(error);
  }
);

export default api;