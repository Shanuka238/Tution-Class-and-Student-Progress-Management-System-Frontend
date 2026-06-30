import DashboardPage from "./DashboardPage";
import StudentDashboardOverview from "../components/StudentDashboard/DashboardOverview";
import { NAV_CONFIG } from "../enums/navConfig";
import "../styles/Dashboard.css";

function StudentDashboardPage() {
  return (
    <DashboardPage
      navItems={NAV_CONFIG.student}
      overviewComponent={StudentDashboardOverview}
    />
  );
}

export default StudentDashboardPage;