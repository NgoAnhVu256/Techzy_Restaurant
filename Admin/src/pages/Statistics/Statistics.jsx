import React, { useState, useEffect } from "react";
import "./Statistics.css";
import api from "../../utils/axios";
import { toast } from "react-toastify";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Card, Select, Typography, Space, Statistic, Row, Col } from "antd";
import { DollarOutlined, ShoppingOutlined, UserOutlined } from "@ant-design/icons";

const { Text } = Typography;

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Statistics = () => {
  const [dashboardStats, setDashboardStats] = useState({
    totalRevenue: 0,
    todayOrders: 0,
    todayCustomers: 0,
    todayRevenue: 0,
  });
  const [revenueData, setRevenueData] = useState({
    labels: [],
    datasets: [],
  });
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
    fetchRevenueOverTime();
    fetchTopProducts();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await api.get("/statistics/dashboard");
      if (response.data.success) {
        setDashboardStats(response.data.data);
      }
    } catch (error) {
      toast.error("Lỗi khi tải thống kê dashboard");
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueOverTime = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30); // 30 ngày qua

      const response = await api.get(
        `/statistics/revenue?startDate=${startDate.toISOString().split("T")[0]}&endDate=${endDate.toISOString().split("T")[0]}&groupBy=day`
      );
      if (response.data.success) {
        const data = response.data.data;
        setRevenueData({
          labels: data.map((item) => {
            const date = new Date(item.date);
            return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
          }),
          datasets: [
            {
              label: "Doanh thu (VNĐ)",
              data: data.map((item) => item.revenue),
              borderColor: "rgb(75, 192, 192)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              tension: 0.1,
            },
          ],
        });
      }
    } catch (error) {
      console.error("Error fetching revenue over time:", error);
    }
  };

  const fetchTopProducts = async () => {
    try {
      const response = await api.get("/statistics/top-products?limit=10");
      if (response.data.success) {
        setTopProducts(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching top products:", error);
    }
  };

  return (
    <div className="statistics-page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Kinh doanh & Báo cáo / Thống kê</p>
          <h2>Thống kê & Báo cáo</h2>
        </div>
      </div>

      {/* Dashboard Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={dashboardStats.totalRevenue}
              prefix={<DollarOutlined />}
              suffix="VNĐ"
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đơn hàng hôm nay"
              value={dashboardStats.todayOrders}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Khách hàng mới hôm nay"
              value={dashboardStats.todayCustomers}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Doanh thu hôm nay"
              value={dashboardStats.todayRevenue}
              prefix={<DollarOutlined />}
              suffix="VNĐ"
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Doanh thu 30 ngày qua" className="chart-card">
            {revenueData.labels.length > 0 && (
              <Line
                data={revenueData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "top",
                    },
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          return `Doanh thu: ${context.parsed.y.toLocaleString("vi-VN")} VNĐ`;
                        },
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function (value) {
                          return value.toLocaleString("vi-VN") + " VNĐ";
                        },
                      },
                    },
                  },
                }}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Top 10 sản phẩm bán chạy" className="chart-card">
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              {topProducts.map((product, index) => (
                <div key={product.maMon} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <Text strong>{index + 1}. {product.tenMon}</Text>
                    <br />
                    <Text type="secondary">Đã bán: {product.totalQuantity}</Text>
                  </div>
                  <Text strong style={{ color: "#3f8600" }}>
                    {product.totalRevenue.toLocaleString("vi-VN")} VNĐ
                  </Text>
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Statistics;
