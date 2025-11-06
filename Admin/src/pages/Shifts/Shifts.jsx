import React, { useState, useEffect } from "react";
import "./Shifts.css";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Shifts = () => {
  const navigate = useNavigate();
  const [shifts, setShifts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newShift, setNewShift] = useState({
    gioBatDau: "",
    gioKetThuc: "",
  });

  // Fetch shifts
  const fetchShifts = async () => {
    try {
      const response = await axios.get("http://localhost:5078/api/CaLamViec");
      setShifts(response.data);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách ca làm việc");
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  // Add new shift
  const handleAddShift = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5078/api/CaLamViec", newShift);
      toast.success("Thêm ca làm việc thành công");
      fetchShifts();
      setShowAddModal(false);
      setNewShift({
        gioBatDau: "",
        gioKetThuc: "",
      });
    } catch (error) {
      toast.error("Lỗi khi thêm ca làm việc");
    }
  };

  return (
    <div className="shifts-container">
      <div className="shifts-header">
        <div className="header-left">
          <button
            className="back-button"
            onClick={() => navigate("/human-resources")}
          >
            <i className="fas fa-arrow-left"></i>
            Quay về
          </button>
          <h2>Quản lý ca làm việc</h2>
          <span className="total-count">{shifts.length} ca làm việc</span>
        </div>
      </div>
      <div className="shifts-table-container">
        <table className="shifts-table">
          <thead>
            <tr>
              <th>Giờ bắt đầu</th>
              <th>Giờ kết thúc</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map((shift) => (
              <tr key={shift.maCa}>
                <td>{shift.gioBatDau}</td>
                <td>{shift.gioKetThuc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="add-button" onClick={() => setShowAddModal(true)}>
        + Thêm ca làm việc
      </button>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Thêm ca làm việc mới</h3>
            <form onSubmit={handleAddShift}>
              <div className="form-group">
                <label>Giờ bắt đầu:</label>
                <input
                  type="time"
                  value={newShift.gioBatDau}
                  onChange={(e) =>
                    setNewShift({ ...newShift, gioBatDau: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Giờ kết thúc:</label>
                <input
                  type="time"
                  value={newShift.gioKetThuc}
                  onChange={(e) =>
                    setNewShift({ ...newShift, gioKetThuc: e.target.value })
                  }
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit">Thêm</button>
                <button type="button" onClick={() => setShowAddModal(false)}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shifts;
