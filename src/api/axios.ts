import axios from "axios";
import { CONFIG }
  from "../constants/config";

const api = axios.create({
  baseURL:
    CONFIG.BASE_URL,

  timeout: 15000,

  headers: {
    "Content-Type":
      "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    console.log(
      "REQUEST:",
      config.method,
      config.url
    );

    return config;
  },
  (error) =>
    Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    console.log(
      "RESPONSE:",
      response.config.url,
      response.status
    );

    return response;
  },
  (error) => {
    console.log(
      "API ERROR:",
      error?.response?.data
    );

    return Promise.reject(
      error
    );
  }
);

export default api;