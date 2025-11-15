import React, { useEffect, useMemo, useState } from "react";
import "./Order.css";
import api from "../../utils/axios";
import { toast } from "react-toastify";
import {
  Button,
  Table,
  Modal,
  Form,
  Select,
  Space,
  Typography,
  Tag,
  Tabs,
  Badge,
} from "antd";
import { FiEye, FiEdit, FiPlus } from "react-icons/fi";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const { Text } = Typography;

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusForm] = Form.useForm();

  const statusConfig = {
    ChoXacNhan: { label: "Chờ xác nhận", color: "orange" },
    DangChuanBi: { label: "Đang chuẩn bị", color: "blue" },
    HoanThanh: { label: "Hoàn thành", color: "green" },
    DaThanhToan: { label: "Đã thanh toán", color: "cyan" },
    DaHuy: { label: "Đã hủy", color: "red" },
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders");
      setOrders(response.data.data || []);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách đơn hàng");
    }
  };

  useEffect(() => {
    fetchOrders();
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab === "all") {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(
        orders.filter((order) => order.TrangThai === activeTab)
      );
    }
  }, [activeTab, orders]);

  useEffect(() => {
    if (showStatusModal && selectedOrder) {
      statusForm.setFieldsValue({
        trangThai: selectedOrder.TrangThai || selectedOrder.trangThai,
      });
    }
  }, [showStatusModal, selectedOrder, statusForm]);

  const handleViewDetail = async (order) => {
    try {
      const response = await api.get(
        `/orders/${order.MaDonHang || order.maDonHang}`
      );
      setSelectedOrder(response.data.data);
      setShowDetailModal(true);
    } catch (error) {
      toast.error("Lỗi khi tải chi tiết đơn hàng");
    }
  };

  const handleUpdateStatus = async (values) => {
    if (!selectedOrder) return;
    try {
      await api.put(
        `/orders/${
          selectedOrder.MaDonHang || selectedOrder.maDonHang
        }/trangthai`,
        {
          TrangThai: values.trangThai,
        }
      );
      toast.success("Cập nhật trạng thái thành công");
      fetchOrders();
      setShowStatusModal(false);
      setSelectedOrder(null);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error("Lỗi khi cập nhật trạng thái: " + errorMessage);
    }
  };

  const getStatusCount = (status) => {
    if (status === "all") return orders.length;
    return orders.filter((order) => order.TrangThai === status).length;
  };

  const columns = useMemo(
    () => [
      {
        title: "Mã Đơn",
        dataIndex: "MaDonHang",
        key: "MaDonHang",
        render: (text, record) => (
          <Text strong>#{text || record.maDonHang}</Text>
        ),
        sorter: (a, b) =>
          (a.MaDonHang || a.maDonHang || 0) - (b.MaDonHang || b.maDonHang || 0),
      },
      {
        title: "Khách Hàng",
        key: "khachHang",
        render: (_, record) => {
          const customer = record.khachHang || record.KhachHang;
          return customer ? (
            <div>
              <div style={{ fontWeight: 600 }}>
                {customer.HoTen || customer.hoTen}
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {customer.SoDienThoai || customer.soDienThoai}
              </Text>
            </div>
          ) : (
            "-"
          );
        },
      },
      {
        title: "Ngày Đặt",
        dataIndex: "NgayDat",
        key: "NgayDat",
        render: (text, record) => {
          const date = text || record.ngayDat;
          return date
            ? format(new Date(date), "dd/MM/yyyy HH:mm", { locale: vi })
            : "-";
        },
        sorter: (a, b) => {
          const dateA = new Date(a.NgayDat || a.ngayDat || 0);
          const dateB = new Date(b.NgayDat || b.ngayDat || 0);
          return dateA - dateB;
        },
      },
      {
        title: "Tổng Tiền",
        dataIndex: "TongTien",
        key: "TongTien",
        render: (text, record) => {
          const amount = text || record.tongTien || 0;
          return (
            <Text strong style={{ color: "#1890ff" }}>
              {amount.toLocaleString("vi-VN")} VNĐ
            </Text>
          );
        },
        sorter: (a, b) =>
          (a.TongTien || a.tongTien || 0) - (b.TongTien || b.tongTien || 0),
      },
      {
        title: "Trạng Thái",
        dataIndex: "TrangThai",
        key: "TrangThai",
        render: (text, record) => {
          const status = text || record.trangThai;
          const config = statusConfig[status] || {
            label: status,
            color: "default",
          };
          return <Tag color={config.color}>{config.label}</Tag>;
        },
      },
      {
        title: "Hành động",
        key: "actions",
        render: (_, record) => (
          <Space>
            <Button icon={<FiEye />} onClick={() => handleViewDetail(record)}>
              Chi tiết
            </Button>
            <Button
              icon={<FiEdit />}
              onClick={() => {
                setSelectedOrder(record);
                setShowStatusModal(true);
              }}
            >
              Cập nhật
            </Button>
          </Space>
        ),
      },
    ],
    []
  );

  return (
    <div className="order-page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Quản lý Bán hàng / Đơn hàng</p>
          <h2>Quản lý Đơn hàng</h2>
        </div>
        <Button
          type="primary"
          icon={<FiPlus />}
          size="large"
          onClick={() => {
            toast.info("Chức năng tạo đơn hàng mới sẽ được phát triển sau");
          }}
        >
          Tạo Đơn Hàng Mới
        </Button>
      </div>

      <div className="order-filters">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          size="large"
          items={[
            {
              key: "all",
              label: (
                <span>
                  Tất cả
                  <Badge
                    count={getStatusCount("all")}
                    style={{ marginLeft: 8 }}
                    showZero
                  />
                </span>
              ),
            },
            {
              key: "ChoXacNhan",
              label: (
                <span>
                  Chờ xác nhận
                  <Badge
                    count={getStatusCount("ChoXacNhan")}
                    style={{ marginLeft: 8 }}
                    showZero
                  />
                </span>
              ),
            },
            {
              key: "DangChuanBi",
              label: (
                <span>
                  Đang chuẩn bị
                  <Badge
                    count={getStatusCount("DangChuanBi")}
                    style={{ marginLeft: 8 }}
                    showZero
                  />
                </span>
              ),
            },
            {
              key: "HoanThanh",
              label: (
                <span>
                  Hoàn thành
                  <Badge
                    count={getStatusCount("HoanThanh")}
                    style={{ marginLeft: 8 }}
                    showZero
                  />
                </span>
              ),
            },
            {
              key: "DaThanhToan",
              label: (
                <span>
                  Đã thanh toán
                  <Badge
                    count={getStatusCount("DaThanhToan")}
                    style={{ marginLeft: 8 }}
                    showZero
                  />
                </span>
              ),
            },
            {
              key: "DaHuy",
              label: (
                <span>
                  Đã hủy
                  <Badge
                    count={getStatusCount("DaHuy")}
                    style={{ marginLeft: 8 }}
                    showZero
                  />
                </span>
              ),
            },
          ]}
        />
      </div>

      <div className="order-card">
        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey={(record) => record.MaDonHang || record.maDonHang}
          pagination={{ pageSize: 10 }}
        />
      </div>

      {/* Detail Modal */}
      <Modal
        title={`Chi tiết đơn hàng #${
          selectedOrder?.MaDonHang || selectedOrder?.maDonHang
        }`}
        open={showDetailModal}
        onCancel={() => {
          setShowDetailModal(false);
          setSelectedOrder(null);
        }}
        footer={null}
        width={800}
      >
        {selectedOrder && (
          <div className="order-detail">
            <div className="detail-section">
              <h4>Thông tin khách hàng</h4>
              <div className="detail-info">
                <p>
                  <strong>Họ tên:</strong>{" "}
                  {selectedOrder.khachHang?.HoTen ||
                    selectedOrder.KhachHang?.HoTen ||
                    selectedOrder.khachHang?.hoTen ||
                    "-"}
                </p>
                <p>
                  <strong>Số điện thoại:</strong>{" "}
                  {selectedOrder.khachHang?.SoDienThoai ||
                    selectedOrder.KhachHang?.SoDienThoai ||
                    selectedOrder.khachHang?.soDienThoai ||
                    "-"}
                </p>
                <p>
                  <strong>Email:</strong>{" "}
                  {selectedOrder.khachHang?.Email ||
                    selectedOrder.KhachHang?.Email ||
                    selectedOrder.khachHang?.email ||
                    "-"}
                </p>
              </div>
            </div>

            <div className="detail-section">
              <h4>Thông tin đơn hàng</h4>
              <div className="detail-info">
                <p>
                  <strong>Ngày đặt:</strong>{" "}
                  {selectedOrder.NgayDat || selectedOrder.ngayDat
                    ? format(
                        new Date(
                          selectedOrder.NgayDat || selectedOrder.ngayDat
                        ),
                        "dd/MM/yyyy HH:mm",
                        { locale: vi }
                      )
                    : "-"}
                </p>
                <p>
                  <strong>Trạng thái:</strong>{" "}
                  <Tag
                    color={
                      statusConfig[
                        selectedOrder.TrangThai || selectedOrder.trangThai
                      ]?.color || "default"
                    }
                  >
                    {statusConfig[
                      selectedOrder.TrangThai || selectedOrder.trangThai
                    ]?.label ||
                      selectedOrder.TrangThai ||
                      selectedOrder.trangThai}
                  </Tag>
                </p>
              </div>
            </div>

            <div className="detail-section">
              <h4>Chi tiết món ăn</h4>
              <Table
                dataSource={
                  selectedOrder.chiTietDonHang ||
                  selectedOrder.ChiTietDonHang ||
                  []
                }
                columns={[
                  {
                    title: "Tên món",
                    key: "tenMon",
                    render: (_, record) => {
                      const monAn = record.monAn || record.MonAn;
                      return monAn?.TenMon || monAn?.tenMon || "-";
                    },
                  },
                  {
                    title: "Số lượng",
                    dataIndex: "SoLuong",
                    key: "SoLuong",
                    render: (text, record) => text || record.soLuong || 0,
                  },
                  {
                    title: "Đơn giá",
                    dataIndex: "DonGia",
                    key: "DonGia",
                    render: (text, record) => {
                      const price = text || record.donGia || 0;
                      return `${price.toLocaleString("vi-VN")} VNĐ`;
                    },
                  },
                  {
                    title: "Thành tiền",
                    dataIndex: "ThanhTien",
                    key: "ThanhTien",
                    render: (text, record) => {
                      const total = text || record.thanhTien || 0;
                      return (
                        <Text strong>{total.toLocaleString("vi-VN")} VNĐ</Text>
                      );
                    },
                  },
                ]}
                pagination={false}
                summary={() => {
                  const chiTiet =
                    selectedOrder.chiTietDonHang ||
                    selectedOrder.ChiTietDonHang ||
                    [];
                  const tongTien = chiTiet.reduce(
                    (sum, item) =>
                      sum + (item.ThanhTien || item.thanhTien || 0),
                    0
                  );
                  return (
                    <Table.Summary fixed>
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={3}>
                          <Text strong>Tổng tiền:</Text>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1}>
                          <Text
                            strong
                            style={{ color: "#1890ff", fontSize: 16 }}
                          >
                            {tongTien.toLocaleString("vi-VN")} VNĐ
                          </Text>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    </Table.Summary>
                  );
                }}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Status Update Modal */}
      <Modal
        title="Cập nhật trạng thái đơn hàng"
        open={showStatusModal}
        onCancel={() => {
          setShowStatusModal(false);
          setSelectedOrder(null);
        }}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" form={statusForm} onFinish={handleUpdateStatus}>
          <Form.Item
            label="Trạng thái"
            name="trangThai"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select placeholder="Chọn trạng thái">
              {Object.entries(statusConfig).map(([key, config]) => (
                <Select.Option key={key} value={key}>
                  <Tag color={config.color}>{config.label}</Tag>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div className="modal-actions">
            <Button onClick={() => setShowStatusModal(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit">
              Cập nhật
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Order;
