import React from "react";
import { Form, Input, Button, Card, Typography } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useAuth } from "@context/authContext";
import authService from "src/services/auth/authService";

const { Title } = Typography;

const LoginPage: React.FC = () => {
  const { refreshAuth } = useAuth();

  const onFinish = async (values: { email: string; password: string }) => {
    const result = await authService.login(values);
    if (result.success) refreshAuth();
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    }}>
      <Card style={{ width: 400, borderRadius: 12 }}>
        <Title level={3} style={{ textAlign: "center" }}>Streamify</Title>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="email" rules={[{ required: true }]}>
            <Input prefix={<UserOutlined />} placeholder="Email" size="large" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large">
            Login
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
