import React, { useState, useEffect } from "react";
import "./Foods.css";
import axios from "axios";
import { toast } from "react-toastify";

function Foods() {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [newFood, setNewFood] = useState({
    tenMon: "",
    gia: "",
    loaiMon: "",
    hinhAnh: null,
  });

  // Fetch foods
  const fetchFoods = async () => {
    try {
      const response = await axios.get("http://localhost:5078/api/MonAn");
      setFoods(response.data);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách món ăn");
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:5078/api/LoaiMon");
      setCategories(response.data);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách loại món");
    }
  };

  useEffect(() => {
    fetchFoods();
    fetchCategories();
  }, []);

  // Handle file change
  const handleFileChange = (e) => {
    setNewFood({
      ...newFood,
      hinhAnh: e.target.files[0],
    });
  };

  // Add new food
  const handleAddFood = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("tenMon", newFood.tenMon);
    formData.append("gia", newFood.gia);
    formData.append("maLoai", newFood.loaiMon);
    formData.append("hinhAnh", newFood.hinhAnh);

    try {
      await axios.post("http://localhost:5078/api/MonAn", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Thêm món ăn thành công");
      fetchFoods();
      setShowAddModal(false);
      setNewFood({ tenMon: "", gia: "", loaiMon: "", hinhAnh: null });
    } catch (error) {
      toast.error(
        "Lỗi khi thêm món ăn: " + error.response?.data || error.message
      );
    }
  };

  // Delete food
  const handleDeleteFood = async () => {
    try {
      await axios.delete(
        `http://localhost:5078/api/MonAn/${selectedFood.maMon}`
      );
      toast.success("Xóa món ăn thành công");
      fetchFoods();
      setShowDeleteModal(false);
    } catch (error) {
      toast.error("Lỗi khi xóa món ăn");
    }
  };

  // Edit food
  const handleEditFood = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("tenMon", selectedFood.tenMon);
    formData.append("gia", selectedFood.gia);
    formData.append(
      "maLoai",
      selectedFood.loaiMon?.maLoai || selectedFood.maLoai
    );

    if (selectedFood.hinhAnh instanceof File) {
      formData.append("hinhAnh", selectedFood.hinhAnh);
    }

    try {
      const response = await axios({
        method: "put",
        url: `http://localhost:5078/api/MonAn/${selectedFood.maMon}`,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Cập nhật món ăn thành công");
      fetchFoods();
      setShowEditModal(false);
    } catch (error) {
      toast.error(
        "Lỗi khi cập nhật món ăn: " + error.response?.data || error.message
      );
    }
  };

  return (
    <div className="foods-container">
      <h2>Quản lý món ăn</h2>

      <div className="foods-table-container">
        <table className="foods-table">
          <thead>
            <tr>
              <th>Hình ảnh</th>
              <th>Tên món</th>
              <th>Giá</th>
              <th>Loại món</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {foods.map((food) => (
              <tr key={food.maMon}>
                <td>
                  <img
                    src={`http://localhost:5078/images/${food.hinhAnh}`}
                    alt={food.tenMon}
                    className="food-image"
                  />
                </td>
                <td>{food.tenMon}</td>
                <td>{food.gia.toLocaleString()} VNĐ</td>
                <td>{food.loaiMon?.tenLoai}</td>
                <td>
                  <button
                    className="edit-button"
                    onClick={() => {
                      setSelectedFood(food);
                      setShowEditModal(true);
                    }}
                  >
                    Sửa
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => {
                      setSelectedFood(food);
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
      </div>

      <button className="add-button" onClick={() => setShowAddModal(true)}>
        + Thêm món ăn
      </button>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Thêm món ăn mới</h3>
            <form onSubmit={handleAddFood}>
              <div className="form-group">
                <label>Tên món:</label>
                <input
                  type="text"
                  value={newFood.tenMon}
                  onChange={(e) =>
                    setNewFood({ ...newFood, tenMon: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Giá:</label>
                <input
                  type="number"
                  value={newFood.gia}
                  onChange={(e) =>
                    setNewFood({ ...newFood, gia: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Loại món:</label>
                <select
                  value={newFood.loaiMon}
                  onChange={(e) =>
                    setNewFood({ ...newFood, loaiMon: e.target.value })
                  }
                  required
                >
                  <option value="">Chọn loại món</option>
                  {categories.map((category) => (
                    <option key={category.maLoai} value={category.maLoai}>
                      {category.tenLoai}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Hình ảnh:</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit">Thêm</button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewFood({
                      tenMon: "",
                      gia: "",
                      loaiMon: "",
                      hinhAnh: null,
                    });
                  }}
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
            <h3>Xác nhận xóa</h3>
            <p>Bạn có chắc chắn muốn xóa món ăn này?</p>
            <div className="modal-actions">
              <button onClick={handleDeleteFood}>Xóa</button>
              <button onClick={() => setShowDeleteModal(false)}>Hủy</button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Sửa món ăn</h3>
            <form onSubmit={handleEditFood}>
              <div className="form-group">
                <label>Tên món:</label>
                <input
                  type="text"
                  value={selectedFood.tenMon}
                  onChange={(e) =>
                    setSelectedFood({ ...selectedFood, tenMon: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Giá:</label>
                <input
                  type="number"
                  value={selectedFood.gia}
                  onChange={(e) =>
                    setSelectedFood({ ...selectedFood, gia: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Loại món:</label>
                <select
                  value={selectedFood.loaiMon?.maLoai || selectedFood.maLoai}
                  onChange={(e) =>
                    setSelectedFood({
                      ...selectedFood,
                      maLoai: e.target.value,
                      loaiMon: categories.find(
                        (c) => c.maLoai === parseInt(e.target.value)
                      ),
                    })
                  }
                  required
                >
                  <option value="">Chọn loại món</option>
                  {categories.map((category) => (
                    <option key={category.maLoai} value={category.maLoai}>
                      {category.tenLoai}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Hình ảnh:</label>
                <input
                  type="file"
                  onChange={(e) =>
                    setSelectedFood({
                      ...selectedFood,
                      hinhAnh: e.target.files[0],
                    })
                  }
                  accept="image/*"
                />
              </div>
              <div className="modal-actions">
                <button type="submit">Lưu</button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedFood(null);
                  }}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Foods;
