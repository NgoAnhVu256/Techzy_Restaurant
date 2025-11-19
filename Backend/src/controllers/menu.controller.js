/**
 * Controller xử lý API cho Menu (MonAn)
 * CRUD món ăn
 */

const { MonAn, LoaiMon } = require('../models');
const logger = require('../utils/logger');

/**
 * Lấy tất cả món ăn
 */
const getAllMenu = async (req, res, next) => {
  try {
    const menuItems = await MonAn.findAll({
      include: [{
        model: LoaiMon,
        as: 'loaiMon',
        attributes: ['MaLoai', 'TenLoai']
      }],
      order: [['TenMon', 'ASC']]
    });

    // Tính giá sau giảm (nếu có khuyến mãi)
    const menuWithDiscount = menuItems.map(item => {
      const itemData = item.toJSON();
      // TODO: Tính giá sau giảm nếu có khuyến mãi
      itemData.GiaSauGiam = itemData.Gia;
      return itemData;
    });

    return res.json({
      success: true,
      message: 'Lấy danh sách món ăn thành công',
      data: menuWithDiscount
    });
  } catch (error) {
    logger.error('Lỗi lấy danh sách món ăn', { error: error.message });
    next(error);
  }
};

/**
 * Lấy món ăn theo ID
 */
const getMenuById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const menuItem = await MonAn.findByPk(id, {
      include: [{
        model: LoaiMon,
        as: 'loaiMon'
      }]
    });

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy món ăn'
      });
    }

    return res.json({
      success: true,
      message: 'Lấy thông tin món ăn thành công',
      data: menuItem
    });
  } catch (error) {
    logger.error('Lỗi lấy món ăn', { error: error.message });
    next(error);
  }
};

/**
 * Lấy danh sách loại món
 */
const getLoaiMon = async (req, res, next) => {
  try {
    const loaiMons = await LoaiMon.findAll({
      include: [{
        model: MonAn,
        as: 'monAns',
        attributes: ['HinhAnh'],
        limit: 1
      }]
    });

    const result = loaiMons.map(loai => {
      const loaiData = loai.toJSON();
      loaiData.hinhAnh = loaiData.monAns?.[0]?.HinhAnh || '';
      delete loaiData.monAns;
      return loaiData;
    });

    return res.json({
      success: true,
      message: 'Lấy danh sách loại món thành công',
      data: result
    });
  } catch (error) {
    logger.error('Lỗi lấy loại món', { error: error.message });
    next(error);
  }
};

/**
 * Đếm số lượng món ăn
 */
const getMenuCount = async (req, res, next) => {
  try {
    const count = await MonAn.count();

    return res.json({
      success: true,
      message: 'Lấy số lượng món ăn thành công',
      data: { count }
    });
  } catch (error) {
    logger.error('Lỗi đếm món ăn', { error: error.message });
    next(error);
  }
};

/**
 * Tạo món ăn mới
 */
const createMenu = async (req, res, next) => {
  try {
    const { TenMon, Gia, MaLoai } = req.body;

    // Validation
    if (!TenMon || !Gia || !MaLoai) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin'
      });
    }

    // Kiểm tra loại món tồn tại
    const loaiMon = await LoaiMon.findByPk(MaLoai);
    if (!loaiMon) {
      return res.status(400).json({
        success: false,
        message: 'Loại món không tồn tại'
      });
    }

    // Xử lý upload hình ảnh
    let hinhAnh = '';
    if (req.file) {
      // Lưu URL đầy đủ từ S3 (req.file.location)
      hinhAnh = req.file.location;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn hình ảnh'
      });
    }

    // Tạo món ăn mới
    const newMenu = await MonAn.create({
      TenMon,
      Gia: parseFloat(Gia),
      MaLoai: parseInt(MaLoai),
      HinhAnh: hinhAnh
    });

    // Lấy món ăn với thông tin đầy đủ
    const menuItem = await MonAn.findByPk(newMenu.MaMon, {
      include: [{
        model: LoaiMon,
        as: 'loaiMon'
      }]
    });

    logger.info('Tạo món ăn thành công', { maMon: menuItem.MaMon, tenMon: menuItem.TenMon });

    return res.status(201).json({
      success: true,
      message: 'Tạo món ăn thành công',
      data: menuItem
    });
  } catch (error) {
    logger.error('Lỗi tạo món ăn', { error: error.message });
    next(error);
  }
};

/**
 * Cập nhật món ăn
 */
const updateMenu = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { TenMon, Gia, MaLoai } = req.body;

    const menuItem = await MonAn.findByPk(id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy món ăn'
      });
    }

    // Kiểm tra loại món nếu có thay đổi
    if (MaLoai) {
      const loaiMon = await LoaiMon.findByPk(MaLoai);
      if (!loaiMon) {
        return res.status(400).json({
          success: false,
          message: 'Loại món không tồn tại'
        });
      }
      menuItem.MaLoai = parseInt(MaLoai);
    }

    // Cập nhật thông tin
    if (TenMon) menuItem.TenMon = TenMon;
    if (Gia) menuItem.Gia = parseFloat(Gia);

    // Xử lý upload hình ảnh mới
    if (req.file) {
      // Lưu URL đầy đủ từ S3 (req.file.location)
      // Lưu ý: Với S3, không cần xóa file cũ vì S3 tự quản lý
      menuItem.HinhAnh = req.file.location;
    }

    await menuItem.save();

    // Lấy món ăn với thông tin đầy đủ
    const updatedMenu = await MonAn.findByPk(id, {
      include: [{
        model: LoaiMon,
        as: 'loaiMon'
      }]
    });

    return res.json({
      success: true,
      message: 'Cập nhật món ăn thành công',
      data: updatedMenu
    });
  } catch (error) {
    logger.error('Lỗi cập nhật món ăn', { error: error.message });
    next(error);
  }
};

/**
 * Xóa món ăn
 */
const deleteMenu = async (req, res, next) => {
  try {
    const { id } = req.params;

    const menuItem = await MonAn.findByPk(id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy món ăn'
      });
    }

    // Lưu ý: Với S3, không cần xóa file khi xóa record
    // Có thể implement xóa file từ S3 nếu cần (sử dụng AWS SDK)

    await menuItem.destroy();

    return res.json({
      success: true,
      message: 'Xóa món ăn thành công'
    });
  } catch (error) {
    logger.error('Lỗi xóa món ăn', { error: error.message });
    next(error);
  }
};

module.exports = {
  getAllMenu,
  getMenuById,
  getLoaiMon,
  getMenuCount,
  createMenu,
  updateMenu,
  deleteMenu
};

