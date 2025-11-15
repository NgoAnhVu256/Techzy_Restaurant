import React, { useEffect, useMemo, useState } from "react";
import "./Suppliers.css";
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

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const fetchSuppliers = async () => {
    try {
      const response = await api.get("/suppliers");
      setSuppliers(response.data.data || []);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách nhà cung cấp");
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (showEditModal && selectedSupplier) {
      editForm.setFieldsValue({
        tenNhaCungCap: selectedSupplier.TenNhaCungCap || selectedSupplier.tenNhaCungCap,
        soDienThoai: selectedSupplier.SoDienThoai || selectedSupplier.soDienThoai,
        email: selectedSupplier.Email || selectedSupplier.email || "",
        diaChi: selectedSupplier.DiaChi || selectedSupplier.diaChi || "",
      });
    }
  }, [showEditModal, selectedSupplier, editForm]);

  const closeAddModal = () => {
    setShowAddModal(false);
    addForm.resetFields();
  };

  const handleAddSupplier = async (values) => {
    try {
      await api.post("/suppliers", {
        TenNhaCungCap: values.tenNhaCungCap,
        SoDienThoai: values.soDienThoai || null,
        Email: values.email || null,
        DiaChi: values.diaChi || null,
      });
      toast.success("Thêm nhà cung cấp thành công");
      fetchSuppliers();
      closeAddModal();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error("Lỗi khi thêm nhà cung cấp: " + errorMessage);
    }
  };

  const handleEditSupplier = async (values) => {
    if (!selectedSupplier) return;
    try {
      await api.put(
        `/suppliers/${selectedSupplier.MaNhaCungCap || selectedSupplier.maNhaCungCap}`,
        {
          TenNhaCungCap: values.tenNhaCungCap,
          SoDienThoai: values.soDienThoai || null,
          Email: values.email || null,
          DiaChi: values.diaChi || null,
        }
      );
      toast.success("Cập nhật nhà cung cấp thành công");
      fetchSuppliers();
      setShowEditModal(false);
      setSelectedSupplier(null);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error("Lỗi khi cập nhật nhà cung cấp: " + errorMessage);
    }
  };

  const handleDeleteSupplier = async () => {
    if (!selectedSupplier) return;
    try {
      await api.delete(
        `/suppliers/${selectedSupplier.MaNhaCungCap || selectedSupplier.maNhaCungCap}`
      );
      toast.success("Xóa nhà cung cấp thành công");
      fetchSuppliers();
      setShowDeleteModal(false);
      setSelectedSupplier(null);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error("Lỗi khi xóa nhà cung cấp: " + errorMessage);
    }
  };

  const columns = useMemo(
    () => [
      {
        title: "Tên nhà cung cấp",
        dataIndex: "TenNhaCungCap",
        key: "TenNhaCungCap",
        render: (text, record) => (
          <span className="supplier-name">{text || record.tenNhaCungCap}</span>
        ),
        sorter: (a, b) => (a.TenNhaCungCap || a.tenNhaCungCap || "").localeCompare(b.TenNhaCungCap || b.tenNhaCungCap || ""),
      },
      {
        title: "Số điện thoại",
        dataIndex: "SoDienThoai",
        key: "SoDienThoai",
        render: (text, record) => text || record.soDienThoai || "-",
      },
      {
        title: "Email",
        dataIndex: "Email",
        key: "Email",
        render: (text, record) => text || record.email || "-",
      },
      {
        title: "Địa chỉ",
        dataIndex: "DiaChi",
        key: "DiaChi",
        render: (text, record) => {
          const address = text || record.diaChi;
          return address ? (
            <Text ellipsis={{ tooltip: address }} style={{ maxWidth: 200 }}>
              {address}
            </Text>
          ) : (
            <Text type="secondary">-</Text>
          );
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
                setSelectedSupplier(record);
                setShowEditModal(true);
              }}
            >
              Sửa
            </Button>
            <Button
              icon={<FiTrash2 />}
              danger
              onClick={() => {
                setSelectedSupplier(record);
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
    <div className="suppliers-page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Quản lý Kho / Nhà cung cấp</p>
          <h2>Quản lý Nhà cung cấp</h2>
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
          Thêm Nhà cung cấp
        </Button>
      </div>

      <div className="suppliers-card">
        <Table
          columns={columns}
          dataSource={suppliers}
          rowKey={(record) => record.MaNhaCungCap || record.maNhaCungCap}
          pagination={{ pageSize: 10 }}
        />
      </div>

      {/* Add Modal */}
      <Modal
        title="Thêm nhà cung cấp mới"
        open={showAddModal}
        onCancel={closeAddModal}
        footer={null}
        destroyOnClose
      >
        <Form
          layout="vertical"
          form={addForm}
          onFinish={handleAddSupplier}
          initialValues={{ tenNhaCungCap: "", soDienThoai: "", email: "", diaChi: "" }}
        >
          <Form.Item
            label="Tên nhà cung cấp"
            name="tenNhaCungCap"
            rules={[{ required: true, message: "Vui lòng nhập tên nhà cung cấp" }]}
          >
            <Input placeholder="Nhập tên nhà cung cấp" />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="soDienThoai"
          >
            <Input placeholder="Nhập số điện thoại (tùy chọn)" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ type: "email", message: "Email không hợp lệ" }]}
          >
            <Input placeholder="Nhập email (tùy chọn)" />
          </Form.Item>

          <Form.Item label="Địa chỉ" name="diaChi">
            <Input placeholder="Nhập địa chỉ (tùy chọn)" />
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
        title="Chỉnh sửa nhà cung cấp"
        open={showEditModal}
        onCancel={() => {
          setShowEditModal(false);
          setSelectedSupplier(null);
        }}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" form={editForm} onFinish={handleEditSupplier}>
          <Form.Item
            label="Tên nhà cung cấp"
            name="tenNhaCungCap"
            rules={[{ required: true, message: "Vui lòng nhập tên nhà cung cấp" }]}
          >
            <Input placeholder="Nhập tên nhà cung cấp" />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="soDienThoai"
          >
            <Input placeholder="Nhập số điện thoại (tùy chọn)" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ type: "email", message: "Email không hợp lệ" }]}
          >
            <Input placeholder="Nhập email (tùy chọn)" />
          </Form.Item>

          <Form.Item label="Địa chỉ" name="diaChi">
            <Input placeholder="Nhập địa chỉ (tùy chọn)" />
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
        onOk={handleDeleteSupplier}
        okButtonProps={{ danger: true }}
        okText="Xóa"
        cancelText="Hủy"
      >
        <p>Bạn có chắc chắn muốn xóa nhà cung cấp này không?</p>
        <Text strong>
          {selectedSupplier?.TenNhaCungCap || selectedSupplier?.tenNhaCungCap}
        </Text>
      </Modal>
    </div>
  );
};

export default Suppliers;
