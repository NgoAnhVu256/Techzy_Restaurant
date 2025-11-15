import React, { useEffect, useMemo, useState } from "react";
import "./Categories.css";
import api from "../../utils/axios";
import { toast } from "react-toastify";
import { FILE_BASE_URL } from "../../config/apiConfig";
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  Upload,
  Space,
  Typography,
} from "antd";
import { FiEdit2, FiTrash2, FiPlus, FiUpload } from "react-icons/fi";

const { Text } = Typography;

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({
    hinhAnh: null,
  });
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data.data);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách loại món");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (showEditModal && selectedCategory) {
      editForm.setFieldsValue({
        tenLoai: selectedCategory.tenLoai || selectedCategory.TenLoai,
      });
    }
  }, [showEditModal, selectedCategory, editForm]);

  const closeAddModal = () => {
    setShowAddModal(false);
    setNewCategory({ hinhAnh: null });
    addForm.resetFields();
  };

  const handleAddCategory = async (values) => {
    if (!newCategory.hinhAnh) {
      toast.error("Vui lòng chọn hình ảnh");
      return;
    }

    const formData = new FormData();
    formData.append("TenLoai", values.tenLoai || values.TenLoai);

    // Đảm bảo file được append đúng cách
    if (newCategory.hinhAnh instanceof File) {
      formData.append("HinhAnh", newCategory.hinhAnh);
    } else {
      toast.error("File không hợp lệ");
      return;
    }

    try {
      await api.post("/categories", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Thêm loại món thành công");
      fetchCategories();
      closeAddModal();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      const errorDetails = error.response?.data?.received;
      toast.error("Lỗi khi thêm loại món: " + errorMessage);
      console.error("Error adding category:", {
        message: errorMessage,
        details: errorDetails,
        fullError: error.response?.data,
      });
    }
  };

  const handleDeleteCategory = async () => {
    try {
      await api.delete(
        `/categories/${selectedCategory.MaLoai || selectedCategory.maLoai}`
      );
      toast.success("Xóa loại món thành công");
      fetchCategories();
      setShowDeleteModal(false);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error("Lỗi khi xóa loại món: " + errorMessage);
    }
  };

  const handleEditCategory = async (values) => {
    if (!selectedCategory) return;
    const formData = new FormData();
    formData.append("TenLoai", values.tenLoai);
    if (selectedCategory.newHinhAnh) {
      formData.append("HinhAnh", selectedCategory.newHinhAnh);
    }

    try {
      await api.put(
        `/categories/${selectedCategory.MaLoai || selectedCategory.maLoai}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Cập nhật loại món thành công");
      fetchCategories();
      setShowEditModal(false);
      setSelectedCategory(null);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.response?.data || error.message;
      toast.error(`Lỗi khi cập nhật loại món: ${errorMessage}`);
    }
  };

  const addUploadProps = {
    beforeUpload: (file) => {
      setNewCategory((prev) => ({ ...prev, hinhAnh: file }));
      return false;
    },
    onRemove: () => {
      setNewCategory((prev) => ({ ...prev, hinhAnh: null }));
    },
    fileList: newCategory.hinhAnh
      ? [
          {
            uid: "-1",
            name: newCategory.hinhAnh.name,
            status: "done",
          },
        ]
      : [],
    accept: "image/*",
  };

  const editUploadProps = {
    beforeUpload: (file) => {
      setSelectedCategory((prev) => ({
        ...prev,
        newHinhAnh: file,
      }));
      return false;
    },
    onRemove: () => {
      setSelectedCategory((prev) => ({
        ...prev,
        newHinhAnh: null,
      }));
    },
    fileList: selectedCategory?.newHinhAnh
      ? [
          {
            uid: "-1",
            name: selectedCategory.newHinhAnh.name,
            status: "done",
          },
        ]
      : [],
    accept: "image/*",
  };

  const columns = useMemo(
    () => [
      {
        title: "Hình ảnh",
        dataIndex: "HinhAnh",
        key: "HinhAnh",
        render: (image, record) => (
          <img
            src={`${FILE_BASE_URL}/images/${image || record.HinhAnh}`}
            alt={record.TenLoai || record.tenLoai}
            className="category-thumb"
          />
        ),
      },
      {
        title: "Tên loại",
        dataIndex: "TenLoai",
        key: "TenLoai",
        render: (text, record) => (
          <span className="category-name">{text || record.tenLoai}</span>
        ),
      },
      {
        title: "Thao tác",
        key: "actions",
        render: (_, record) => (
          <Space>
            <Button
              icon={<FiEdit2 />}
              onClick={() => {
                setSelectedCategory(record);
                setShowEditModal(true);
              }}
            >
              Sửa
            </Button>
            <Button
              icon={<FiTrash2 />}
              danger
              onClick={() => {
                setSelectedCategory(record);
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
    <div className="categories-page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Quản lý thực đơn / Loại món</p>
          <h2>Quản lý Loại món</h2>
        </div>
        <Button
          type="primary"
          icon={<FiPlus />}
          size="large"
          onClick={() => {
            addForm.resetFields();
            setNewCategory({ hinhAnh: null });
            setShowAddModal(true);
          }}
        >
          Thêm Loại món
        </Button>
      </div>

      <div className="categories-card">
        <Table
          columns={columns}
          dataSource={categories}
          rowKey={(record) => record.MaLoai || record.maLoai}
          pagination={{ pageSize: 8 }}
        />
      </div>

      <Modal
        title="Thêm loại món mới"
        open={showAddModal}
        onCancel={closeAddModal}
        footer={null}
        destroyOnClose
      >
        <Form
          layout="vertical"
          form={addForm}
          onFinish={handleAddCategory}
          initialValues={{ tenLoai: "" }}
        >
          <Form.Item
            label="Tên loại món"
            name="tenLoai"
            rules={[{ required: true, message: "Vui lòng nhập tên loại món" }]}
          >
            <Input placeholder="Nhập tên loại món" />
          </Form.Item>

          <Form.Item
            label="Hình ảnh"
            required
            help={!newCategory.hinhAnh && "Vui lòng chọn hình ảnh"}
            validateStatus={!newCategory.hinhAnh ? "error" : ""}
          >
            <Upload {...addUploadProps} listType="picture">
              <Button icon={<FiUpload />}>Chọn hình ảnh</Button>
            </Upload>
          </Form.Item>

          <div className="modal-actions">
            <Button onClick={closeAddModal}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              disabled={!newCategory.hinhAnh}
            >
              Thêm
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title="Xác nhận xóa"
        open={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onOk={handleDeleteCategory}
        okButtonProps={{ danger: true }}
        okText="Xóa"
        cancelText="Hủy"
      >
        <p>Bạn có chắc chắn muốn xóa loại món này không?</p>
        <Text strong>
          {selectedCategory?.TenLoai || selectedCategory?.tenLoai}
        </Text>
      </Modal>

      <Modal
        title="Chỉnh sửa loại món"
        open={showEditModal}
        onCancel={() => {
          setShowEditModal(false);
          setSelectedCategory(null);
        }}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" form={editForm} onFinish={handleEditCategory}>
          <Form.Item
            label="Tên loại món"
            name="tenLoai"
            rules={[{ required: true, message: "Vui lòng nhập tên loại món" }]}
          >
            <Input placeholder="Nhập tên loại món" />
          </Form.Item>

          <Form.Item label="Hình ảnh hiện tại">
            <div className="current-image">
              <img
                src={`${FILE_BASE_URL}/images/${
                  selectedCategory?.HinhAnh || selectedCategory?.hinhAnh
                }`}
                alt={selectedCategory?.TenLoai || selectedCategory?.tenLoai}
              />
            </div>
          </Form.Item>

          <Form.Item label="Cập nhật hình ảnh">
            <Upload {...editUploadProps} listType="picture">
              <Button icon={<FiUpload />}>Chọn hình ảnh mới</Button>
            </Upload>
            <p className="file-note">*Chỉ chọn nếu muốn thay đổi hình ảnh</p>
          </Form.Item>

          <div className="modal-actions">
            <Button onClick={() => setShowEditModal(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit">
              Lưu
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Categories;
