/**
 * Controller xử lý API cho PhongBan (Departments)
 */

const { PhongBan, NhanVien } = require('../models');
const logger = require('../utils/logger');

// Lấy tất cả phòng ban
const getAllDepartments = async (req, res, next) => {
  try {
    const departments = await PhongBan.findAll({
      order: [['TenPhongBan', 'ASC']]
    });
    return res.json({ success: true, message: 'Lấy danh sách phòng ban thành công', data: departments });
  } catch (error) {
    logger.error('Lỗi lấy danh sách phòng ban', { error: error.message });
    next(error);
  }
};

// Lấy phòng ban theo id
const getDepartmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const department = await PhongBan.findByPk(id, {
      include: [{
        model: NhanVien,
        as: 'nhanViens'
      }]
    });
    if (!department) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phòng ban' });
    }
    return res.json({ success: true, message: 'Lấy thông tin phòng ban thành công', data: department });
  } catch (error) {
    logger.error('Lỗi lấy phòng ban theo id', { error: error.message });
    next(error);
  }
};

// Tạo phòng ban
const createDepartment = async (req, res, next) => {
  try {
    const { TenPhongBan } = req.body;
    if (!TenPhongBan) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập TenPhongBan' });
    }

    const exists = await PhongBan.findOne({ where: { TenPhongBan } });
    if (exists) {
      return res.status(409).json({ success: false, message: 'Tên phòng ban đã tồn tại' });
    }

    const created = await PhongBan.create({ TenPhongBan });
    return res.status(201).json({ success: true, message: 'Tạo phòng ban thành công', data: created });
  } catch (error) {
    logger.error('Lỗi tạo phòng ban', { error: error.message });
    next(error);
  }
};

// Cập nhật phòng ban
const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { TenPhongBan } = req.body;
    
    const department = await PhongBan.findByPk(id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phòng ban' });
    }

    if (TenPhongBan) {
      const exists = await PhongBan.findOne({ where: { TenPhongBan } });
      if (exists && exists.MaPhongBan !== parseInt(id)) {
        return res.status(409).json({ success: false, message: 'Tên phòng ban đã tồn tại' });
      }
      department.TenPhongBan = TenPhongBan;
    }

    await department.save();
    return res.json({ success: true, message: 'Cập nhật phòng ban thành công', data: department });
  } catch (error) {
    logger.error('Lỗi cập nhật phòng ban', { error: error.message });
    next(error);
  }
};

// Xóa phòng ban (chặn nếu còn nhân viên)
const deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const department = await PhongBan.findByPk(id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phòng ban' });
    }

    const hasEmployees = await NhanVien.count({ where: { MaPhongBan: id } });
    if (hasEmployees > 0) {
      return res.status(400).json({ success: false, message: 'Không thể xóa vì còn nhân viên trong phòng ban' });
    }

    await department.destroy();
    return res.json({ success: true, message: 'Xóa phòng ban thành công' });
  } catch (error) {
    logger.error('Lỗi xóa phòng ban', { error: error.message });
    next(error);
  }
};

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
};

