import { useState } from "react";
import DashboardPage from "./DashboardPage";
import ParentDashboardOverview from "../components/ParentDashboard/DashboardOverview";
import { NAV_CONFIG } from "../enums/navConfig";
import "../styles/Dashboard.css";

function ParentDashboardPage() {
  const [activeKey, setActiveKey] = useState("overview");

  const renderContent = () => {
    switch (activeKey) {
      case "overview":
        return <ParentDashboardOverview activeTab="overview" />;
      case "progress":
        return <ParentDashboardOverview activeTab="progress" />;
      case "attendance":
        return <ParentDashboardOverview activeTab="attendance" />;
      case "exams":
        return <ParentDashboardOverview activeTab="exams" />;
      case "analytics":
        return <ParentDashboardOverview activeTab="analytics" />;
      case "payments":
        return <ParentDashboardOverview activeTab="payments" />;
      default:
        return <ParentDashboardOverview activeTab="overview" />;
    }
  };

  return (
    <DashboardPage
      navItems={NAV_CONFIG.parent}
      activeKey={activeKey}
      onNavChange={(key) => setActiveKey(key)}
    >
      {renderContent()}
    </DashboardPage>
  );
}

export default ParentDashboardPage;
