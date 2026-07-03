import { useState } from "react";
import DashboardPage from "./DashboardPage";
import StudentDashboardOverview from "../components/StudentDashboard/DashboardOverview";
import ComingSoon from "../components/Common/ComingSoon";
import WeeklyTimetable from "../components/ClassManagement/WeeklyTimetable";
import { NAV_CONFIG } from "../enums/navConfig";
import "../styles/Dashboard.css";

function StudentDashboardPage() {
  const [activeKey, setActiveKey] = useState("overview");

  const renderContent = () => {
    switch (activeKey) {
      case "overview":
        return <StudentDashboardOverview />;
      
      case "classes":
        return <WeeklyTimetable />;
      case "attendance":
        return <ComingSoon label="View Attendance" />;
      case "exams":
        return <ComingSoon label="View Exams & Results" />;
      case "analytics":
        return <ComingSoon label="My Performance" />;
      case "payments":
        return <ComingSoon label="Payments" />;
        
      default:
        return <StudentDashboardOverview />;
    }
  };

  return (
    <DashboardPage
      navItems={NAV_CONFIG.student}
      activeKey={activeKey}
      onNavChange={(key) => setActiveKey(key)}
    >
      {renderContent()}
    </DashboardPage>
  );
}

export default StudentDashboardPage;