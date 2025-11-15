import React from 'react';

const Cart = ({ items, onUpdateQuantity, onRemoveItem, onProceed }) => {
  const total = items.reduce((sum, item) => sum + ((item.GiaSauGiam || item.Gia) * item.quantity), 0);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-full">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Danh sách món ăn</h2>
      
      {items.length === 0 ? (
        <p className="text-gray-500 text-center py-4">Chưa có món ăn nào được chọn</p>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {items.map((item) => (
              <div key={item.MaMon} className="flex items-center justify-between border-b pb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{item.TenMon}</h3>
                  <p className="text-gray-600">
                    {item.GiaSauGiam ? (
                      <>
                        <span className="line-through text-gray-500">{item.Gia?.toLocaleString('vi-VN')}đ</span>
                        <span className="ml-2 text-blue-600">{item.GiaSauGiam?.toLocaleString('vi-VN')}đ</span>
                      </>
                    ) : (
                      <span>{item.Gia?.toLocaleString('vi-VN')}đ</span>
                    )}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onUpdateQuantity(item, Math.max(0, item.quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200"
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(item, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200"
                  >
                    +
                  </button>
                  <button
                    onClick={() => onRemoveItem(item)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Tổng cộng:</span>
              <span className="text-xl font-bold text-blue-600">
                {total.toLocaleString('vi-VN')}đ
              </span>
            </div>

            <button
              onClick={onProceed}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors"
            >
              Tiếp tục đặt bàn
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart; 
