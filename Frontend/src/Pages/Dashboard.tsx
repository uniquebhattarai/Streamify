import React from "react";

import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useAuth } from "@context/authContext";
import authService from "@services/auth/authService";


const DashboardPage: React.FC = () => {
  const { refreshAuth } = useAuth();

  const onFinish = async (values: { email: string; password: string }) => {
    const result = await authService.login(values);
    if (result.success) refreshAuth();
  };

  return (
    <div>
      Dashboard
    </div>
  );
};

export default DashboardPage;
