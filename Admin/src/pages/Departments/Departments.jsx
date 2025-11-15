import React, { useEffect, useMemo, useState } from "react";
import "./Departments.css";
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
} from "antd";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";

const { Text } = Typography;

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const fetchDepartments = async () => {
    try {
      const response = await api.get("/departments");
      setDepartments(response.data.data || []);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách phòng ban");
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (showEditModal && selectedDepartment) {
      editForm.setFieldsValue({
        tenPhongBan: selectedDepartment.TenPhongBan || selectedDepartment.tenPhongBan,
      });
    }
  }, [showEditModal, selectedDepartment, editForm]);

  const closeAddModal = () => {
    setShowAddModal(false);
    addForm.resetFields();
  };

  const handleAddDepartment = async (values) => {
    try {
      await api.post("/departments", {
        TenPhongBan: values.tenPhongBan,
      });
      toast.success("Thêm phòng ban thành công");
      fetchDepartments();
      closeAddModal();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error("Lỗi khi thêm phòng ban: " + errorMessage);
    }
  };

  const handleEditDepartment = async (values) => {
    if (!selectedDepartment) return;
    try {
      await api.put(
        `/departments/${selectedDepartment.MaPhongBan || selectedDepartment.maPhongBan}`,
        {
          TenPhongBan: values.tenPhongBan,
        }
      );
      toast.success("Cập nhật phòng ban thành công");
      fetchDepartments();
      setShowEditModal(false);
      setSelectedDepartment(null);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error("Lỗi khi cập nhật phòng ban: " + errorMessage);
    }
  };

  const handleDeleteDepartment = async () => {
    if (!selectedDepartment) return;
    try {
      await api.delete(
        `/departments/${selectedDepartment.MaPhongBan || selectedDepartment.maPhongBan}`
      );
      toast.success("Xóa phòng ban thành công");
      fetchDepartments();
      setShowDeleteModal(false);
      setSelectedDepartment(null);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error("Lỗi khi xóa phòng ban: " + errorMessage);
    }
  };

  const columns = useMemo(
    () => [
      {
        title: "Tên phòng ban",
        dataIndex: "TenPhongBan",
        key: "TenPhongBan",
        render: (text, record) => (
          <span className="department-name">{text || record.tenPhongBan}</span>
        ),
        sorter: (a, b) => (a.TenPhongBan || a.tenPhongBan || "").localeCompare(b.TenPhongBan || b.tenPhongBan || ""),
      },
      {
        title: "Thao tác",
        key: "actions",
        render: (_, record) => (
          <Space>
            <Button
              icon={<FiEdit2 />}
              onClick={() => {
                setSelectedDepartment(record);
                setShowEditModal(true);
              }}
            >
              Sửa
            </Button>
            <Button
              icon={<FiTrash2 />}
              danger
              onClick={() => {
                setSelectedDepartment(record);
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
    <div className="departments-page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Quản lý Nhân sự / Phòng ban</p>
          <h2>Quản lý Phòng ban</h2>
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
          Thêm Phòng ban
        </Button>
      </div>

      <div className="departments-card">
        <Table
          columns={columns}
          dataSource={departments}
          rowKey={(record) => record.MaPhongBan || record.maPhongBan}
          pagination={{ pageSize: 10 }}
        />
      </div>

      {/* Add Modal */}
      <Modal
        title="Thêm phòng ban mới"
        open={showAddModal}
        onCancel={closeAddModal}
        footer={null}
        destroyOnClose
      >
        <Form
          layout="vertical"
          form={addForm}
          onFinish={handleAddDepartment}
          initialValues={{ tenPhongBan: "" }}
        >
          <Form.Item
            label="Tên phòng ban"
            name="tenPhongBan"
            rules={[{ required: true, message: "Vui lòng nhập tên phòng ban" }]}
          >
            <Input placeholder="Nhập tên phòng ban" />
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
        title="Chỉnh sửa phòng ban"
        open={showEditModal}
        onCancel={() => {
          setShowEditModal(false);
          setSelectedDepartment(null);
        }}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" form={editForm} onFinish={handleEditDepartment}>
          <Form.Item
            label="Tên phòng ban"
            name="tenPhongBan"
            rules={[{ required: true, message: "Vui lòng nhập tên phòng ban" }]}
          >
            <Input placeholder="Nhập tên phòng ban" />
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
        onOk={handleDeleteDepartment}
        okButtonProps={{ danger: true }}
        okText="Xóa"
        cancelText="Hủy"
      >
        <p>Bạn có chắc chắn muốn xóa phòng ban này không?</p>
        <Text strong>
          {selectedDepartment?.TenPhongBan || selectedDepartment?.tenPhongBan}
        </Text>
      </Modal>
    </div>
  );
};

export default Departments;
