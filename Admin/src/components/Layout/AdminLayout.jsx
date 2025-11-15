import React from "react";
import Sidebar from "../Sidebar/Sidebar";
import Header from "../Header/Header";

const AdminLayout = ({ children }) => {
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-main">
        <Header />
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;

