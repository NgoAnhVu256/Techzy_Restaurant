import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axios";
import { toast } from "react-toastify";
import {
  FiTrendingUp,
  FiShoppingBag,
  FiUsers,
  FiCalendar,
  FiDollarSign,
  FiUser,
  FiAlertCircle,
  FiClock,
  FiPackage,
} from "react-icons/fi";
import { Line, Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Select, Card, Tag, Space, Typography, Button } from "antd";
import { BellOutlined } from "@ant-design/icons";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const { Text } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("week");
  const [loading, setLoading] = useState(false);
  
  // KPI Data
  const [kpiData, setKpiData] = useState({
    totalRevenue: 0,
    todayOrders: 0,
    todayCustomers: 0,
    todayReservations: 0,
    totalEmployees: 0,
  });

  // Charts Data
  const [revenueData, setRevenueData] = useState({
    labels: [],
    datasets: [],
  });
  const [topProductsData, setTopProductsData] = useState({
    labels: [],
    datasets: [],
  });
  const [orderStatusData, setOrderStatusData] = useState({
    labels: [],
    datasets: [],
  });

  // Recent Orders
  const [recentOrders, setRecentOrders] = useState([]);

  // Notifications
  const [notifications, setNotifications] = useState({
    pendingOrders: 0,
    upcomingReservations: 0,
    lowStockItems: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch KPI stats
      const statsRes = await api.get("/statistics/dashboard");
      if (statsRes.data.success) {
        setKpiData({
          totalRevenue: statsRes.data.data.totalRevenue || 0,
          todayOrders: statsRes.data.data.todayOrders || 0,
          todayCustomers: statsRes.data.data.todayCustomers || 0,
          todayReservations: 0, // Will be fetched separately
          totalEmployees: 0, // Will be fetched separately
        });
      }

      // Fetch employees count
      try {
        const employeesRes = await api.get("/employees");
        if (employeesRes.data.success) {
          setKpiData((prev) => ({
            ...prev,
            totalEmployees: employeesRes.data.data?.length || 0,
          }));
        }
      } catch (err) {
        console.error("Error fetching employees:", err);
      }

      // Fetch reservations count for today
      try {
        const today = new Date().toISOString().split("T")[0];
        const reservationsRes = await api.get(`/reservations?startDate=${today}&endDate=${today}`);
        if (reservationsRes.data.success) {
          setKpiData((prev) => ({
            ...prev,
            todayReservations: reservationsRes.data.data?.length || 0,
          }));
        }
      } catch (err) {
        console.error("Error fetching reservations:", err);
      }

      // Fetch revenue over time
      const endDate = new Date();
      const startDate = new Date();
      const rangeMap = {
        today: 1,
        week: 7,
        month: 30,
        year: 365,
      };
      startDate.setDate(startDate.getDate() - (rangeMap[timeRange] || 7));

      const revenueRes = await api.get(
        `/statistics/revenue?startDate=${startDate.toISOString().split("T")[0]}&endDate=${endDate.toISOString().split("T")[0]}&groupBy=day`
      );
      if (revenueRes.data.success) {
        const data = revenueRes.data.data;
        setRevenueData({
          labels: data.map((item) => {
            const date = new Date(item.date);
            return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
          }),
          datasets: [
            {
              label: "Doanh thu (VNĐ)",
              data: data.map((item) => item.revenue),
              borderColor: "rgb(93, 135, 255)",
              backgroundColor: "rgba(93, 135, 255, 0.1)",
              tension: 0.4,
              fill: true,
            },
          ],
        });
      }

      // Fetch top products
      const topProductsRes = await api.get("/statistics/top-products?limit=5");
      if (topProductsRes.data.success) {
        const products = topProductsRes.data.data;
        setTopProductsData({
          labels: products.map((p) => p.tenMon),
          datasets: [
            {
              label: "Số lượng bán",
              data: products.map((p) => p.totalQuantity),
              backgroundColor: [
                "rgba(93, 135, 255, 0.8)",
                "rgba(74, 198, 255, 0.8)",
                "rgba(127, 229, 201, 0.8)",
                "rgba(255, 214, 153, 0.8)",
                "rgba(255, 169, 169, 0.8)",
              ],
            },
          ],
        });
      }

      // Fetch orders for status distribution
      const ordersRes = await api.get("/orders");
      if (ordersRes.data.success) {
        const orders = ordersRes.data.data || [];
        const statusCounts = {};
        orders.forEach((order) => {
          const status = order.TrangThai || order.trangThai;
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });

        const statusLabels = {
          ChoXacNhan: "Chờ xác nhận",
          DangChuanBi: "Đang chuẩn bị",
          HoanThanh: "Hoàn thành",
          DaThanhToan: "Đã thanh toán",
          DaHuy: "Đã hủy",
        };

        setOrderStatusData({
          labels: Object.keys(statusCounts).map((key) => statusLabels[key] || key),
          datasets: [
            {
              data: Object.values(statusCounts),
              backgroundColor: [
                "rgba(255, 214, 153, 0.8)",
                "rgba(93, 135, 255, 0.8)",
                "rgba(127, 229, 201, 0.8)",
                "rgba(74, 198, 255, 0.8)",
                "rgba(255, 169, 169, 0.8)",
              ],
            },
          ],
        });

        // Set recent orders (last 5)
        setRecentOrders(orders.slice(0, 5));
      }

      // Fetch notifications
      await fetchNotifications();
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Lỗi khi tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      // Fetch pending orders
      const ordersRes = await api.get("/orders");
      if (ordersRes.data.success) {
        const orders = ordersRes.data.data || [];
        const pendingCount = orders.filter(
          (o) => (o.TrangThai || o.trangThai) === "ChoXacNhan"
        ).length;
        setNotifications((prev) => ({ ...prev, pendingOrders: pendingCount }));
      }

      // Fetch upcoming reservations (next 1-2 hours)
      const now = new Date();
      const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      const reservationsRes = await api.get("/reservations");
      if (reservationsRes.data.success) {
        const reservations = reservationsRes.data.data || [];
        const upcoming = reservations.filter((r) => {
          const startTime = new Date(r.ThoiGianBatDau || r.thoiGianBatDau);
          return startTime >= now && startTime <= twoHoursLater;
        }).length;
        setNotifications((prev) => ({ ...prev, upcomingReservations: upcoming }));
      }

      // Fetch low stock items
      const storageRes = await api.get("/storage");
      if (storageRes.data.success) {
        const materials = storageRes.data.data || [];
        const lowStock = materials
          .filter((m) => {
            const quantity = parseFloat(m.SoLuongTon || m.soLuongTon || 0);
            return quantity < 10; // Threshold: less than 10
          })
          .slice(0, 3)
          .map((m) => ({
            name: m.TenNguyenVatLieu || m.tenNguyenVatLieu,
            quantity: parseFloat(m.SoLuongTon || m.soLuongTon || 0),
          }));
        setNotifications((prev) => ({ ...prev, lowStockItems: lowStock }));
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const statCards = [
    {
      label: "Tổng doanh thu",
      value: kpiData.totalRevenue.toLocaleString("vi-VN") + "₫",
      change: `Thời gian: ${timeRange === "today" ? "Hôm nay" : timeRange === "week" ? "7 ngày" : timeRange === "month" ? "30 ngày" : "Năm nay"}`,
      icon: <FiTrendingUp />,
    },
    {
      label: "Số đơn hàng mới",
      value: kpiData.todayOrders.toString(),
      change: "Hôm nay",
      icon: <FiShoppingBag />,
    },
    {
      label: "Khách hàng mới",
      value: kpiData.todayCustomers.toString(),
      change: "Hôm nay",
      icon: <FiUsers />,
    },
    {
      label: "Đặt bàn hôm nay",
      value: kpiData.todayReservations.toString(),
      change: "Đã xác nhận",
      icon: <FiCalendar />,
    },
    {
      label: "Tổng số Nhân viên",
      value: kpiData.totalEmployees.toString(),
      change: "Đang hoạt động",
      icon: <FiUser />,
      action: {
        label: "Xem danh sách",
        onClick: () => navigate("/employees"),
      },
    },
  ];

  const getStatusText = (status) => {
    const statusMap = {
      ChoXacNhan: "Chờ xác nhận",
      DangChuanBi: "Đang chuẩn bị",
      HoanThanh: "Hoàn thành",
      DaThanhToan: "Đã thanh toán",
      DaHuy: "Đã hủy",
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      ChoXacNhan: "orange",
      DangChuanBi: "blue",
      HoanThanh: "green",
      DaThanhToan: "cyan",
      DaHuy: "red",
    };
    return colorMap[status] || "default";
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-page__header">
        <div>
          <p className="eyebrow">Techzy Restaurant</p>
          <h1>Dashboard</h1>
          <span className="subtitle">
            Thống kê tổng quan hoạt động kinh doanh trong tuần gần nhất
          </span>
        </div>
        <button className="export-btn">
          <FiDollarSign />
          Xuất báo cáo
        </button>
      </header>

      <div className="time-filter-container">
        <Select
          value={timeRange}
          onChange={setTimeRange}
          style={{ width: 200 }}
          size="large"
        >
          <Select.Option value="today">Hôm nay</Select.Option>
          <Select.Option value="week">Tuần này</Select.Option>
          <Select.Option value="month">Tháng này</Select.Option>
          <Select.Option value="year">Năm nay</Select.Option>
        </Select>
      </div>

      <section className="stats-grid">
        {statCards.map((card) => (
          <article key={card.label} className="stat-card">
            <div className="stat-icon">{card.icon}</div>
            <p className="stat-label">{card.label}</p>
            <h3>{card.value}</h3>
            <span className="stat-change">{card.change}</span>
            {card.action && (
              <button className="stat-action-link" onClick={card.action.onClick}>
                {card.action.label}
              </button>
            )}
          </article>
        ))}
      </section>

      <section className="dashboard-panels">
        <article className="panel chart-card">
          <div className="panel-header">
            <div>
              <h2>Doanh thu {timeRange === "today" ? "hôm nay" : timeRange === "week" ? "7 ngày qua" : timeRange === "month" ? "30 ngày qua" : "năm nay"}</h2>
              <p>Thống kê theo giá trị thực thu (VNĐ)</p>
            </div>
          </div>
          <div className="chart-wrapper">
            {revenueData.labels.length > 0 ? (
              <Line
                data={revenueData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
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
                          return (value / 1000000).toFixed(1) + "M";
                        },
                      },
                    },
                  },
                }}
              />
            ) : (
              <div className="chart-placeholder">Đang tải dữ liệu...</div>
            )}
          </div>
        </article>

        <article className="panel notifications-card">
          <div className="panel-header">
            <h2>
              <BellOutlined style={{ marginRight: 8 }} />
              Thông báo & Nhắc nhở
            </h2>
          </div>
          <div className="notifications-list">
            {notifications.pendingOrders > 0 && (
              <div className="notification-item warning">
                <FiAlertCircle />
                <div>
                  <Text strong>{notifications.pendingOrders} đơn hàng</Text>
                  <Text type="secondary"> đang chờ xác nhận</Text>
                </div>
                <Button
                  type="link"
                  size="small"
                  onClick={() => navigate("/order?tab=ChoXacNhan")}
                >
                  Xem
                </Button>
              </div>
            )}
            {notifications.upcomingReservations > 0 && (
              <div className="notification-item info">
                <FiClock />
                <div>
                  <Text strong>{notifications.upcomingReservations} đặt bàn</Text>
                  <Text type="secondary"> sắp đến giờ (1-2 giờ tới)</Text>
                </div>
                <Button
                  type="link"
                  size="small"
                  onClick={() => navigate("/reservations")}
                >
                  Xem
                </Button>
              </div>
            )}
            {notifications.lowStockItems.length > 0 && (
              <div className="notification-item danger">
                <FiPackage />
                <div>
                  <Text strong>Nguyên vật liệu sắp hết:</Text>
                  <ul style={{ margin: "8px 0 0 20px", padding: 0 }}>
                    {notifications.lowStockItems.map((item, idx) => (
                      <li key={idx}>
                        <Text>
                          {item.name}: còn <Text strong style={{ color: "#ff4d4f" }}>{item.quantity}</Text>
                        </Text>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  type="link"
                  size="small"
                  onClick={() => navigate("/storage")}
                >
                  Xem
                </Button>
              </div>
            )}
            {notifications.pendingOrders === 0 &&
              notifications.upcomingReservations === 0 &&
              notifications.lowStockItems.length === 0 && (
                <div className="notification-item success">
                  <Text type="secondary">Không có thông báo nào</Text>
                </div>
              )}
          </div>
        </article>
      </section>

      <section className="dashboard-charts-row">
        <article className="panel chart-card">
          <div className="panel-header">
            <h2>Top 5 Món Ăn Bán Chạy Nhất</h2>
            <p>Theo số lượng đã bán</p>
          </div>
          <div className="chart-wrapper">
            {topProductsData.labels.length > 0 ? (
              <Bar
                data={topProductsData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          return `Đã bán: ${context.parsed.y} phần`;
                        },
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1,
                      },
                    },
                  },
                }}
              />
            ) : (
              <div className="chart-placeholder">Đang tải dữ liệu...</div>
            )}
          </div>
        </article>

        <article className="panel chart-card">
          <div className="panel-header">
            <h2>Phân bổ Đơn hàng theo Trạng thái</h2>
            <p>Tổng quan trạng thái đơn hàng</p>
          </div>
          <div className="chart-wrapper">
            {orderStatusData.labels.length > 0 ? (
              <Pie
                data={orderStatusData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "right",
                    },
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          const total = context.dataset.data.reduce((a, b) => a + b, 0);
                          const percentage = ((context.parsed / total) * 100).toFixed(1);
                          return `${context.label}: ${context.parsed} đơn (${percentage}%)`;
                        },
                      },
                    },
                  },
                }}
              />
            ) : (
              <div className="chart-placeholder">Đang tải dữ liệu...</div>
            )}
          </div>
        </article>
      </section>

      <article className="panel orders-card">
        <div className="panel-header">
          <h2>Các đơn hàng gần đây</h2>
          <button className="link-button" onClick={() => navigate("/order")}>
            Xem tất cả
          </button>
        </div>

        <div className="orders-table">
          <div className="orders-table__head">
            <span>ID Đơn hàng</span>
            <span>Tên khách hàng</span>
            <span>Trạng thái</span>
            <span className="text-right">Tổng tiền</span>
          </div>
          <div className="orders-table__body">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => {
                const status = order.TrangThai || order.trangThai;
                return (
                  <div key={order.MaDonHang || order.maDonHang} className="orders-row">
                    <span>#{order.MaDonHang || order.maDonHang}</span>
                    <span>
                      {order.khachHang?.HoTen || order.khachHang?.hoTen || "N/A"}
                    </span>
                    <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
                    <span className="text-right">
                      {(order.TongTien || order.tongTien || 0).toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="orders-empty">Chưa có đơn hàng nào</div>
            )}
          </div>
        </div>
      </article>
    </div>
  );
};

export default Dashboard;
