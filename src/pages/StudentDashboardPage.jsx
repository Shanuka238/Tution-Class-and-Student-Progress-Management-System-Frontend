import { useState } from "react";
import DashboardPage from "./DashboardPage";
import StudentDashboardOverview from "../components/StudentDashboard/DashboardOverview";
import StudentAttendance from "../components/StudentDashboard/StudentAttendance";
import ComingSoon from "../components/Common/ComingSoon";
import WeeklyTimetable from "../components/ClassManagement/WeeklyTimetable";
import StudentResults from "../components/ExamManagement/StudentResults";
import StudentPayments from "../components/PaymentManagement/StudentPayments";
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
        return <StudentAttendance />;
      case "exams":
        return <StudentResults />;
      case "analytics":
        return <ComingSoon label="My Performance" />;
      case "payments":
        return <StudentPayments />;
        
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