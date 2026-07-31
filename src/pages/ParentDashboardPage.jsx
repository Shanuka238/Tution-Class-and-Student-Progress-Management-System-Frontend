import { useState } from "react";
import DashboardPage from "./DashboardPage";
import ParentDashboardOverview from "../components/ParentDashboard/DashboardOverview";
import { NAV_CONFIG } from "../enums/navConfig";
import "../styles/Dashboard.css";

function ParentDashboardPage() {
  const [activeKey, setActiveKey] = useState("overview");

  return (
    <DashboardPage
      navItems={NAV_CONFIG.parent}
      activeKey={activeKey}
      onNavChange={(key) => setActiveKey(key)}
    >
      <ParentDashboardOverview activeTab={activeKey} />
    </DashboardPage>
  );
}

export default ParentDashboardPage;
