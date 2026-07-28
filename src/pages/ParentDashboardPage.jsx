import { useState } from "react";
import DashboardPage from "./DashboardPage";
import ParentDashboardOverview from "../components/ParentDashboard/DashboardOverview";
import ChildProgressView from "../components/ParentDashboard/ChildProgressView";
import StudentAttendance from "../components/StudentDashboard/StudentAttendance";
import StudentResults from "../components/ExamManagement/StudentResults";
import StudentPayments from "../components/PaymentManagement/StudentPayments";
import { NAV_CONFIG } from "../enums/navConfig";
import "../styles/Dashboard.css";

function ParentDashboardPage() {
  const [activeKey, setActiveKey] = useState("overview");

  const renderContent = () => {
    switch (activeKey) {
      case "overview":
        return <ParentDashboardOverview />;
      case "progress":
      case "analytics":
        return <ChildProgressView />;
      case "attendance":
        return <StudentAttendance />;
      case "exams":
        return <StudentResults />;
      case "payments":
        return <StudentPayments />;
      default:
        return <ParentDashboardOverview />;
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
