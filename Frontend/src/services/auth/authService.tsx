import { httpClient } from "@api/clients/http-client";
import { apisRoutes } from "@routes/apiRoutes";
import { TokenService } from "@utils/tokenService";
import type { AxiosResponse } from "axios";

interface LoginPayload {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  data?: unknown;
  message?: string;
}

const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  try {
    const res: AxiosResponse = await httpClient.post(
      apisRoutes.auth.login.post,
      payload
    );
    const { accessToken, refreshToken } = res.data.data;
    TokenService.setToken({ key: "access_token", value: accessToken });
    TokenService.setToken({ key: "refresh_token", value: refreshToken });
    return { success: true, data: res.data };
  } catch (error) {
    return { success: false, message: "Login failed" };
  }
};

const refreshToken = async (refresh: string): Promise<AuthResponse> => {
  try {
    const res: AxiosResponse = await httpClient.post(
      apisRoutes.auth.refresh.post,
      { refreshToken: refresh }
    );
    return { success: true, data: res.data.data };
  } catch {
    return { success: false };
  }
};

const getMe = async () => {
  const res = await httpClient.get(apisRoutes.auth.me.get);
  return res.data;
};

const authService = { login, refreshToken, getMe };
export default authService;
