import React, { useState, useEffect } from "react";
import "./Customers.css";
import axios from "axios";
import { toast } from "react-toastify";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [newCustomer, setNewCustomer] = useState({
    hoTen: "",
    soDienThoai: "",
    email: "",
    diaChi: "",
  });

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedCustomer(null);
    setNewCustomer({
      hoTen: "",
      soDienThoai: "",
      email: "",
      diaChi: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (showEditModal) {
      setSelectedCustomer((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setNewCustomer((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get("http://localhost:5078/api/KhachHang");
      if (response.data) {
        setCustomers(response.data);
      }
    } catch (error) {
      toast.error("Lỗi khi tải danh sách khách hàng");
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5078/api/KhachHang",
        newCustomer
      );
      if (response.status === 201) {
        toast.success("Thêm khách hàng thành công");
        await fetchCustomers();
        handleCloseModal();
      }
    } catch (error) {
      toast.error("Lỗi khi thêm khách hàng");
    }
  };

  const handleEditCustomer = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5078/api/KhachHang/${selectedCustomer.maKhachHang}`,
        selectedCustomer
      );
      toast.success("Cập nhật khách hàng thành công");
      fetchCustomers();
      handleCloseModal();
    } catch (error) {
      toast.error("Lỗi khi cập nhật khách hàng");
    }
  };

  const handleDeleteCustomer = async () => {
    try {
      await axios.delete(
        `http://localhost:5078/api/KhachHang/${selectedCustomer.maKhachHang}`
      );
      toast.success("Xóa khách hàng thành công");
      fetchCustomers();
      handleCloseModal();
    } catch (error) {
      toast.error("Lỗi khi xóa khách hàng");
    }
  };

  // Tìm kiếm và phân trang
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.soDienThoai.includes(searchTerm) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCustomers.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="customers-container">
      <div className="customers-header">
        <div className="header-left">
          <h2>Quản lý khách hàng</h2>
          <span className="total-count">{customers.length} khách hàng</span>
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
            <i className="fas fa-plus"></i> Thêm khách hàng
          </button>
        </div>
      </div>

      <div className="customers-table">
        <table>
          <thead>
            <tr>
              <th>Họ tên</th>
              <th>Số điện thoại</th>
              <th>Email</th>
              <th>Địa chỉ</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((customer) => (
              <tr key={customer.maKhachHang}>
                <td>{customer.hoTen}</td>
                <td>{customer.soDienThoai}</td>
                <td>{customer.email}</td>
                <td className="address-cell">
                  {customer.diaChi ? (
                    <div title={customer.diaChi}>{customer.diaChi}</div>
                  ) : (
                    <span className="no-address">Chưa có địa chỉ</span>
                  )}
                </td>
                <td>
                  <button
                    className="edit-button"
                    onClick={() => handleEdit(customer)}
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => {
                      setSelectedCustomer(customer);
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
            <h2>Thêm khách hàng mới</h2>
            <form onSubmit={handleAddCustomer}>
              <div className="form-group">
                <label>Họ tên:</label>
                <input
                  type="text"
                  name="hoTen"
                  value={newCustomer.hoTen}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Số điện thoại:</label>
                <input
                  type="tel"
                  name="soDienThoai"
                  value={newCustomer.soDienThoai}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={newCustomer.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Địa chỉ:</label>
                <input
                  type="text"
                  name="diaChi"
                  value={newCustomer.diaChi}
                  onChange={handleInputChange}
                  required
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
            <h2>Chỉnh sửa khách hàng</h2>
            <form onSubmit={handleEditCustomer}>
              <div className="form-group">
                <label>Họ tên:</label>
                <input
                  type="text"
                  name="hoTen"
                  value={selectedCustomer.hoTen}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Số điện thoại:</label>
                <input
                  type="tel"
                  name="soDienThoai"
                  value={selectedCustomer.soDienThoai}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={selectedCustomer.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Địa chỉ:</label>
                <input
                  type="text"
                  name="diaChi"
                  value={selectedCustomer.diaChi}
                  onChange={handleInputChange}
                  required
                />
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
            <p>Bạn có chắc chắn muốn xóa khách hàng này?</p>
            <div className="modal-actions">
              <button className="delete-button" onClick={handleDeleteCustomer}>
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

export default Customers;
