import React, { useEffect, useMemo, useState } from "react";
import "./Foods.css";
import api from "../../utils/axios";
import { toast } from "react-toastify";
import { FILE_BASE_URL } from "../../config/apiConfig";
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  Space,
  Typography,
  Breadcrumb,
} from "antd";
import { FiEdit2, FiTrash2, FiPlus, FiUpload } from "react-icons/fi";

const { Text } = Typography;

const Foods = () => {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [newFood, setNewFood] = useState({
    hinhAnh: null,
  });
  const [filterCategory, setFilterCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // Fetch foods
  const fetchFoods = async () => {
    try {
      const response = await api.get("/menu");
      setFoods(response.data.data || []);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách món ăn");
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      const categoriesData = response.data.data || [];
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error(
        "Lỗi khi tải danh sách loại món: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  useEffect(() => {
    fetchFoods();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (showEditModal && selectedFood) {
      editForm.setFieldsValue({
        tenMon: selectedFood.tenMon || selectedFood.TenMon,
        gia: selectedFood.gia || selectedFood.Gia,
        maLoai:
          selectedFood.maLoai ||
          selectedFood.MaLoai ||
          selectedFood.loaiMon?.MaLoai,
      });
    }
  }, [showEditModal, selectedFood, editForm]);

  const closeAddModal = () => {
    setShowAddModal(false);
    setNewFood({ hinhAnh: null });
    addForm.resetFields();
  };

  const handleAddFood = async (values) => {
    if (!newFood.hinhAnh) {
      toast.error("Vui lòng chọn hình ảnh");
      return;
    }

    const formData = new FormData();
    formData.append("TenMon", values.tenMon);
    formData.append("Gia", values.gia);
    formData.append("MaLoai", values.maLoai);

    if (newFood.hinhAnh instanceof File) {
      formData.append("HinhAnh", newFood.hinhAnh);
    } else {
      toast.error("File không hợp lệ");
      return;
    }

    try {
      await api.post("/menu", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Thêm món ăn thành công");
      fetchFoods();
      closeAddModal();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error("Lỗi khi thêm món ăn: " + errorMessage);
      console.error("Error adding food:", error.response?.data || error);
    }
  };

  const handleDeleteFood = async () => {
    try {
      await api.delete(`/menu/${selectedFood.maMon || selectedFood.MaMon}`);
      toast.success("Xóa món ăn thành công");
      fetchFoods();
      setShowDeleteModal(false);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error("Lỗi khi xóa món ăn: " + errorMessage);
    }
  };

  const handleEditFood = async (values) => {
    if (!selectedFood) return;
    const formData = new FormData();
    formData.append("TenMon", values.tenMon);
    formData.append("Gia", values.gia);
    formData.append("MaLoai", values.maLoai);

    if (selectedFood.hinhAnh instanceof File) {
      formData.append("HinhAnh", selectedFood.hinhAnh);
    }

    try {
      await api.put(
        `/menu/${selectedFood.maMon || selectedFood.MaMon}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Cập nhật món ăn thành công");
      fetchFoods();
      setShowEditModal(false);
      setSelectedFood(null);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error("Lỗi khi cập nhật món ăn: " + errorMessage);
    }
  };

  const addUploadProps = {
    beforeUpload: (file) => {
      setNewFood((prev) => ({ ...prev, hinhAnh: file }));
      return false;
    },
    onRemove: () => {
      setNewFood((prev) => ({ ...prev, hinhAnh: null }));
    },
    fileList: newFood.hinhAnh
      ? [
          {
            uid: "-1",
            name: newFood.hinhAnh.name,
            status: "done",
          },
        ]
      : [],
    accept: "image/*",
  };

  const editUploadProps = {
    beforeUpload: (file) => {
      setSelectedFood((prev) => ({
        ...prev,
        hinhAnh: file,
      }));
      return false;
    },
    onRemove: () => {
      setSelectedFood((prev) => ({
        ...prev,
        hinhAnh: null,
      }));
    },
    fileList:
      selectedFood?.hinhAnh instanceof File
        ? [
            {
              uid: "-1",
              name: selectedFood.hinhAnh.name,
              status: "done",
            },
          ]
        : [],
    accept: "image/*",
  };

  // Filter foods
  const filteredFoods = useMemo(() => {
    let filtered = foods;
    if (filterCategory) {
      filtered = filtered.filter(
        (f) => (f.MaLoai || f.maLoai) === filterCategory
      );
    }
    if (searchTerm) {
      filtered = filtered.filter((f) =>
        (f.TenMon || f.tenMon || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [foods, filterCategory, searchTerm]);

  const columns = useMemo(
    () => [
      {
        title: "Hình ảnh",
        dataIndex: "HinhAnh",
        key: "HinhAnh",
        render: (image, record) => (
          <img
            src={`${FILE_BASE_URL}/images/${image || record.HinhAnh}`}
            alt={record.TenMon || record.tenMon}
            className="food-thumb"
          />
        ),
      },
      {
        title: "Tên món",
        dataIndex: "TenMon",
        key: "TenMon",
        render: (text, record) => (
          <span className="food-name">{text || record.tenMon}</span>
        ),
        filteredValue: searchTerm ? [searchTerm] : null,
        onFilter: (value, record) =>
          (record.TenMon || record.tenMon || "")
            .toLowerCase()
            .includes(value.toLowerCase()),
      },
      {
        title: "Giá",
        dataIndex: "Gia",
        key: "Gia",
        render: (price, record) => (
          <span className="food-price">
            {parseFloat(price || record.Gia || 0).toLocaleString()} VNĐ
          </span>
        ),
        sorter: (a, b) => parseFloat(a.Gia || 0) - parseFloat(b.Gia || 0),
      },
      {
        title: "Loại món",
        dataIndex: ["loaiMon", "TenLoai"],
        key: "loaiMon",
        render: (text, record) => (
          <span className="food-category">
            {text || record.loaiMon?.TenLoai || "N/A"}
          </span>
        ),
        filters: categories.map((cat) => ({
          text: cat.TenLoai || cat.tenLoai,
          value: cat.MaLoai || cat.maLoai,
        })),
        onFilter: (value, record) => (record.MaLoai || record.maLoai) === value,
      },
      {
        title: "Thao tác",
        key: "actions",
        render: (_, record) => (
          <Space>
            <Button
              icon={<FiEdit2 />}
              onClick={() => {
                setSelectedFood({
                  ...record,
                  tenMon: record.TenMon,
                  gia: record.Gia,
                  maLoai: record.MaLoai,
                  maMon: record.MaMon,
                  loaiMon: record.loaiMon,
                });
                setShowEditModal(true);
              }}
            >
              Sửa
            </Button>
            <Button
              icon={<FiTrash2 />}
              danger
              onClick={() => {
                setSelectedFood(record);
                setShowDeleteModal(true);
              }}
            >
              Xóa
            </Button>
          </Space>
        ),
      },
    ],
    [categories]
  );

  return (
    <div className="foods-page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Quản lý Thực đơn / Món ăn</p>
          <h2>Quản lý Món ăn</h2>
        </div>
        <Button
          type="primary"
          icon={<FiPlus />}
          size="large"
          onClick={() => {
            addForm.resetFields();
            setNewFood({ hinhAnh: null });
            setShowAddModal(true);
          }}
        >
          Thêm Món ăn
        </Button>
      </div>

      {/* Filters Toolbar */}
      <div className="foods-toolbar">
        <div className="toolbar-filters">
          <Input
            placeholder="Tìm kiếm theo tên món..."
            prefix={<span style={{ marginRight: 8 }}>🔍</span>}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Select
            placeholder="Lọc theo Loại món"
            allowClear
            value={filterCategory}
            onChange={setFilterCategory}
            style={{ width: 200 }}
            showSearch
            optionFilterProp="children"
          >
            {categories.map((category) => (
              <Select.Option
                key={category.MaLoai || category.maLoai}
                value={category.MaLoai || category.maLoai}
              >
                {category.TenLoai || category.tenLoai}
              </Select.Option>
            ))}
          </Select>
        </div>
      </div>

      <div className="foods-card">
        <Table
          columns={columns}
          dataSource={filteredFoods}
          rowKey={(record) => record.MaMon || record.maMon}
          pagination={{ pageSize: 8 }}
        />
      </div>

      <Modal
        title="Thêm món ăn mới"
        open={showAddModal}
        onCancel={closeAddModal}
        footer={null}
        destroyOnClose
      >
        <Form
          layout="vertical"
          form={addForm}
          onFinish={handleAddFood}
          initialValues={{ tenMon: "", gia: "", maLoai: undefined }}
        >
          <Form.Item
            label="Tên món"
            name="tenMon"
            rules={[{ required: true, message: "Vui lòng nhập tên món" }]}
          >
            <Input placeholder="Nhập tên món" />
          </Form.Item>

          <Form.Item
            label="Giá (VNĐ)"
            name="gia"
            rules={[
              { required: true, message: "Vui lòng nhập giá" },
              { type: "number", min: 0, message: "Giá phải lớn hơn 0" },
            ]}
          >
            <InputNumber
              placeholder="Nhập giá"
              style={{ width: "100%" }}
              min={0}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            />
          </Form.Item>

          <Form.Item
            label="Loại món"
            name="maLoai"
            rules={[{ required: true, message: "Vui lòng chọn loại món" }]}
          >
            <Select placeholder="Chọn loại món">
              {categories.map((category) => (
                <Select.Option
                  key={category.MaLoai || category.maLoai}
                  value={category.MaLoai || category.maLoai}
                >
                  {category.TenLoai || category.tenLoai}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Hình ảnh"
            required
            help={!newFood.hinhAnh && "Vui lòng chọn hình ảnh"}
            validateStatus={!newFood.hinhAnh ? "error" : ""}
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
              disabled={!newFood.hinhAnh}
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
        onOk={handleDeleteFood}
        okButtonProps={{ danger: true }}
        okText="Xóa"
        cancelText="Hủy"
      >
        <p>Bạn có chắc chắn muốn xóa món ăn này không?</p>
        <Text strong>{selectedFood?.TenMon || selectedFood?.tenMon}</Text>
      </Modal>

      <Modal
        title="Chỉnh sửa món ăn"
        open={showEditModal}
        onCancel={() => {
          setShowEditModal(false);
          setSelectedFood(null);
        }}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" form={editForm} onFinish={handleEditFood}>
          <Form.Item
            label="Tên món"
            name="tenMon"
            rules={[{ required: true, message: "Vui lòng nhập tên món" }]}
          >
            <Input placeholder="Nhập tên món" />
          </Form.Item>

          <Form.Item
            label="Giá (VNĐ)"
            name="gia"
            rules={[
              { required: true, message: "Vui lòng nhập giá" },
              { type: "number", min: 0, message: "Giá phải lớn hơn 0" },
            ]}
          >
            <InputNumber
              placeholder="Nhập giá"
              style={{ width: "100%" }}
              min={0}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            />
          </Form.Item>

          <Form.Item
            label="Loại món"
            name="maLoai"
            rules={[{ required: true, message: "Vui lòng chọn loại món" }]}
          >
            <Select placeholder="Chọn loại món">
              {categories.map((category) => (
                <Select.Option
                  key={category.MaLoai || category.maLoai}
                  value={category.MaLoai || category.maLoai}
                >
                  {category.TenLoai || category.tenLoai}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Hình ảnh hiện tại">
            <div className="current-image">
              <img
                src={`${FILE_BASE_URL}/images/${
                  selectedFood?.HinhAnh || selectedFood?.hinhAnh
                }`}
                alt={selectedFood?.TenMon || selectedFood?.tenMon}
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

export default Foods;
