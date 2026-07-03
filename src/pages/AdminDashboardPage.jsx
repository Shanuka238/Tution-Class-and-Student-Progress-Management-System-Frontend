import React, { useState } from "react";
import DashboardPage from "./DashboardPage";
import AdminDashboardOverview from "../components/AdminDashboard/DashboardOverview";
import UserTable from "../components/UserManagement/UserTable"; 
import ComingSoon from "../components/Common/ComingSoon";
import { NAV_CONFIG } from "../enums/navConfig";
import ClassSection from "../components/ClassManagement/ClassSection";
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
        return <ClassSection />;
      case "attendance":
        return <ComingSoon label="Attendance" />;
      case "exams":
        return <ComingSoon label="Exams & Results" />;
      case "analytics":
        return <ComingSoon label="Performance Analytics" />;
      case "payments":
        return <ComingSoon label="Payment Management" />;
        
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