/**
 * Controller xử lý API cho NhanVien (Employees)
 */

const { NhanVien, PhongBan, TaiKhoan } = require('../models');
const logger = require('../utils/logger');

// Lấy tất cả nhân viên
const getAllEmployees = async (req, res, next) => {
  try {
    const employees = await NhanVien.findAll({
      include: [
        {
          model: PhongBan,
          as: 'phongBan'
        },
        {
          model: TaiKhoan,
          as: 'taiKhoan',
          required: false
        }
      ],
      order: [['HoTen', 'ASC']]
    });
    return res.json({ success: true, message: 'Lấy danh sách nhân viên thành công', data: employees });
  } catch (error) {
    logger.error('Lỗi lấy danh sách nhân viên', { error: error.message });
    next(error);
  }
};

// Lấy nhân viên theo id
const getEmployeeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const employee = await NhanVien.findByPk(id, {
      include: [
        {
          model: PhongBan,
          as: 'phongBan'
        },
        {
          model: TaiKhoan,
          as: 'taiKhoan',
          required: false
        }
      ]
    });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên' });
    }
    return res.json({ success: true, message: 'Lấy thông tin nhân viên thành công', data: employee });
  } catch (error) {
    logger.error('Lỗi lấy nhân viên theo id', { error: error.message });
    next(error);
  }
};

// Tạo nhân viên
const createEmployee = async (req, res, next) => {
  try {
    const { HoTen, NgaySinh, SDT, ChucVu, MaPhongBan } = req.body;
    if (!HoTen || !SDT) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập HoTen và SDT' });
    }

    // Kiểm tra SDT trùng
    const exists = await NhanVien.findOne({ where: { SDT } });
    if (exists) {
      return res.status(409).json({ success: false, message: 'Số điện thoại đã tồn tại' });
    }

    // Kiểm tra phòng ban tồn tại nếu có
    if (MaPhongBan) {
      const department = await PhongBan.findByPk(MaPhongBan);
      if (!department) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy phòng ban' });
      }
    }

    const created = await NhanVien.create({
      HoTen,
      NgaySinh: NgaySinh || null,
      SDT,
      ChucVu: ChucVu || null,
      MaPhongBan: MaPhongBan || null
    });
    return res.status(201).json({ success: true, message: 'Tạo nhân viên thành công', data: created });
  } catch (error) {
    logger.error('Lỗi tạo nhân viên', { error: error.message });
    next(error);
  }
};

// Cập nhật nhân viên
const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { HoTen, NgaySinh, SDT, ChucVu, MaPhongBan } = req.body;
    
    const employee = await NhanVien.findByPk(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên' });
    }

    if (HoTen) employee.HoTen = HoTen;
    if (NgaySinh !== undefined) employee.NgaySinh = NgaySinh || null;
    if (SDT !== undefined && SDT !== employee.SDT) {
      const exists = await NhanVien.findOne({ where: { SDT } });
      if (exists) {
        return res.status(409).json({ success: false, message: 'Số điện thoại đã tồn tại' });
      }
      employee.SDT = SDT;
    }
    if (ChucVu !== undefined) employee.ChucVu = ChucVu || null;
    if (MaPhongBan !== undefined) {
      if (MaPhongBan) {
        const department = await PhongBan.findByPk(MaPhongBan);
        if (!department) {
          return res.status(404).json({ success: false, message: 'Không tìm thấy phòng ban' });
        }
      }
      employee.MaPhongBan = MaPhongBan || null;
    }

    await employee.save();
    return res.json({ success: true, message: 'Cập nhật nhân viên thành công', data: employee });
  } catch (error) {
    logger.error('Lỗi cập nhật nhân viên', { error: error.message });
    next(error);
  }
};

// Xóa nhân viên (chặn nếu có tài khoản)
const deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const employee = await NhanVien.findByPk(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên' });
    }

    const hasAccount = await TaiKhoan.count({ where: { MaNhanVien: id } });
    if (hasAccount > 0) {
      return res.status(400).json({ success: false, message: 'Không thể xóa vì nhân viên đã có tài khoản' });
    }

    await employee.destroy();
    return res.json({ success: true, message: 'Xóa nhân viên thành công' });
  } catch (error) {
    logger.error('Lỗi xóa nhân viên', { error: error.message });
    next(error);
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
};

