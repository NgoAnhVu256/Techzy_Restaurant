import React, { useState, useEffect } from "react";
import "./Reservations.css";
import axios from "axios";
import { toast } from "react-toastify";

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [newReservation, setNewReservation] = useState({
    tenKhachHang: "",
    soDienThoai: "",
    ngayDat: "",
    gioVao: "",
    soNguoi: "",
    ghiChu: "",
  });
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [showFoodsModal, setShowFoodsModal] = useState(false);

  // Fetch reservations
  const fetchReservations = async () => {
    try {
      const response = await axios.get("http://localhost:5078/api/DatBan");
      setReservations(response.data);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách đặt bàn");
    }
  };

  // Fetch foods for a reservation
  const fetchReservationFoods = async (maDatBan) => {
    try {
      const response = await axios.get(`http://localhost:5078/api/DatBan/${maDatBan}/MonAn`);
      setSelectedFoods(response.data);
      setShowFoodsModal(true);
    } catch (error) {
      toast.error("Lỗi khi tải thông tin món ăn");
      console.error("Error fetching foods:", error);
    }
  };

  // Thêm interval để tự động làm mới danh sách mỗi 30 giây
  useEffect(() => {
    fetchReservations(); // Lấy dữ liệu lần đầu

    const interval = setInterval(() => {
      fetchReservations(); // Tự động làm mới
    }, 30000);

    return () => clearInterval(interval); // Cleanup khi component unmount
  }, []);

  // Add new reservation
  const handleAdd = async () => {
    try {
      await axios.post("http://localhost:5078/api/DatBan", newReservation);
      toast.success("Thêm đặt bàn thành công");
      fetchReservations();
      setShowAddModal(false);
      setNewReservation({
        tenKhachHang: "",
        soDienThoai: "",
        ngayDat: "",
        gioVao: "",
        soNguoi: "",
        ghiChu: "",
      });
    } catch (error) {
      toast.error("Lỗi khi thêm đặt bàn");
    }
  };

  // Edit reservation
  const handleEdit = async () => {
    try {
      await axios.put(
        `http://localhost:5078/api/DatBan/${selectedReservation.maDatBan}`,
        selectedReservation
      );
      toast.success("Cập nhật đặt bàn thành công");
      fetchReservations();
      setShowEditModal(false);
    } catch (error) {
      toast.error("Lỗi khi cập nhật đặt bàn");
    }
  };

  // Delete reservation
  const handleDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:5078/api/DatBan/${selectedReservation.maDatBan}`
      );
      toast.success("Xóa đặt bàn thành công");
      fetchReservations();
      setShowDeleteModal(false);
    } catch (error) {
      toast.error("Lỗi khi xóa đặt bàn");
    }
  };

  // Filter reservations
  const filteredReservations = reservations.filter(
    (reservation) =>
      reservation.khachHang?.hoTen
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      reservation.khachHang?.soDienThoai.includes(searchTerm)
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReservations.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);

  return (
    <div className="reservations-container">
      <div className="reservations-header">
        <h2>Quản lý đặt bàn</h2>
        <div className="reservations-actions">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button className="add-button" onClick={() => setShowAddModal(true)}>
            Thêm đặt bàn
          </button>
        </div>
      </div>

      <table className="reservations-table">
        <thead>
          <tr>
            <th>Mã đặt bàn</th>
            <th>Tên bàn</th>
            <th>Tên khách hàng</th>
            <th>Số điện thoại</th>
            <th>Ngày đặt</th>
            <th>Thời gian bắt đầu</th>
            <th>Thời gian kết thúc</th>
            <th>Số người</th>
            <th>Ghi chú</th>
            <th>Món ăn</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((reservation) => (
            <tr key={reservation.maDatBan}>
              <td>{reservation.maDatBan}</td>
              <td>{reservation.ban?.tenBan}</td>
              <td>{reservation.khachHang?.hoTen}</td>
              <td>{reservation.khachHang?.soDienThoai}</td>
              <td>{new Date(reservation.ngayDat).toLocaleDateString('vi-VN')}</td>
              <td>{new Date(new Date(reservation.thoiGianBatDau).getTime() + 5 * 60 * 60 * 1000).toLocaleTimeString('vi-VN', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false
              })}</td>
              <td>{new Date(new Date(reservation.thoiGianKetThuc).getTime() + 5 * 60 * 60 * 1000).toLocaleTimeString('vi-VN', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false
              })}</td>
              <td>{reservation.soNguoi}</td>
              <td className="note-cell">{reservation.ghiChu}</td>
              <td>
                <button
                  className="view-foods-button"
                  onClick={() => fetchReservationFoods(reservation.maDatBan)}
                >
                  Xem món ăn
                </button>
              </td>
              <td>
                <button
                  className="edit-button"
                  onClick={() => {
                    setSelectedReservation(reservation);
                    setShowEditModal(true);
                  }}
                >
                  Sửa
                </button>
                <button
                  className="delete-button"
                  onClick={() => {
                    setSelectedReservation(reservation);
                    setShowDeleteModal(true);
                  }}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Trước
        </button>
        <span>{currentPage}</span>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Sau
        </button>
      </div>

      {/* Foods Modal */}
      {showFoodsModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Chi tiết món ăn đã đặt</h3>
              <button onClick={() => setShowFoodsModal(false)} className="close-button">
                &times;
              </button>
            </div>
            <div className="foods-list">
              {selectedFoods.length > 0 ? (
                <table className="foods-table">
                  <thead>
                    <tr>
                      <th>Tên món</th>
                      <th>Số lượng</th>
                      <th>Đơn giá</th>
                      <th>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedFoods.map((food) => (
                      <tr key={food.id}>
                        <td>{food.tenMon}</td>
                        <td>{food.soLuong}</td>
                        <td>{food.donGia.toLocaleString()} VNĐ</td>
                        <td>{(food.soLuong * food.donGia).toLocaleString()} VNĐ</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" className="total-label">Tổng tiền:</td>
                      <td className="total-amount">
                        {selectedFoods
                          .reduce((total, food) => total + food.soLuong * food.donGia, 0)
                          .toLocaleString()} VNĐ
                      </td>
                    </tr>
                  </tfoot>
                </table>
              ) : (
                <p>Không có món ăn nào được đặt</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Thêm đặt bàn mới</h3>
            <input
              type="text"
              placeholder="Tên khách hàng"
              value={newReservation.tenKhachHang}
              onChange={(e) =>
                setNewReservation({
                  ...newReservation,
                  tenKhachHang: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="Số điện thoại"
              value={newReservation.soDienThoai}
              onChange={(e) =>
                setNewReservation({
                  ...newReservation,
                  soDienThoai: e.target.value,
                })
              }
            />
            <input
              type="date"
              value={newReservation.ngayDat}
              onChange={(e) =>
                setNewReservation({
                  ...newReservation,
                  ngayDat: e.target.value,
                })
              }
            />
            <input
              type="time"
              value={newReservation.gioVao}
              onChange={(e) =>
                setNewReservation({
                  ...newReservation,
                  gioVao: e.target.value,
                })
              }
            />
            <input
              type="number"
              placeholder="Số người"
              value={newReservation.soNguoi}
              onChange={(e) =>
                setNewReservation({
                  ...newReservation,
                  soNguoi: e.target.value,
                })
              }
            />
            <textarea
              placeholder="Ghi chú"
              value={newReservation.ghiChu}
              onChange={(e) =>
                setNewReservation({
                  ...newReservation,
                  ghiChu: e.target.value,
                })
              }
            />
            <div className="modal-actions">
              <button onClick={handleAdd}>Thêm</button>
              <button onClick={() => setShowAddModal(false)}>Hủy</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Sửa thông tin đặt bàn</h3>
            <input
              type="text"
              placeholder="Tên khách hàng"
              value={selectedReservation.tenKhachHang}
              onChange={(e) =>
                setSelectedReservation({
                  ...selectedReservation,
                  tenKhachHang: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="Số điện thoại"
              value={selectedReservation.soDienThoai}
              onChange={(e) =>
                setSelectedReservation({
                  ...selectedReservation,
                  soDienThoai: e.target.value,
                })
              }
            />
            <input
              type="date"
              value={selectedReservation.ngayDat.split("T")[0]}
              onChange={(e) =>
                setSelectedReservation({
                  ...selectedReservation,
                  ngayDat: e.target.value,
                })
              }
            />
            <input
              type="time"
              value={selectedReservation.gioVao}
              onChange={(e) =>
                setSelectedReservation({
                  ...selectedReservation,
                  gioVao: e.target.value,
                })
              }
            />
            <input
              type="number"
              placeholder="Số người"
              value={selectedReservation.soNguoi}
              onChange={(e) =>
                setSelectedReservation({
                  ...selectedReservation,
                  soNguoi: e.target.value,
                })
              }
            />
            <textarea
              placeholder="Ghi chú"
              value={selectedReservation.ghiChu}
              onChange={(e) =>
                setSelectedReservation({
                  ...selectedReservation,
                  ghiChu: e.target.value,
                })
              }
            />
            <div className="modal-actions">
              <button onClick={handleEdit}>Lưu</button>
              <button onClick={() => setShowEditModal(false)}>Hủy</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Xác nhận xóa</h3>
            <p>Bạn có chắc chắn muốn xóa đặt bàn này?</p>
            <div className="modal-actions">
              <button onClick={handleDelete}>Xóa</button>
              <button onClick={() => setShowDeleteModal(false)}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reservations;
