import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Components
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Sidebar/Sidebar";
import Login from "./components/Login/Login";

// Pages
import Dashboard from "./pages/Dashboard/Dashboard";
import Foods from "./pages/Foods/Foods";
import Categories from "./pages/Categories/Categories";
import Order from "./pages/Order/Order";
import Departments from "./pages/Departments/Departments";
import Shifts from "./pages/Shifts/Shifts";
import Storage from "./pages/Storage/Storage";
import Employees from "./pages/Employees/Employees";
import Tables from "./pages/Tables/Tables";
import Reservations from "./pages/Reservations/Reservations";
import Customers from "./pages/Customers/Customers";
import Suppliers from "./pages/Suppliers/Suppliers";
import Promotions from "./pages/Promotions/Promotions";
import HumanResources from "./pages/HumanResources/HumanResources";
import WorkSchedule from "./pages/WorkSchedule/WorkSchedule";

const App = () => {
  const [showLogin, setShowLogin] = useState(true);
  return (
    <div>
      <ToastContainer />
      {showLogin ? <Login setShowLogin={setShowLogin} /> : <></>}
      <Navbar />
      <hr />
      <div className="app-content">
        <Sidebar />
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/foods" element={<Foods />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/order" element={<Order />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/shifts" element={<Shifts />} />
          <Route path="/storage" element={<Storage />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/tables" element={<Tables />} />
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/promotions" element={<Promotions />} />
          <Route path="/workschedule" element={<WorkSchedule />} />
          <Route path="/human-resources" element={<HumanResources />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
