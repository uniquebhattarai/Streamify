import React, {
  createContext, useContext, useState, useEffect, useCallback, type ReactNode,
} from "react";
import { TokenService } from "@utils/tokenService";
import type { JWTPayload } from "src/types/user";

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
  refreshAuth: () => void;
  decodeToken: () => JWTPayload | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    const hasTokens = TokenService.checkAuth();
    if (!hasTokens) {
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }
    const isExpired = TokenService.isTokenExpired();
    if (isExpired) {
      const ok = await TokenService.refreshAccessToken();
      setIsAuthenticated(ok);
      if (!ok) TokenService.logout();
    } else {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  return (
    <AuthContext.Provider value={{
      isAuthenticated, isLoading,
      logout: TokenService.logout,
      refreshAuth: checkAuth,
      decodeToken: TokenService.decodeToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
