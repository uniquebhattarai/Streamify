import React from "react";
import { ConfigProvider } from "antd";
import type { ReactNode } from "react";

const themes = {
  token: {
    colorPrimary: "#6366f1",  
    borderRadius: 6,
    fontFamily: `"Inter", sans-serif`,
    colorBgContainer: "#ffffff",
  },
};

const ThemeProvider = ({ children }: { children: ReactNode }) => (
  <ConfigProvider theme={themes}>{children}</ConfigProvider>
);

export default ThemeProvider;
