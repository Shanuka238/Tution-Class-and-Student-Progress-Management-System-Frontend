import { useState } from "react";
import DashboardPage from "./DashboardPage";
import TeacherDashboardOverview from "../components/TeacherDashboard/DashboardOverview";
import ComingSoon from "../components/Common/ComingSoon";
import { NAV_CONFIG } from "../enums/navConfig";
import "../styles/Dashboard.css";

function TeacherDashboardPage() {
  const [activeKey, setActiveKey] = useState("overview");

  const renderContent = () => {
    switch (activeKey) {
      case "overview":
        return <TeacherDashboardOverview />;
      
      case "classes":
        return <ComingSoon label="Class & Timetable" />;
      case "attendance":
        return <ComingSoon label="Attendance Management" />;
      case "exams":
        return <ComingSoon label="Exams & Results" />;
      case "analytics":
        return <ComingSoon label="Performance Analytics" />;
        
      default:
        return <TeacherDashboardOverview />;
    }
  };

  return (
    <DashboardPage
      navItems={NAV_CONFIG.teacher}
      activeKey={activeKey}
      onNavChange={(key) => setActiveKey(key)}
    >
      {renderContent()}
    </DashboardPage>
  );
}

export default TeacherDashboardPage;
