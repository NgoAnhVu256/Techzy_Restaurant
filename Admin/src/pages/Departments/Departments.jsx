import React, { useState, useEffect } from "react";
import "./Departments.css";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Departments = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [newDepartment, setNewDepartment] = useState({
    tenBoPhan: "",
    moTa: "",
  });

  // Khởi tạo selectedDepartment khi mở modal chỉnh sửa
  const handleEdit = (department) => {
    setSelectedDepartment({
      ...department,
      moTa: department.moTa || "",
    });
    setShowEditModal(true);
  };

  // Reset form khi đóng modal
  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedDepartment(null);
    setNewDepartment({
      tenBoPhan: "",
      moTa: "",
    });
  };

  // Cập nhật state khi nhập liệu
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (showEditModal) {
      setSelectedDepartment((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setNewDepartment((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const response = await axios.get("http://localhost:5078/api/BoPhan");
      if (response.data) {
        setDepartments(response.data);
      }
    } catch (error) {
      if (error.response) {
        toast.error(`Lỗi server: ${error.response.data}`);
      } else if (error.request) {
        toast.error("Không thể kết nối đến server");
      } else {
        toast.error(`Lỗi: ${error.message}`);
      }
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Add new department
  const handleAddDepartment = async (e) => {
    e.preventDefault();
    try {
      if (!newDepartment.tenBoPhan.trim()) {
        toast.error("Vui lòng nhập tên bộ phận");
        return;
      }

      const response = await axios.post(
        "http://localhost:5078/api/BoPhan",
        newDepartment
      );
      if (response.status === 201) {
        toast.success("Thêm bộ phận thành công");
        await fetchDepartments();
        setShowAddModal(false);
        setNewDepartment({
          tenBoPhan: "",
          moTa: "",
        });
      }
    } catch (error) {
      if (error.response) {
        toast.error(`Lỗi: ${error.response.data}`);
      } else if (error.request) {
        toast.error("Không thể kết nối đến server");
      } else {
        toast.error(`Lỗi: ${error.message}`);
      }
    }
  };

  // Edit department
  const handleEditDepartment = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5078/api/BoPhan/${selectedDepartment.maBoPhan}`,
        {
          maBoPhan: selectedDepartment.maBoPhan,
          tenBoPhan: selectedDepartment.tenBoPhan,
          moTa: selectedDepartment.moTa,
        }
      );
      toast.success("Cập nhật bộ phận thành công");
      fetchDepartments();
      setShowEditModal(false);
    } catch (error) {
      if (error.response) {
        toast.error(`Lỗi: ${error.response.data}`);
      } else if (error.request) {
        toast.error("Không thể kết nối đến server");
      } else {
        toast.error(`Lỗi: ${error.message}`);
      }
    }
  };

  // Delete department
  const handleDeleteDepartment = async () => {
    try {
      await axios.delete(
        `http://localhost:5078/api/BoPhan/${selectedDepartment.maBoPhan}`
      );
      toast.success("Xóa bộ phận thành công");
      fetchDepartments();
      setShowDeleteModal(false);
    } catch (error) {
      toast.error("Lỗi khi xóa bộ phận");
    }
  };

  // Fetch employees for a department
  const handleViewEmployees = async (department) => {
    setSelectedDepartment(department);
    try {
      const response = await axios.get(
        `http://localhost:5078/api/NhanVien/by-department/${department.maBoPhan}`
      );
      setEmployees(response.data || []);
      setShowEmployeeModal(true);
    } catch (error) {
      console.error(error);
      setEmployees([]);
      toast.error("Lỗi khi tải danh sách nhân viên");
    }
  };

  return (
    <div className="departments-container">
      <div className="departments-header">
        <div className="header-left">
          <button
            className="back-button"
            onClick={() => navigate("/human-resources")}
          >
            <i className="fas fa-arrow-left"></i>
            Quay về
          </button>
          <h2>Quản lý bộ phận</h2>
          <span className="total-count">{departments.length} bộ phận</span>
        </div>
        <button className="add-button" onClick={() => setShowAddModal(true)}>
          <i className="fas fa-plus"></i> Thêm bộ phận
        </button>
      </div>

      <div className="departments-grid">
        {departments.map((dept) => (
          <div key={dept.maBoPhan} className="department-card">
            <div className="department-header">
              <h3>{dept.tenBoPhan}</h3>
              <div className="department-actions">
                <button
                  className="view-button"
                  onClick={() => handleViewEmployees(dept)}
                >
                  <i className="fas fa-users"></i>
                </button>
                <button
                  className="edit-button"
                  onClick={() => handleEdit(dept)}
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button
                  className="delete-button"
                  onClick={() => {
                    setSelectedDepartment(dept);
                    setShowDeleteModal(true);
                  }}
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
            <p className="department-desc">{dept.moTa || "Chưa có mô tả"}</p>
            <p className="department-staff-count">
              Số nhân viên: {dept.soLuongNhanVien}
            </p>
          </div>
        ))}
      </div>

      {/* Add Department Modal */}
      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Thêm bộ phận mới</h3>
            <form onSubmit={handleAddDepartment}>
              <div className="form-group">
                <label>Tên bộ phận:</label>
                <input
                  type="text"
                  value={newDepartment.tenBoPhan}
                  onChange={(e) =>
                    setNewDepartment({
                      ...newDepartment,
                      tenBoPhan: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Mô tả:</label>
                <textarea
                  value={newDepartment.moTa}
                  onChange={(e) =>
                    setNewDepartment({ ...newDepartment, moTa: e.target.value })
                  }
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)}>
                  Hủy
                </button>
                <button type="submit">Thêm</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Department Modal */}
      {showEditModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Sửa bộ phận</h3>
            <form onSubmit={handleEditDepartment}>
              <div className="form-group">
                <label>Tên bộ phận:</label>
                <input
                  type="text"
                  value={selectedDepartment.tenBoPhan}
                  onChange={(e) =>
                    setSelectedDepartment({
                      ...selectedDepartment,
                      tenBoPhan: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Mô tả:</label>
                <textarea
                  value={selectedDepartment.moTa}
                  onChange={(e) =>
                    setSelectedDepartment({
                      ...selectedDepartment,
                      moTa: e.target.value,
                    })
                  }
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowEditModal(false)}>
                  Hủy
                </button>
                <button type="submit">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Department Modal */}
      {showDeleteModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Xóa bộ phận</h3>
            <p>
              Bạn có chắc chắn muốn xóa bộ phận "{selectedDepartment.tenBoPhan}
              "?
            </p>
            <div className="modal-actions">
              <button onClick={() => setShowDeleteModal(false)}>Hủy</button>
              <button onClick={handleDeleteDepartment} className="delete">
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Employees Modal */}
      {showEmployeeModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Danh sách nhân viên - {selectedDepartment.tenBoPhan}</h3>
            <div className="employees-table-container">
              <table className="employees-table">
                <thead>
                  <tr>
                    <th>Họ tên</th>
                    <th>Email</th>
                    <th>Địa chỉ</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: "center" }}>
                        Chưa có nhân viên trong bộ phận này
                      </td>
                    </tr>
                  ) : (
                    employees.map((emp) => (
                      <tr key={emp.maNhanVien}>
                        <td>{emp.hoTen}</td>
                        <td>{emp.email}</td>
                        <td>{emp.diaChi}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowEmployeeModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;
