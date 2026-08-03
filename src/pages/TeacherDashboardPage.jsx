import { useState } from "react";
import DashboardPage from "./DashboardPage";
import TeacherDashboardOverview from "../components/TeacherDashboard/DashboardOverview";
import TeacherAnalyticsView from "../components/TeacherDashboard/TeacherAnalyticsView";
import ClassSection from "../components/ClassManagement/ClassSection";
import AttendanceManager from "../components/AttendanceManagement/AttendanceManager";
import ExamManagement from "../components/ExamManagement/ExamManagement";
import { NAV_CONFIG } from "../enums/navConfig";
import "../styles/Dashboard.css";

function TeacherDashboardPage() {
  const [activeKey, setActiveKey] = useState("overview");

  const renderContent = () => {
    switch (activeKey) {
      case "overview":
        return <TeacherDashboardOverview />;
      
      case "classes":
        return <ClassSection />;
      case "attendance":
        return <AttendanceManager />;
      case "exams":
        return <ExamManagement />;
      case "analytics":
        return <TeacherAnalyticsView />;
        
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
