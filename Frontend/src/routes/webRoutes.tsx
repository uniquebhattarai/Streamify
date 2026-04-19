import React, { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import GlobalLoader from "@components/feedback/GlobalLoader";
import { useAuth } from "@context/authContext";
import NotFoundPage from "@pages/NotFound";
import RootLayout from "@layout/RootLayout";



const LazyLoginPage  = lazy(() => import("@pages/LoginPage"));
const LazyDashboard  = lazy(() => import("@pages/Dashboard"));
const LazyVideosPage = lazy(() => import("@pages/VideoPage"));
const LazyVideoDetail  = lazy(() => import("@pages/videoDetails"));



const AuthPublicRoute: React.FC<{ children: React.JSX.Element }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <GlobalLoader />;


  if (isAuthenticated) return <Navigate to="/" replace />;

  return <>{children}</>;
};


const ProtectedRoute: React.FC<{ children: React.JSX.Element }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <GlobalLoader />;

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};


// public routes
export const publicRoutes: RouteObject[] = [
  {
    path: "/",
    element: (
      <RootLayout>
        <Suspense fallback={<GlobalLoader />}>
        <LazyVideosPage />  
      </Suspense>
      </RootLayout>
      
    ),
  },
  {
    path: "/trending",
    element: (
      <RootLayout>
        <Suspense fallback={<GlobalLoader />}>
        <LazyVideosPage />  
      </Suspense>
      </RootLayout>
      
    ),
  },
  {
    path: "/video/:id",      
    element: (
      <RootLayout hideSidebar={true}>
         <Suspense fallback={<GlobalLoader />}>
        <LazyVideoDetail />
      </Suspense>
      </RootLayout>
     
    ),
  },
  {
    path: "/login",
    element: (
      <AuthPublicRoute>
        <Suspense fallback={<GlobalLoader />}>
          <LazyLoginPage />
        </Suspense>
      </AuthPublicRoute>
    ),
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
];

// protected Routes
export const protectedRoutes: RouteObject[] = [
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<GlobalLoader />}>
          <LazyDashboard />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
];

export const allRoutes: RouteObject[] = [...publicRoutes, ...protectedRoutes];