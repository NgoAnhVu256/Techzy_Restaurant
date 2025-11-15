import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Card } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import api from "../../utils/axios";
import { assets1 } from "../../assets/assets1";
import "./Login.css";

const Login = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await api.post("/users/login", {
        TenDangNhap: values.username,
        MatKhau: values.password,
      });

      if (response.data.success) {
        // Lưu token và user info vào localStorage
        const { token, user } = response.data.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        toast.success("Đăng nhập thành công!");
        navigate("/dashboard");
      } else {
        toast.error(response.data.message || "Đăng nhập thất bại");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Tên đăng nhập hoặc mật khẩu không đúng";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Card className="login-card">
        <div className="login-header">
          {assets1.logo && (
            <img src={assets1.logo} alt="Logo" className="login-logo-img" />
          )}
          <h1 className="login-title">Đăng nhập Admin</h1>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
          className="login-form"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: "Vui lòng nhập tên đăng nhập!" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Tên đăng nhập"
              className="login-input"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Mật khẩu"
              className="login-input"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="login-button"
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;

