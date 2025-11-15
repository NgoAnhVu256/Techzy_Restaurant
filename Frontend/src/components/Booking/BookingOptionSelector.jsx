import React from 'react';

const BookingOptionSelector = ({ onSelect }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-8 text-gray-800">Chọn hình thức đặt bàn</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        <button
          onClick={() => onSelect('table-only')}
          className="flex flex-col items-center p-6 bg-white border-2 border-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span className="text-xl font-semibold text-gray-800">Đặt bàn</span>
          <p className="text-gray-600 mt-2 text-center">Chỉ đặt bàn không kèm món ăn</p>
        </button>

        <button
          onClick={() => onSelect('table-with-food')}
          className="flex flex-col items-center p-6 bg-white border-2 border-green-500 rounded-lg hover:bg-green-50 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="text-xl font-semibold text-gray-800">Đặt bàn kèm món ăn</span>
          <p className="text-gray-600 mt-2 text-center">Đặt bàn và chọn món ăn trước</p>
        </button>
      </div>
    </div>
  );
};

export default BookingOptionSelector; 
