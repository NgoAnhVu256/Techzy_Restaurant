import React, { useState, useEffect } from 'react';
import api from '@/utils/axios';
import { FILE_BASE_URL } from '@/config/apiConfig';

const Menu = ({ onAddToCart, selectedItems }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await api.get('/MonAn');
        if (response.data && Array.isArray(response.data)) {
          const formattedItems = response.data.map(item => ({
            MaMon: item.maMon,
            TenMon: item.tenMon,
            Gia: item.gia,
            GiaSauGiam: item.giaSauGiam,
            MaLoai: item.maLoai,
            LoaiMon: item.loaiMon,
            HinhAnh: `${FILE_BASE_URL}/images/${item.hinhAnh}`,
            MaKM: item.maKM,
            PhanTramGiam: item.phanTramGiam
          }));
          setMenuItems(formattedItems);
        } else {
          console.error('Invalid response format:', response.data);
          setError('Dữ liệu món ăn không hợp lệ');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching menu items:', err);
        setError('Không thể tải danh sách món ăn. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Thực đơn</h2>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Thực đơn</h2>
        <div className="text-center text-red-500 py-8">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Thực đơn</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => {
          if (!item) return null;
          
          const selectedItem = selectedItems?.find(i => i.MaMon === item.MaMon);
          const quantity = selectedItem ? selectedItem.quantity : 0;
          const price = item.GiaSauGiam || item.Gia;
          const categoryName = item.LoaiMon?.TenLoai || 'Chưa phân loại';

          return (
            <div key={item.MaMon} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <img
                src={item.HinhAnh || 'https://via.placeholder.com/300x200?text=No+Image'}
                alt={item.TenMon || 'Món ăn'}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                }}
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800">{item.TenMon || 'Chưa có tên'}</h3>
                <p className="text-gray-600 mb-2">{categoryName}</p>
                <div className="flex items-center gap-2 mb-4">
                  {item.GiaSauGiam ? (
                    <>
                      <p className="text-gray-500 line-through">{item.Gia?.toLocaleString('vi-VN')}đ</p>
                      <p className="text-blue-600 font-semibold">{item.GiaSauGiam?.toLocaleString('vi-VN')}đ</p>
                    </>
                  ) : (
                    <p className="text-blue-600 font-semibold">{price?.toLocaleString('vi-VN')}đ</p>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onAddToCart(item, Math.max(0, quantity - 1))}
                      className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{quantity}</span>
                    <button
                      onClick={() => onAddToCart(item, quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => onAddToCart(item, quantity + 1)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Thêm
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Menu; 
