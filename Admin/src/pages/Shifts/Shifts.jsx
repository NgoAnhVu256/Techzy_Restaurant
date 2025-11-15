import React, { useEffect, useMemo, useState } from "react";
import "./Shifts.css";
import api from "../../utils/axios";
import { toast } from "react-toastify";
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  Space,
  Typography,
  TimePicker,
} from "antd";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import dayjs from "dayjs";

const { Text } = Typography;

const Shifts = () => {
  const [shifts, setShifts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const fetchShifts = async () => {
    try {
      const response = await api.get("/shifts");
      setShifts(response.data.data || []);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách ca làm việc");
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  useEffect(() => {
    if (showEditModal && selectedShift) {
      editForm.setFieldsValue({
        tenCa: selectedShift.TenCa || selectedShift.tenCa,
        gioBatDau: selectedShift.GioBatDau || selectedShift.gioBatDau ? dayjs(selectedShift.GioBatDau || selectedShift.gioBatDau, "HH:mm:ss") : null,
        gioKetThuc: selectedShift.GioKetThuc || selectedShift.gioKetThuc ? dayjs(selectedShift.GioKetThuc || selectedShift.gioKetThuc, "HH:mm:ss") : null,
      });
    }
  }, [showEditModal, selectedShift, editForm]);

  const closeAddModal = () => {
    setShowAddModal(false);
    addForm.resetFields();
  };

  const handleAddShift = async (values) => {
    try {
      await api.post("/shifts", {
        TenCa: values.tenCa,
        GioBatDau: values.gioBatDau.format("HH:mm:ss"),
        GioKetThuc: values.gioKetThuc.format("HH:mm:ss"),
      });
      toast.success("Thêm ca làm việc thành công");
      fetchShifts();
      closeAddModal();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error("Lỗi khi thêm ca làm việc: " + errorMessage);
    }
  };

  const handleEditShift = async (values) => {
    if (!selectedShift) return;
    try {
      await api.put(
        `/shifts/${selectedShift.MaCa || selectedShift.maCa}`,
        {
          TenCa: values.tenCa,
          GioBatDau: values.gioBatDau.format("HH:mm:ss"),
          GioKetThuc: values.gioKetThuc.format("HH:mm:ss"),
        }
      );
      toast.success("Cập nhật ca làm việc thành công");
      fetchShifts();
      setShowEditModal(false);
      setSelectedShift(null);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error("Lỗi khi cập nhật ca làm việc: " + errorMessage);
    }
  };

  const handleDeleteShift = async () => {
    if (!selectedShift) return;
    try {
      await api.delete(
        `/shifts/${selectedShift.MaCa || selectedShift.maCa}`
      );
      toast.success("Xóa ca làm việc thành công");
      fetchShifts();
      setShowDeleteModal(false);
      setSelectedShift(null);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error("Lỗi khi xóa ca làm việc: " + errorMessage);
    }
  };

  const columns = useMemo(
    () => [
      {
        title: "Tên ca",
        dataIndex: "TenCa",
        key: "TenCa",
        render: (text, record) => (
          <span className="shift-name">{text || record.tenCa}</span>
        ),
        sorter: (a, b) => (a.TenCa || a.tenCa || "").localeCompare(b.TenCa || b.tenCa || ""),
      },
      {
        title: "Giờ bắt đầu",
        dataIndex: "GioBatDau",
        key: "GioBatDau",
        render: (text, record) => {
          const time = text || record.gioBatDau;
          return time ? time.substring(0, 5) : "-";
        },
        sorter: (a, b) => {
          const timeA = a.GioBatDau || a.gioBatDau || "00:00:00";
          const timeB = b.GioBatDau || b.gioBatDau || "00:00:00";
          return timeA.localeCompare(timeB);
        },
      },
      {
        title: "Giờ kết thúc",
        dataIndex: "GioKetThuc",
        key: "GioKetThuc",
        render: (text, record) => {
          const time = text || record.gioKetThuc;
          return time ? time.substring(0, 5) : "-";
        },
        sorter: (a, b) => {
          const timeA = a.GioKetThuc || a.gioKetThuc || "00:00:00";
          const timeB = b.GioKetThuc || b.gioKetThuc || "00:00:00";
          return timeA.localeCompare(timeB);
        },
      },
      {
        title: "Thao tác",
        key: "actions",
        render: (_, record) => (
          <Space>
            <Button
              icon={<FiEdit2 />}
              onClick={() => {
                setSelectedShift(record);
                setShowEditModal(true);
              }}
            >
              Sửa
            </Button>
            <Button
              icon={<FiTrash2 />}
              danger
              onClick={() => {
                setSelectedShift(record);
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
    <div className="shifts-page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Quản lý Nhân sự / Ca làm việc</p>
          <h2>Quản lý Ca làm việc</h2>
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
          Thêm Ca làm việc
        </Button>
      </div>

      <div className="shifts-card">
        <Table
          columns={columns}
          dataSource={shifts}
          rowKey={(record) => record.MaCa || record.maCa}
          pagination={{ pageSize: 10 }}
        />
      </div>

      {/* Add Modal */}
      <Modal
        title="Thêm ca làm việc mới"
        open={showAddModal}
        onCancel={closeAddModal}
        footer={null}
        destroyOnClose
      >
        <Form
          layout="vertical"
          form={addForm}
          onFinish={handleAddShift}
          initialValues={{
            tenCa: "",
            gioBatDau: dayjs("08:00", "HH:mm"),
            gioKetThuc: dayjs("17:00", "HH:mm"),
          }}
        >
          <Form.Item
            label="Tên ca"
            name="tenCa"
            rules={[{ required: true, message: "Vui lòng nhập tên ca" }]}
          >
            <Input placeholder="Ví dụ: Ca Sáng, Ca Chiều, Ca Tối" />
          </Form.Item>

          <Form.Item
            label="Giờ bắt đầu"
            name="gioBatDau"
            rules={[{ required: true, message: "Vui lòng chọn giờ bắt đầu" }]}
          >
            <TimePicker
              style={{ width: "100%" }}
              format="HH:mm"
              placeholder="Chọn giờ bắt đầu"
            />
          </Form.Item>

          <Form.Item
            label="Giờ kết thúc"
            name="gioKetThuc"
            rules={[
              { required: true, message: "Vui lòng chọn giờ kết thúc" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const startTime = getFieldValue("gioBatDau");
                  if (!value || !startTime || value.isAfter(startTime)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Giờ kết thúc phải sau giờ bắt đầu"));
                },
              }),
            ]}
          >
            <TimePicker
              style={{ width: "100%" }}
              format="HH:mm"
              placeholder="Chọn giờ kết thúc"
            />
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
        title="Chỉnh sửa ca làm việc"
        open={showEditModal}
        onCancel={() => {
          setShowEditModal(false);
          setSelectedShift(null);
        }}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" form={editForm} onFinish={handleEditShift}>
          <Form.Item
            label="Tên ca"
            name="tenCa"
            rules={[{ required: true, message: "Vui lòng nhập tên ca" }]}
          >
            <Input placeholder="Ví dụ: Ca Sáng, Ca Chiều, Ca Tối" />
          </Form.Item>

          <Form.Item
            label="Giờ bắt đầu"
            name="gioBatDau"
            rules={[{ required: true, message: "Vui lòng chọn giờ bắt đầu" }]}
          >
            <TimePicker
              style={{ width: "100%" }}
              format="HH:mm"
              placeholder="Chọn giờ bắt đầu"
            />
          </Form.Item>

          <Form.Item
            label="Giờ kết thúc"
            name="gioKetThuc"
            rules={[
              { required: true, message: "Vui lòng chọn giờ kết thúc" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const startTime = getFieldValue("gioBatDau");
                  if (!value || !startTime || value.isAfter(startTime)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Giờ kết thúc phải sau giờ bắt đầu"));
                },
              }),
            ]}
          >
            <TimePicker
              style={{ width: "100%" }}
              format="HH:mm"
              placeholder="Chọn giờ kết thúc"
            />
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
        onOk={handleDeleteShift}
        okButtonProps={{ danger: true }}
        okText="Xóa"
        cancelText="Hủy"
      >
        <p>Bạn có chắc chắn muốn xóa ca làm việc này không?</p>
        <Text strong>
          {selectedShift?.TenCa || selectedShift?.tenCa}
        </Text>
      </Modal>
    </div>
  );
};

export default Shifts;
