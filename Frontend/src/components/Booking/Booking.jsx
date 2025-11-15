import React, { useState, useEffect } from 'react';
import BookingOptionSelector from './BookingOptionSelector';
import BookingForm from './BookingForm';
import Menu from './Menu';
import Cart from './Cart';
import api from '@/utils/axios'; // Import api instance

const Booking = () => {
  const [step, setStep] = useState('select-option'); // select-option, select-food, booking-form
  const [bookingType, setBookingType] = useState(null); // table-only, table-with-food
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [loading, setLoading] = useState(false); // Add loading state
  const [error, setError] = useState(null); // Add error state

  const handleOptionSelect = (type) => {
    setBookingType(type);
    if (type === 'table-only') {
      setStep('booking-form');
    } else {
      setStep('select-food');
    }
  };

  const handleAddToCart = (food, quantity) => {
    if (quantity === 0) {
      setSelectedFoods(prev => prev.filter(item => item.MaMon !== food.MaMon));
      return;
    }

    setSelectedFoods(prev => {
      const existingItem = prev.find(item => item.MaMon === food.MaMon);
      if (existingItem) {
        return prev.map(item =>
          item.MaMon === food.MaMon ? { ...item, quantity } : item
        );
      }
      // Add the food item with quantity
      return [...prev, { ...food, quantity }];
    });
  };

  const handleRemoveFromCart = (food) => {
    setSelectedFoods(prev => prev.filter(item => item.MaMon !== food.MaMon));
  };

  const handleProceedToBooking = () => {
    setStep('booking-form');
  };

  const handleBack = () => {
    setError(null); // Clear errors on back navigation
    if (step === 'select-food') {
      setStep('select-option');
      setSelectedFoods([]); // Clear selected foods when going back from menu
    } else if (step === 'booking-form') {
      if (bookingType === 'table-only') {
        setStep('select-option');
      } else {
        setStep('select-food');
      }
    }
  };

  const sendBookingRequest = async (bookingData) => {
    setLoading(true);
    setError(null);
    try {
      // Step 1: Find or Create Customer
      const customerPayload = {
        hoTen: bookingData.customerName,
        soDienThoai: bookingData.customerPhone,
        email: bookingData.customerEmail || '', // Ensure email is not null if optional
        diaChi: bookingData.customerAddress || '', // Ensure address is not null if optional
      };

      const customerResponse = await api.post('/KhachHang/FindOrCreate', customerPayload);
      const maKH = customerResponse.data.maKH;

      if (!maKH) {
        throw new Error('Không lấy được mã khách hàng từ backend.');
      }

      // Construct DateTime objects from date and time strings and format as ISO 8601 UTC
      const startDateTime = new Date(`${bookingData.date}T${bookingData.time}:00Z`); // Append 'Z' for UTC
      // Assuming booking duration is 1 hour. Adjust if needed.
      const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

      // Format both as ISO 8601 strings with timezone (UTC)
      const startTimeISO = startDateTime.toISOString();
      const endTimeISO = endDateTime.toISOString();

      // Step 2: Create Booking using the obtained MaKH
      const bookingPayload = {
        maBan: parseInt(bookingData.tableId), // Ensure tableId is an integer
        maKH: maKH, // Use the obtained MaKH
        thoiGianBatDau: startTimeISO,
        thoiGianKetThuc: endTimeISO,
        soNguoi: parseInt(bookingData.guests), // Ensure guests is an integer
        ghiChu: bookingData.notes || '', // Optional notes field
        monAn: bookingData.selectedFoods.map(food => ({
          maMon: food.MaMon,
          soLuong: food.quantity,
          ghiChu: food.notes || '' // Optional notes per food item
        })),
      };

      const bookingResponse = await api.post('/DatBan', bookingPayload);
      console.log('Booking successful:', bookingResponse.data);

      // Reset the form and show success message
      setStep('select-option');
      setBookingType(null);
      setSelectedFoods([]);
      alert('Đặt bàn thành công!');

    } catch (err) {
      console.error('Booking failed:', err);
      let errorMessage = 'Đặt bàn thất bại. Vui lòng thử lại.';

      if (err.response) {
        if (err.response.status === 405) {
          errorMessage = 'Lỗi 405: Phương thức yêu cầu không được phép cho endpoint này. Kiểm tra cấu hình backend.';
        } else if (err.response.data?.message) {
          errorMessage = `Lỗi: ${err.response.data.message}`;
        } else if (err.response.data) {
           errorMessage = `Lỗi: ${err.response.data}`;
        } else {
           errorMessage = `Lỗi ${err.response.status}: ${err.response.statusText}`;
        }
      } else if (err.message) {
        errorMessage = `Lỗi: ${err.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = (bookingData) => {
    // Call the new function to send data to the backend
    sendBookingRequest(bookingData);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Lỗi:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {step === 'select-option' && (
        <BookingOptionSelector onSelect={handleOptionSelect} />
      )}

      {step === 'select-food' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Menu
              onAddToCart={handleAddToCart}
              selectedItems={selectedFoods}
            />
          </div>
          <div className="lg:col-span-1">
            <Cart
              items={selectedFoods}
              onUpdateQuantity={handleAddToCart}
              onRemoveItem={handleRemoveFromCart}
              onProceed={handleProceedToBooking}
            />
            <button
              onClick={handleBack}
              className="mt-4 w-full bg-gray-300 text-gray-800 py-3 px-6 rounded-md hover:bg-gray-400 transition-colors"
            >
              Quay lại
            </button>
          </div>
        </div>
      )}

      {step === 'booking-form' && (
        <>
          <BookingForm
            onSubmit={handleBookingSubmit}
            selectedFoods={selectedFoods}
            loading={loading} // Pass loading state to disable button
          />
          <div className="max-w-2xl mx-auto mt-4">
            <button
              onClick={handleBack}
              className="w-full bg-gray-300 text-gray-800 py-3 px-6 rounded-md hover:bg-gray-400 transition-colors"
            >
              Quay lại
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Booking; 
