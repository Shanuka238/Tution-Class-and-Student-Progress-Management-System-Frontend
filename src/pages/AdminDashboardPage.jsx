import React, { useState } from "react";
import DashboardPage from "./DashboardPage";
import AdminDashboardOverview from "../components/AdminDashboard/DashboardOverview";
import UserTable from "../components/UserManagement/UserTable"; 
import ComingSoon from "../components/Common/ComingSoon";
import { NAV_CONFIG } from "../enums/navConfig";
import "../styles/Dashboard.css";

function AdminDashboardPage() {
  const [activeKey, setActiveKey] = useState("overview");

  const renderContent = () => {
    switch (activeKey) {
      case "overview":
        return <AdminDashboardOverview />;
      
      case "users":
        return <UserTable />;
        
      case "classes":
      case "attendance":
      case "exams":
      case "analytics":
      case "payments":
        return <ComingSoon label={activeKey.toUpperCase()} />;
        
      default:
        return <AdminDashboardOverview />;
    }
  };

  return (
    <DashboardPage
      navItems={NAV_CONFIG.admin}
      activeKey={activeKey}
      onNavChange={(key) => setActiveKey(key)}
    >
      {renderContent()}
    </DashboardPage>
  );
}

export default AdminDashboardPage;