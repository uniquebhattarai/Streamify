import Cookie from "js-cookie";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "../constant/token";
import { jwtDecode } from "jwt-decode";
import type { JWTPayload } from "src/types/user";

const SERVER_URL_KEY = "server_url_key";
const currentServerUrl = import.meta.env.VITE_APP_SERVER_URI;

const getToken = (
  token_name: typeof ACCESS_TOKEN_KEY | typeof REFRESH_TOKEN_KEY
): string | undefined => Cookie.get(token_name);

const setToken = ({
  key,
  value,
}: {
  key: typeof ACCESS_TOKEN_KEY | typeof REFRESH_TOKEN_KEY;
  value: string;
}): void => {
  Cookie.set(key, value, { expires: 7 });
  if (currentServerUrl) {
    localStorage.setItem(SERVER_URL_KEY, currentServerUrl);
  }
};

const logout = (): void => {
  Cookie.remove(ACCESS_TOKEN_KEY);
  Cookie.remove(REFRESH_TOKEN_KEY);
  localStorage.removeItem(SERVER_URL_KEY);
  window.location.pathname = "";
};

const decodeToken = (): JWTPayload | null => {
  const token = getToken(ACCESS_TOKEN_KEY);
  if (!token) return null;
  try {
    return jwtDecode<JWTPayload>(token);
  } catch {
    return null;
  }
};

const checkAuth = (): boolean => {
  const storedServerUrl = localStorage.getItem(SERVER_URL_KEY);
  if (storedServerUrl && currentServerUrl && storedServerUrl !== currentServerUrl) {
    logout();
    return false;
  }
  return !!(getToken(ACCESS_TOKEN_KEY) && getToken(REFRESH_TOKEN_KEY) && decodeToken()?.user_id);
};

const isTokenExpired = (): boolean => {
  const token = getToken(ACCESS_TOKEN_KEY);
  if (!token) return true;
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    if (!decoded.exp) return true;
    return decoded.exp < Date.now() / 1000 + 30;
  } catch {
    return true;
  }
};

const refreshAccessToken = async (): Promise<boolean> => {
  const refreshToken = getToken(REFRESH_TOKEN_KEY);
  if (!refreshToken) return false;
  try {
    const { default: authService } = await import("../services/auth/authService");
    const response = await authService.refreshToken(refreshToken);
    if (response.success && response.data) {
      const accessToken = (response.data as { access: string }).access;
      if (accessToken) {
        setToken({ key: ACCESS_TOKEN_KEY, value: accessToken });
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
};

export const TokenService = {
  getToken, setToken, checkAuth, logout, decodeToken, isTokenExpired, refreshAccessToken,
};
