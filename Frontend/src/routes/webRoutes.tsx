import React, { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const LoginPage    = lazy(() => import("@pages/LoginPage"));
const Dashboard    = lazy(() => import("@pages/Dashboard"));
const VideosPage   = lazy(() => import("@pages/VideoPage"));


export const publicRoutes: RouteObject[] = [
  { path: "/login",  element: <LoginPage /> },
  { path: "*",       element: <LoginPage /> },
];

export const allRoutes: RouteObject[] = [
  { path: "/",          element: <Dashboard /> },
  { path: "/videos",    element: <VideosPage /> },
  { path: "login",      element: <LoginPage /> },
  { path: "*",          element: <Dashboard /> },
];
