import React, { useState, useEffect } from "react";
import "./Employees.css";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Employees = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [newEmployee, setNewEmployee] = useState({
    hoTen: "",
    email: "",
    diaChi: "",
    maBoPhan: "",
    chucVu: "",
    matKhau: "",
  });

  const roles = ["Quản lý", "Nhân viên"];
  const roleMapping = {
    "Quản lý": "Quản lý",
    "Nhân viên": "Nhân viên",
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      const employeeData = {
        HoTen: newEmployee.hoTen.trim(),
        Email: newEmployee.email.trim().toLowerCase(),
        DiaChi: newEmployee.diaChi?.trim() || "",
        MaBoPhan: parseInt(newEmployee.maBoPhan),
        ChucVu: newEmployee.chucVu,
        MatKhau: newEmployee.matKhau || "123456",
      };

      const response = await axios.post(
        "http://localhost:5078/api/NhanVien",
        employeeData
      );

      toast.success("Thêm nhân viên thành công");
      setEmployees([...employees, response.data]);
      handleCloseModal();
    } catch (error) {
      toast.error(error.response?.data || "Lỗi khi thêm nhân viên");
    }
  };

  const handleEdit = (employee) => {
    console.log("Employee to edit:", employee); // Debug log
    setSelectedEmployee({
      maNV: employee.maNV,
      hoTen: employee.hoTen || "",
      email: employee.email || "",
      diaChi: employee.diaChi || "",
      maBoPhan: employee.boPhan?.maBoPhan || "",
      chucVu: employee.chucVu || "",
    });
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedEmployee({});
    setNewEmployee({
      hoTen: "",
      email: "",
      diaChi: "",
      maBoPhan: "",
      chucVu: "",
      matKhau: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Changing ${name} to:`, value); // Debug log

    const updateData = {
      ...((showEditModal ? selectedEmployee : newEmployee) || {}),
      [name]: name === "maBoPhan" ? (value ? parseInt(value) : "") : value,
    };

    if (showEditModal) {
      setSelectedEmployee(updateData);
    } else {
      setNewEmployee(updateData);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get("http://localhost:5078/api/NhanVien");
      setEmployees(response.data);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách nhân viên");
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get("http://localhost:5078/api/BoPhan");
      setDepartments(response.data);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách bộ phận");
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, []);

  const handleEditEmployee = async (e) => {
    e.preventDefault();
    try {
      if (!selectedEmployee.hoTen?.trim()) {
        toast.error("Vui lòng nhập họ tên");
        return;
      }
      if (!selectedEmployee.email?.trim()) {
        toast.error("Vui lòng nhập email");
        return;
      }
      if (!selectedEmployee.maBoPhan) {
        toast.error("Vui lòng chọn bộ phận");
        return;
      }
      if (!selectedEmployee.chucVu) {
        toast.error("Vui lòng chọn chức vụ");
        return;
      }

      console.log("Selected employee before update:", selectedEmployee); // Debug log

      const employeeData = {
        hoTen: selectedEmployee.hoTen.trim(),
        email: selectedEmployee.email.trim().toLowerCase(),
        diaChi: selectedEmployee.diaChi?.trim() || "",
        maBoPhan: parseInt(selectedEmployee.maBoPhan),
        chucVu: selectedEmployee.chucVu,
      };

      console.log("Sending update data:", employeeData); // Debug log

      const response = await axios.put(
        `http://localhost:5078/api/NhanVien/${selectedEmployee.maNV}`,
        employeeData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Update response:", response.data); // Debug log

      const updatedEmployees = employees.map((emp) =>
        emp.maNV === selectedEmployee.maNV ? response.data : emp
      );

      setEmployees(updatedEmployees);
      toast.success("Cập nhật nhân viên thành công");
      handleCloseModal();
    } catch (error) {
      console.error("Update error details:", {
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
      toast.error(
        error.response?.data ||
          "Lỗi khi cập nhật nhân viên. Vui lòng kiểm tra dữ liệu và thử lại."
      );
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) {
      try {
        await axios.delete(`http://localhost:5078/api/NhanVien/${id}`);
        setEmployees(employees.filter((emp) => emp.maNV !== id));
        toast.success("Xóa nhân viên thành công");
      } catch (error) {
        toast.error(error.response?.data || "Lỗi khi xóa nhân viên");
      }
    }
  };

  // Tìm kiếm và phân trang
  const filteredEmployees = employees.filter(
    (employee) =>
      employee.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEmployees.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="employees-container">
      <div className="employees-header">
        <div className="header-left">
          <button
            className="back-button"
            onClick={() => navigate("/human-resources")}
          >
            <i className="fas fa-arrow-left"></i>
            Quay về
          </button>
          <h2>Quản lý nhân viên</h2>
          <span className="total-count">{employees.length} nhân viên</span>
        </div>
        <div className="header-right">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button className="add-button" onClick={() => setShowAddModal(true)}>
            <i className="fas fa-plus"></i> Thêm nhân viên
          </button>
        </div>
      </div>

      <div className="employees-table">
        <table>
          <thead>
            <tr>
              <th>Mã NV</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Địa chỉ</th>
              <th>Bộ phận</th>
              <th>Chức vụ</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((employee) => (
              <tr key={employee.maNV}>
                <td>{employee.maNV}</td>
                <td>{employee.hoTen}</td>
                <td>{employee.email}</td>
                <td>{employee.diaChi}</td>
                <td>{employee.boPhan?.tenBoPhan || "Chưa phân bộ phận"}</td>
                <td>{employee.chucVu}</td>
                <td>
                  <button
                    className="edit-button"
                    onClick={() => handleEdit(employee)}
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => {
                      setSelectedEmployee(employee);
                      setShowDeleteModal(true);
                    }}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => paginate(i + 1)}
            className={currentPage === i + 1 ? "active" : ""}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Thêm nhân viên</h2>
            <form onSubmit={handleAddEmployee}>
              <div className="form-group">
                <label>Họ tên:</label>
                <input
                  type="text"
                  name="hoTen"
                  value={newEmployee.hoTen}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={newEmployee.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Địa chỉ:</label>
                <input
                  type="text"
                  name="diaChi"
                  value={newEmployee.diaChi}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Bộ phận:</label>
                <select
                  name="maBoPhan"
                  value={newEmployee.maBoPhan}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Chọn bộ phận</option>
                  {departments.map((department) => (
                    <option
                      key={department.maBoPhan}
                      value={department.maBoPhan}
                    >
                      {department.tenBoPhan}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Chức vụ:</label>
                <select
                  name="chucVu"
                  value={newEmployee.chucVu}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Chọn chức vụ</option>
                  <option value="QuanLy">Quản lý</option>
                  <option value="NhanVien">Nhân viên</option>
                </select>
              </div>
              <div className="form-group">
                <label>Mật khẩu:</label>
                <input
                  type="password"
                  name="matKhau"
                  value={newEmployee.matKhau}
                  onChange={handleInputChange}
                  placeholder="Để trống để dùng mật khẩu mặc định"
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="submit-button">
                  Thêm
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={handleCloseModal}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Chỉnh sửa nhân viên</h2>
            <form onSubmit={handleEditEmployee}>
              <div className="form-group">
                <label>Họ tên:</label>
                <input
                  type="text"
                  name="hoTen"
                  value={selectedEmployee.hoTen}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={selectedEmployee.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Địa chỉ:</label>
                <input
                  type="text"
                  name="diaChi"
                  value={selectedEmployee.diaChi}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Bộ phận:</label>
                <select
                  name="maBoPhan"
                  value={selectedEmployee.maBoPhan}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Chọn bộ phận</option>
                  {departments.map((department) => (
                    <option
                      key={department.maBoPhan}
                      value={department.maBoPhan}
                    >
                      {department.tenBoPhan}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Chức vụ:</label>
                <select
                  name="chucVu"
                  value={selectedEmployee.chucVu}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Chọn chức vụ</option>
                  <option value="QuanLy">Quản lý</option>
                  <option value="NhanVien">Nhân viên</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="submit" className="submit-button">
                  Lưu
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={handleCloseModal}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Xác nhận xóa</h2>
            <p>Bạn có chắc chắn muốn xóa nhân viên này?</p>
            <div className="modal-actions">
              <button
                className="delete-button"
                onClick={() => handleDeleteEmployee(selectedEmployee.maNV)}
              >
                Xóa
              </button>
              <button className="cancel-button" onClick={handleCloseModal}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
