import { useRoutes } from "react-router-dom";
import { Suspense, useMemo } from "react";
import { publicRoutes, allRoutes } from "./webRoutes";
import { useAuth } from "@context/authContext";
import { Spin } from "antd";

const Fallback = () => (
  <div style={{ display: "flex", justifyContent: "center", marginTop: 100 }}>
    <Spin size="large" />
  </div>
);

function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth();

  const routes = useMemo(() => {
    if (isLoading) return [];
    return isAuthenticated ? allRoutes : publicRoutes;
  }, [isAuthenticated, isLoading]);

  const element = useRoutes(routes);
  if (isLoading) return <Fallback />;
  return <Suspense fallback={<Fallback />}>{element}</Suspense>;
}

export default AppRouter;
