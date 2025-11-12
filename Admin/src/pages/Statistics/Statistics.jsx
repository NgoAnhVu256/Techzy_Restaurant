import React, { useState, useEffect } from "react";
import "./Statistics.css";
import axios from "axios";
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

const Statistics = () => {
  const [timeRange, setTimeRange] = useState("week");
  const [revenueData, setRevenueData] = useState({
    labels: [],
    datasets: [],
  });
  const [orderData, setOrderData] = useState({
    labels: [],
    datasets: [],
  });
  const [categoryData, setCategoryData] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    fetchStatistics();
  }, [timeRange]);

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5078/api/ThongKe?timeRange=${timeRange}`
      );
      const data = response.data;

      // Cập nhật dữ liệu doanh thu
      setRevenueData({
        labels: data.revenue.map((item) => item.date),
        datasets: [
          {
            label: "Doanh thu",
            data: data.revenue.map((item) => item.amount),
            borderColor: "rgb(75, 192, 192)",
            tension: 0.1,
          },
        ],
      });

      // Cập nhật dữ liệu đơn hàng
      setOrderData({
        labels: data.orders.map((item) => item.date),
        datasets: [
          {
            label: "Số đơn hàng",
            data: data.orders.map((item) => item.count),
            backgroundColor: "rgb(54, 162, 235)",
          },
        ],
      });

      // Cập nhật dữ liệu danh mục
      setCategoryData({
        labels: data.categories.map((item) => item.name),
        datasets: [
          {
            data: data.categories.map((item) => item.count),
            backgroundColor: [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
            ],
          },
        ],
      });
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu thống kê:", error);
    }
  };

  return (
    <div className="statistics-container">
      <div className="statistics-header">
        <h2>Thống kê</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="time-range-select"
        >
          <option value="week">7 ngày qua</option>
          <option value="month">30 ngày qua</option>
          <option value="year">12 tháng qua</option>
        </select>
      </div>

      <div className="statistics-grid">
        <div className="chart-container">
          <h3>Doanh thu</h3>
          <Line
            data={revenueData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "top",
                },
                title: {
                  display: true,
                  text: "Biểu đồ doanh thu",
                },
              },
            }}
          />
        </div>

        <div className="chart-container">
          <h3>Đơn hàng</h3>
          <Bar
            data={orderData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "top",
                },
                title: {
                  display: true,
                  text: "Số lượng đơn hàng",
                },
              },
            }}
          />
        </div>

        <div className="chart-container">
          <h3>Danh mục món ăn</h3>
          <Pie
            data={categoryData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "right",
                },
                title: {
                  display: true,
                  text: "Phân bố danh mục",
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Statistics;
