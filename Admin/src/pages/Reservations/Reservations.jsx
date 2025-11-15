import React, { useEffect, useMemo, useState } from "react";
import "./Reservations.css";
import api from "../../utils/axios";
import { toast } from "react-toastify";
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Typography,
  Tag,
} from "antd";
import { FiEdit2, FiTrash2, FiPlus, FiEye } from "react-icons/fi";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const { Text } = Typography;

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [tables, setTables] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFoodsModal, setShowFoodsModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const fetchReservations = async () => {
    try {
      const response = await api.get("/reservations");
      setReservations(response.data.data || []);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách đặt bàn");
    }
  };

  const fetchReservationFoods = async (maDatBan) => {
    try {
      const response = await api.get(`/reservations/${maDatBan}/monan`);
      setSelectedFoods(response.data.data || []);
      setShowFoodsModal(true);
    } catch (error) {
      toast.error("Lỗi khi tải thông tin món ăn");
      console.error("Error fetching foods:", error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get("/customers");
      setCustomers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const fetchTables = async () => {
    try {
      const response = await api.get("/tables");
      setTables(response.data.data || []);
    } catch (error) {
      console.error("Error fetching tables:", error);
    }
  };

  useEffect(() => {
    fetchReservations();
    fetchCustomers();
    fetchTables();
    const interval = setInterval(() => {
      fetchReservations();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showEditModal && selectedReservation) {
      const reservation = selectedReservation;
      editForm.setFieldsValue({
        maBan: reservation.MaBan || reservation.maBan || "",
        maKH: reservation.MaKH || reservation.maKH || "",
        thoiGianBatDau:
          reservation.ThoiGianBatDau || reservation.thoiGianBatDau
            ? new Date(reservation.ThoiGianBatDau || reservation.thoiGianBatDau)
                .toISOString()
                .slice(0, 16)
            : "",
        thoiGianKetThuc:
          reservation.ThoiGianKetThuc || reservation.thoiGianKetThuc
            ? new Date(
                reservation.ThoiGianKetThuc || reservation.thoiGianKetThuc
              )
                .toISOString()
                .slice(0, 16)
            : "",
        soNguoi: reservation.SoNguoi || reservation.soNguoi || 1,
        ghiChu: reservation.GhiChu || reservation.ghiChu || "",
      });
    }
  }, [showEditModal, selectedReservation, editForm]);

  const closeAddModal = () => {
    setShowAddModal(false);
    addForm.resetFields();
  };

  const handleAdd = async (values) => {
    try {
      await api.post("/reservations", {
        MaBan: values.maBan,
        MaKH: values.maKH,
        ThoiGianBatDau: values.thoiGianBatDau,
        ThoiGianKetThuc: values.thoiGianKetThuc,
        SoNguoi: parseInt(values.soNguoi),
        GhiChu: values.ghiChu || "",
      });
      toast.success("Thêm đặt bàn thành công");
      fetchReservations();
      closeAddModal();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error("Lỗi khi thêm đặt bàn: " + errorMessage);
    }
  };

  const handleEdit = async (values) => {
    if (!selectedReservation) return;
    try {
      await api.put(
        `/reservations/${
          selectedReservation.MaDatBan || selectedReservation.maDatBan
        }`,
        {
          MaBan: values.maBan,
          MaKH: values.maKH,
          ThoiGianBatDau: values.thoiGianBatDau,
          ThoiGianKetThuc: values.thoiGianKetThuc,
          SoNguoi: parseInt(values.soNguoi),
          GhiChu: values.ghiChu || "",
        }
      );
      toast.success("Cập nhật đặt bàn thành công");
      fetchReservations();
      setShowEditModal(false);
      setSelectedReservation(null);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error("Lỗi khi cập nhật đặt bàn: " + errorMessage);
    }
  };

  const handleDelete = async () => {
    if (!selectedReservation) return;
    try {
      await api.delete(
        `/reservations/${
          selectedReservation.MaDatBan || selectedReservation.maDatBan
        }`
      );
      toast.success("Xóa đặt bàn thành công");
      fetchReservations();
      setShowDeleteModal(false);
      setSelectedReservation(null);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error("Lỗi khi xóa đặt bàn: " + errorMessage);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return format(date, "HH:mm dd/MM/yyyy", { locale: vi });
    } catch (error) {
      return "-";
    }
  };

  const columns = useMemo(
    () => [
      {
        title: "Mã đặt bàn",
        dataIndex: "MaDatBan",
        key: "MaDatBan",
        render: (text, record) => text || record.maDatBan,
      },
      {
        title: "Tên bàn",
        key: "ban",
        render: (_, record) => record.ban?.TenBan || record.ban?.tenBan || "-",
      },
      {
        title: "Khách hàng",
        key: "khachHang",
        render: (_, record) =>
          record.khachHang?.HoTen || record.khachHang?.hoTen || "-",
      },
      {
        title: "Số điện thoại",
        key: "phone",
        render: (_, record) =>
          record.khachHang?.SoDienThoai || record.khachHang?.soDienThoai || "-",
      },
      {
        title: "Ngày đặt",
        dataIndex: "NgayDat",
        key: "NgayDat",
        render: (text, record) => {
          const date = text || record.ngayDat;
          return date
            ? format(new Date(date), "dd/MM/yyyy", { locale: vi })
            : "-";
        },
      },
      {
        title: "Thời gian bắt đầu",
        dataIndex: "ThoiGianBatDau",
        key: "ThoiGianBatDau",
        render: (text, record) => formatDateTime(text || record.thoiGianBatDau),
      },
      {
        title: "Thời gian kết thúc",
        dataIndex: "ThoiGianKetThuc",
        key: "ThoiGianKetThuc",
        render: (text, record) =>
          formatDateTime(text || record.thoiGianKetThuc),
      },
      {
        title: "Số người",
        dataIndex: "SoNguoi",
        key: "SoNguoi",
        render: (text, record) => text || record.soNguoi || "-",
      },
      {
        title: "Ghi chú",
        dataIndex: "GhiChu",
        key: "GhiChu",
        render: (text, record) => {
          const note = text || record.ghiChu;
          return note ? (
            <Text ellipsis={{ tooltip: note }} style={{ maxWidth: 150 }}>
              {note}
            </Text>
          ) : (
            "-"
          );
        },
      },
      {
        title: "Thao tác",
        key: "actions",
        render: (_, record) => (
          <Space>
            <Button
              icon={<FiEye />}
              onClick={() =>
                fetchReservationFoods(record.MaDatBan || record.maDatBan)
              }
            >
              Món ăn
            </Button>
            <Button
              icon={<FiEdit2 />}
              onClick={() => {
                setSelectedReservation(record);
                setShowEditModal(true);
              }}
            >
              Sửa
            </Button>
            <Button
              icon={<FiTrash2 />}
              danger
              onClick={() => {
                setSelectedReservation(record);
                setShowDeleteModal(true);
              }}
            >
              Xóa
            </Button>
          </Space>
        ),
      },
    ],
    []
  );

  return (
    <div className="reservations-page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Quản lý bán hàng / Đặt bàn</p>
          <h2>Quản lý Đặt bàn</h2>
        </div>
        <Button
          type="primary"
          icon={<FiPlus />}
          size="large"
          onClick={() => {
            addForm.resetFields();
            setShowAddModal(true);
          }}
        >
          Thêm Đặt bàn
        </Button>
      </div>

      <div className="reservations-card">
        <Table
          columns={columns}
          dataSource={reservations}
          rowKey={(record) => record.MaDatBan || record.maDatBan}
          pagination={{ pageSize: 10 }}
        />
      </div>

      {/* Foods Modal */}
      <Modal
        title="Chi tiết món ăn đã đặt"
        open={showFoodsModal}
        onCancel={() => setShowFoodsModal(false)}
        footer={null}
        width={800}
      >
        {selectedFoods.length > 0 ? (
          <Table
            dataSource={selectedFoods}
            columns={[
              {
                title: "Tên món",
                dataIndex: "tenMon",
                key: "tenMon",
              },
              {
                title: "Số lượng",
                dataIndex: "soLuong",
                key: "soLuong",
              },
              {
                title: "Đơn giá",
                dataIndex: "donGia",
                key: "donGia",
                render: (price) => `${price?.toLocaleString()} VNĐ`,
              },
              {
                title: "Thành tiền",
                key: "total",
                render: (_, record) =>
                  `${(
                    (record.soLuong || 0) * (record.donGia || 0)
                  ).toLocaleString()} VNĐ`,
              },
            ]}
            pagination={false}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3}>
                    <Text strong>Tổng tiền:</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <Text strong>
                      {selectedFoods
                        .reduce(
                          (total, food) =>
                            total + (food.soLuong || 0) * (food.donGia || 0),
                          0
                        )
                        .toLocaleString()}{" "}
                      VNĐ
                    </Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        ) : (
          <p>Không có món ăn nào được đặt</p>
        )}
      </Modal>

      {/* Add Modal */}
      <Modal
        title="Thêm đặt bàn mới"
        open={showAddModal}
        onCancel={closeAddModal}
        footer={null}
        destroyOnClose
        width={600}
      >
        <Form
          layout="vertical"
          form={addForm}
          onFinish={handleAdd}
          initialValues={{
            maBan: "",
            maKH: "",
            thoiGianBatDau: "",
            thoiGianKetThuc: "",
            soNguoi: 1,
            ghiChu: "",
          }}
        >
          <Form.Item
            label="Bàn"
            name="maBan"
            rules={[{ required: true, message: "Vui lòng chọn bàn" }]}
          >
            <Select
              placeholder="Chọn bàn"
              showSearch
              optionFilterProp="children"
            >
              {tables.map((table) => (
                <Select.Option
                  key={table.MaBan || table.maBan}
                  value={table.MaBan || table.maBan}
                >
                  {table.TenBan || table.tenBan} - Sức chứa:{" "}
                  {table.SucChua || table.sucChua} người
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Khách hàng"
            name="maKH"
            rules={[{ required: true, message: "Vui lòng chọn khách hàng" }]}
          >
            <Select
              placeholder="Chọn khách hàng"
              showSearch
              optionFilterProp="children"
            >
              {customers.map((customer) => (
                <Select.Option
                  key={customer.MaKH || customer.maKhachHang}
                  value={customer.MaKH || customer.maKhachHang}
                >
                  {customer.HoTen || customer.hoTen} -{" "}
                  {customer.SoDienThoai || customer.soDienThoai}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Thời gian bắt đầu"
            name="thoiGianBatDau"
            rules={[
              { required: true, message: "Vui lòng chọn thời gian bắt đầu" },
            ]}
          >
            <Input
              type="datetime-local"
              min={new Date().toISOString().slice(0, 16)}
            />
          </Form.Item>

          <Form.Item
            label="Thời gian kết thúc"
            name="thoiGianKetThuc"
            rules={[
              { required: true, message: "Vui lòng chọn thời gian kết thúc" },
            ]}
          >
            <Input type="datetime-local" />
          </Form.Item>

          <Form.Item
            label="Số người"
            name="soNguoi"
            rules={[
              { required: true, message: "Vui lòng nhập số người" },
              { type: "number", min: 1, message: "Số người phải lớn hơn 0" },
            ]}
          >
            <InputNumber
              placeholder="Nhập số người"
              style={{ width: "100%" }}
              min={1}
            />
          </Form.Item>

          <Form.Item label="Ghi chú" name="ghiChu">
            <Input.TextArea placeholder="Nhập ghi chú (nếu có)" rows={3} />
          </Form.Item>

          <div className="modal-actions">
            <Button onClick={closeAddModal}>Hủy</Button>
            <Button type="primary" htmlType="submit">
              Thêm
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa đặt bàn"
        open={showEditModal}
        onCancel={() => {
          setShowEditModal(false);
          setSelectedReservation(null);
        }}
        footer={null}
        destroyOnClose
        width={600}
      >
        <Form layout="vertical" form={editForm} onFinish={handleEdit}>
          <Form.Item
            label="Bàn"
            name="maBan"
            rules={[{ required: true, message: "Vui lòng chọn bàn" }]}
          >
            <Select
              placeholder="Chọn bàn"
              showSearch
              optionFilterProp="children"
            >
              {tables.map((table) => (
                <Select.Option
                  key={table.MaBan || table.maBan}
                  value={table.MaBan || table.maBan}
                >
                  {table.TenBan || table.tenBan} - Sức chứa:{" "}
                  {table.SucChua || table.sucChua} người
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Khách hàng"
            name="maKH"
            rules={[{ required: true, message: "Vui lòng chọn khách hàng" }]}
          >
            <Select
              placeholder="Chọn khách hàng"
              showSearch
              optionFilterProp="children"
            >
              {customers.map((customer) => (
                <Select.Option
                  key={customer.MaKH || customer.maKhachHang}
                  value={customer.MaKH || customer.maKhachHang}
                >
                  {customer.HoTen || customer.hoTen} -{" "}
                  {customer.SoDienThoai || customer.soDienThoai}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Thời gian bắt đầu"
            name="thoiGianBatDau"
            rules={[
              { required: true, message: "Vui lòng chọn thời gian bắt đầu" },
            ]}
          >
            <Input type="datetime-local" />
          </Form.Item>

          <Form.Item
            label="Thời gian kết thúc"
            name="thoiGianKetThuc"
            rules={[
              { required: true, message: "Vui lòng chọn thời gian kết thúc" },
            ]}
          >
            <Input type="datetime-local" />
          </Form.Item>

          <Form.Item
            label="Số người"
            name="soNguoi"
            rules={[
              { required: true, message: "Vui lòng nhập số người" },
              { type: "number", min: 1, message: "Số người phải lớn hơn 0" },
            ]}
          >
            <InputNumber
              placeholder="Nhập số người"
              style={{ width: "100%" }}
              min={1}
            />
          </Form.Item>

          <Form.Item label="Ghi chú" name="ghiChu">
            <Input.TextArea placeholder="Nhập ghi chú (nếu có)" rows={3} />
          </Form.Item>

          <div className="modal-actions">
            <Button onClick={() => setShowEditModal(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit">
              Lưu
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        title="Xác nhận xóa"
        open={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onOk={handleDelete}
        okButtonProps={{ danger: true }}
        okText="Xóa"
        cancelText="Hủy"
      >
        <p>Bạn có chắc chắn muốn xóa đặt bàn này không?</p>
        <Text strong>
          Mã đặt bàn:{" "}
          {selectedReservation?.MaDatBan || selectedReservation?.maDatBan}
        </Text>
      </Modal>
    </div>
  );
};

export default Reservations;
