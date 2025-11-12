import React, { useState, useEffect } from "react";
import "./Categories.css";
import axios from "axios";
import { toast } from "react-toastify";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({
    tenLoai: "",
    hinhAnh: null,
  });

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
    fetchCategories();
  }, []);

  // Handle file change
  const handleFileChange = (e) => {
    setNewCategory({
      ...newCategory,
      hinhAnh: e.target.files[0],
    });
  };

  // Add new category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("tenLoai", newCategory.tenLoai);
    formData.append("hinhAnh", newCategory.hinhAnh);

    try {
      await axios.post("http://localhost:5078/api/LoaiMon", formData);
      toast.success("Thêm loại món thành công");
      fetchCategories();
      setShowAddModal(false);
      setNewCategory({ tenLoai: "", hinhAnh: null });
    } catch (error) {
      toast.error("Lỗi khi thêm loại món");
    }
  };

  // Delete category
  const handleDeleteCategory = async () => {
    try {
      await axios.delete(
        `http://localhost:5078/api/LoaiMon/${selectedCategory.maLoai}`
      );
      toast.success("Xóa loại món thành công");
      fetchCategories();
      setShowDeleteModal(false);
    } catch (error) {
      toast.error("Lỗi khi xóa loại món");
    }
  };

  // Edit category
  const handleEditCategory = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("tenLoai", selectedCategory.tenLoai);
    if (selectedCategory.newHinhAnh) {
      formData.append("hinhAnh", selectedCategory.newHinhAnh);
    }

    try {
      await axios.put(
        `http://localhost:5078/api/LoaiMon/${selectedCategory.maLoai}`,
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
    } catch (error) {
      console.error("Error:", error.response?.data);
      toast.error(
        `Lỗi khi cập nhật loại món: ${error.response?.data || error.message}`
      );
    }
  };

  // Handle edit file change
  const handleEditFileChange = (e) => {
    setSelectedCategory({
      ...selectedCategory,
      newHinhAnh: e.target.files[0],
    });
  };

  return (
    <div className="categories-container">
      <h2>Quản lý loại món</h2>

      <div className="categories-table-container">
        <table className="categories-table">
          <thead>
            <tr>
              <th>Hình ảnh</th>
              <th>Tên loại</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.maLoai}>
                <td>
                  <img
                    src={`http://localhost:5078/images/${category.hinhAnh}`}
                    alt={category.tenLoai}
                    className="category-image"
                  />
                </td>
                <td>{category.tenLoai}</td>
                <td>
                  <button
                    className="edit-button"
                    onClick={() => {
                      setSelectedCategory(category);
                      setShowEditModal(true);
                    }}
                  >
                    Sửa
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => {
                      setSelectedCategory(category);
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
        + Thêm loại món
      </button>

      {/* Giữ nguyên các modal */}
      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Thêm loại món mới</h3>
            <form onSubmit={handleAddCategory}>
              <input
                type="text"
                placeholder="Tên loại món"
                value={newCategory.tenLoai}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, tenLoai: e.target.value })
                }
                required
              />
              <input type="file" onChange={handleFileChange} required />
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Xác nhận xóa</h3>
            <p>Bạn có chắc muốn xóa loại món này?</p>
            <div className="modal-actions">
              <button onClick={handleDeleteCategory}>Xóa</button>
              <button onClick={() => setShowDeleteModal(false)}>Hủy</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Chỉnh sửa loại món</h3>
            <form onSubmit={handleEditCategory}>
              <input
                type="text"
                placeholder="Tên loại món"
                value={selectedCategory.tenLoai}
                onChange={(e) =>
                  setSelectedCategory({
                    ...selectedCategory,
                    tenLoai: e.target.value,
                  })
                }
                required
              />
              <div className="current-image">
                <p>Hình ảnh hiện tại:</p>
                <img
                  src={`http://localhost:5078/images/${selectedCategory.hinhAnh}`}
                  alt={selectedCategory.tenLoai}
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                  }}
                />
              </div>
              <input type="file" onChange={handleEditFileChange} />
              <p className="file-note">
                *Chỉ chọn file nếu muốn thay đổi hình ảnh
              </p>
              <div className="modal-actions">
                <button type="submit">Lưu</button>
                <button type="button" onClick={() => setShowEditModal(false)}>
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

export default Categories;
