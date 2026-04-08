import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@context/authContext";
import ThemeProvider from "./configs/themeConfig";
import AppRouter from "@routes/AppRouter";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <BrowserRouter>
             <Toaster position="top-right" reverseOrder={false} /> 
            <AppRouter />
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </AuthProvider>
  </StrictMode>
);
