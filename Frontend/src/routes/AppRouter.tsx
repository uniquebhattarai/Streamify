// AppRouter.tsx
import { useRoutes } from "react-router-dom";
import { Suspense, useMemo } from "react";
import { publicRoutes, allRoutes } from "./webRoutes";
import { useAuth } from "@context/authContext";
import GlobalLoader from "@components/feedback/GlobalLoader";

const LoadingFallback = () => <GlobalLoader />;

function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth();

  const routes = useMemo(() => {
    if (isLoading) return []; // Return empty routes while loading
    if (!isAuthenticated) {
      return publicRoutes;
    }
    return allRoutes;
  }, [isAuthenticated, isLoading]);

  const element = useRoutes(routes);

  if (isLoading) {
    return <LoadingFallback />;
  }

  return element ? (
    <Suspense fallback={<LoadingFallback />}>{element}</Suspense>
  ) : null;
}

export default AppRouter;
