import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import Cart from "./pages/Cart/Cart";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import LoginPopup from "./components/LoginPopup/LoginPopup";
import Reservation from "./components/Reservation/Reservation";
import AccountManagement from "./components/AccountManagement/AccountManagement";
import PromotionManagement from "./components/PromotionManagement/PromotionManagement";
import SupplierManagement from "./components/SupplierManagement/SupplierManagement";
import StorageManagement from "./components/StorageManagement/StorageManagement";
import EmployeeManagement from "./components/EmployeeManagement/EmployeeManagement";
import RevenueStatistics from "./components/RevenueStatistics/RevenueStatistics";
import OrderManagement from "./components/OrderManagement/OrderManagement";
import MenuManagement from "./components/MenuManagement/MenuManagement";
import WorkSchedule from "./components/WorkSchedule/WorkSchedule";
import CustomerManagement from "./components/CustomerManagement/CustomerManagement";

function App() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      {showLogin ? <LoginPopup setShowLogin={setShowLogin} /> : <></>}
      <div className="app">
        <Navbar setShowLogin={setShowLogin} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart setShowLogin={setShowLogin} />} />
          <Route path="/order" element={<PlaceOrder />} />
          <Route path="/reservation" element={<Reservation />} />
          <Route path="/admin/accounts" element={<AccountManagement />} />
          <Route path="/admin/promotions" element={<PromotionManagement />} />
          <Route path="/admin/suppliers" element={<SupplierManagement />} />
          <Route path="/admin/storage" element={<StorageManagement />} />
          <Route path="/admin/employees" element={<EmployeeManagement />} />
          <Route path="/admin/revenue" element={<RevenueStatistics />} />
          <Route path="/admin/orders" element={<OrderManagement />} />
          <Route path="/admin/menu" element={<MenuManagement />} />
          <Route path="/admin/schedules" element={<WorkSchedule />} />
          <Route path="/admin/customers" element={<CustomerManagement />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
}

export default App;
