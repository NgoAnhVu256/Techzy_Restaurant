import React, { useEffect, useMemo, useState } from "react";
import "./Employees.css";
import api from "../../utils/axios";
import { toast } from "react-toastify";
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Space,
  Typography,
} from "antd";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import dayjs from "dayjs";

const { Text } = Typography;

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const fetchEmployees = async () => {
    try {
      const response = await api.get("/employees");
      setEmployees(response.data.data || []);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách nhân viên");
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get("/departments");
      setDepartments(response.data.data || []);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (showEditModal && selectedEmployee) {
      editForm.setFieldsValue({
        hoTen: selectedEmployee.HoTen || selectedEmployee.hoTen,
        ngaySinh: selectedEmployee.NgaySinh || selectedEmployee.ngaySinh ? dayjs(selectedEmployee.NgaySinh || selectedEmployee.ngaySinh) : null,
        sdt: selectedEmployee.SDT || selectedEmployee.sdt,
        chucVu: selectedEmployee.ChucVu || selectedEmployee.chucVu || "",
        maPhongBan: selectedEmployee.MaPhongBan || selectedEmployee.maPhongBan || null,
      });
    }
  }, [showEditModal, selectedEmployee, editForm]);

  const closeAddModal = () => {
    setShowAddModal(false);
    addForm.resetFields();
  };

  const handleAddEmployee = async (values) => {
    try {
      await api.post("/employees", {
        HoTen: values.hoTen,
        NgaySinh: values.ngaySinh ? values.ngaySinh.format("YYYY-MM-DD") : null,
        SDT: values.sdt,
        ChucVu: values.chucVu || null,
        MaPhongBan: values.maPhongBan || null,
      });
      toast.success("Thêm nhân viên thành công");
      fetchEmployees();
      closeAddModal();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error("Lỗi khi thêm nhân viên: " + errorMessage);
    }
  };

  const handleEditEmployee = async (values) => {
    if (!selectedEmployee) return;
    try {
      await api.put(
        `/employees/${selectedEmployee.MaNhanVien || selectedEmployee.maNhanVien}`,
        {
          HoTen: values.hoTen,
          NgaySinh: values.ngaySinh ? values.ngaySinh.format("YYYY-MM-DD") : null,
          SDT: values.sdt,
          ChucVu: values.chucVu || null,
          MaPhongBan: values.maPhongBan || null,
        }
      );
      toast.success("Cập nhật nhân viên thành công");
      fetchEmployees();
      setShowEditModal(false);
      setSelectedEmployee(null);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error("Lỗi khi cập nhật nhân viên: " + errorMessage);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return;
    try {
      await api.delete(
        `/employees/${selectedEmployee.MaNhanVien || selectedEmployee.maNhanVien}`
      );
      toast.success("Xóa nhân viên thành công");
      fetchEmployees();
      setShowDeleteModal(false);
      setSelectedEmployee(null);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error("Lỗi khi xóa nhân viên: " + errorMessage);
    }
  };

  const columns = useMemo(
    () => [
      {
        title: "Mã NV",
        dataIndex: "MaNhanVien",
        key: "MaNhanVien",
        render: (text, record) => text || record.maNhanVien,
      },
      {
        title: "Họ tên",
        dataIndex: "HoTen",
        key: "HoTen",
        render: (text, record) => (
          <span className="employee-name">{text || record.hoTen}</span>
        ),
        sorter: (a, b) => (a.HoTen || a.hoTen || "").localeCompare(b.HoTen || b.hoTen || ""),
      },
      {
        title: "Ngày sinh",
        dataIndex: "NgaySinh",
        key: "NgaySinh",
        render: (text, record) => {
          const date = text || record.ngaySinh;
          return date ? dayjs(date).format("DD/MM/YYYY") : "-";
        },
      },
      {
        title: "Số điện thoại",
        dataIndex: "SDT",
        key: "SDT",
        render: (text, record) => text || record.sdt,
      },
      {
        title: "Chức vụ",
        dataIndex: "ChucVu",
        key: "ChucVu",
        render: (text, record) => text || record.chucVu || "-",
      },
      {
        title: "Phòng ban",
        key: "phongBan",
        render: (_, record) => {
          const dept = record.phongBan || record.PhongBan;
          return dept ? (dept.TenPhongBan || dept.tenPhongBan) : "-";
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
                setSelectedEmployee(record);
                setShowEditModal(true);
              }}
            >
              Sửa
            </Button>
            <Button
              icon={<FiTrash2 />}
              danger
              onClick={() => {
                setSelectedEmployee(record);
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
    <div className="employees-page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Quản lý Nhân sự / Nhân viên</p>
          <h2>Quản lý Nhân viên</h2>
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
          Thêm Nhân viên
        </Button>
      </div>

      <div className="employees-card">
        <Table
          columns={columns}
          dataSource={employees}
          rowKey={(record) => record.MaNhanVien || record.maNhanVien}
          pagination={{ pageSize: 10 }}
        />
      </div>

      {/* Add Modal */}
      <Modal
        title="Thêm nhân viên mới"
        open={showAddModal}
        onCancel={closeAddModal}
        footer={null}
        destroyOnClose
      >
        <Form
          layout="vertical"
          form={addForm}
          onFinish={handleAddEmployee}
          initialValues={{ hoTen: "", sdt: "", chucVu: "", maPhongBan: null }}
        >
          <Form.Item
            label="Họ tên"
            name="hoTen"
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
          >
            <Input placeholder="Nhập họ tên" />
          </Form.Item>

          <Form.Item
            label="Ngày sinh"
            name="ngaySinh"
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày sinh"
            />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="sdt"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại" },
              { pattern: /^[0-9]{10,11}$/, message: "Số điện thoại không hợp lệ" },
            ]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item label="Chức vụ" name="chucVu">
            <Input placeholder="Nhập chức vụ (tùy chọn)" />
          </Form.Item>

          <Form.Item label="Phòng ban" name="maPhongBan">
            <Select placeholder="Chọn phòng ban (tùy chọn)" allowClear>
              {departments.map((dept) => (
                <Select.Option
                  key={dept.MaPhongBan || dept.maPhongBan}
                  value={dept.MaPhongBan || dept.maPhongBan}
                >
                  {dept.TenPhongBan || dept.tenPhongBan}
                </Select.Option>
              ))}
            </Select>
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
        title="Chỉnh sửa nhân viên"
        open={showEditModal}
        onCancel={() => {
          setShowEditModal(false);
          setSelectedEmployee(null);
        }}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" form={editForm} onFinish={handleEditEmployee}>
          <Form.Item
            label="Họ tên"
            name="hoTen"
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
          >
            <Input placeholder="Nhập họ tên" />
          </Form.Item>

          <Form.Item
            label="Ngày sinh"
            name="ngaySinh"
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày sinh"
            />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="sdt"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại" },
              { pattern: /^[0-9]{10,11}$/, message: "Số điện thoại không hợp lệ" },
            ]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item label="Chức vụ" name="chucVu">
            <Input placeholder="Nhập chức vụ (tùy chọn)" />
          </Form.Item>

          <Form.Item label="Phòng ban" name="maPhongBan">
            <Select placeholder="Chọn phòng ban (tùy chọn)" allowClear>
              {departments.map((dept) => (
                <Select.Option
                  key={dept.MaPhongBan || dept.maPhongBan}
                  value={dept.MaPhongBan || dept.maPhongBan}
                >
                  {dept.TenPhongBan || dept.tenPhongBan}
                </Select.Option>
              ))}
            </Select>
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
        onOk={handleDeleteEmployee}
        okButtonProps={{ danger: true }}
        okText="Xóa"
        cancelText="Hủy"
      >
        <p>Bạn có chắc chắn muốn xóa nhân viên này không?</p>
        <Text strong>
          {selectedEmployee?.HoTen || selectedEmployee?.hoTen}
        </Text>
      </Modal>
    </div>
  );
};

export default Employees;
