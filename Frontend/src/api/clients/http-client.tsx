import { customMessage } from "../../configs/toastConfig";
import { TokenService } from "@utils/tokenService";
import axios, { type AxiosInstance } from "axios";

export const baseURL = import.meta.env.VITE_APP_SERVER_URI;

const httpClient: AxiosInstance = axios.create({ baseURL, timeout: 0 });

httpClient.interceptors.request.use(async (config) => {
  const token = TokenService.getToken("access_token");
  if (config && config.headers && token) {
    config.headers["Authorization"] = "Bearer " + token;
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) {
        customMessage.error("Session expired. Logging out...");
        await TokenService.logout();
      } else {
        let message = "Something went wrong";
        if (typeof data === "string") message = data;
        else if (data?.message) message = typeof data.message === "string" ? data.message : JSON.stringify(data.message);
        else if (data?.detail) message = data.detail;
        customMessage.error(message);
      }
    } else if (error.request) {
      customMessage.error("Network error, please check your internet connection.");
    } else {
      customMessage.error(error.message || "An unexpected error occurred.");
    }
    return Promise.reject(error);
  }
);

// For file uploads
const httpClientFile: AxiosInstance = axios.create({ baseURL, timeout: 0 });

httpClientFile.interceptors.request.use(async (config) => {
  const token = TokenService.getToken("access_token");
  if (config && config.headers && token) {
    config.headers["Authorization"] = "Bearer " + token;
  }
  return config;
});

httpClientFile.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) {
        customMessage.error("Session expired. Logging out...");
        await TokenService.logout();
      } else {
        let message = "Something went wrong";
        if (data?.message) message = data.message;
        else if (data?.detail) message = data.detail;
        customMessage.error(message);
      }
    }
    return Promise.reject(error);
  }
);

export { httpClient, httpClientFile };
