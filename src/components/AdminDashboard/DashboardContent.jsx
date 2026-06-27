import DashboardOverview from "./DashboardOverview";
import ComingSoon from "../Common/ComingSoon";

const navItems = [
  { key: "dashboard", label: "Dashboard" },
  { key: "users", label: "User Management" },
  { key: "classes", label: "Classes" },
  { key: "attendance", label: "Attendance" },
  { key: "exams", label: "Exams & Results" },
  { key: "payments", label: "Payments" },
  { key: "chatbot", label: "AI Assistant" },
];

function DashboardContent({ activeNav }) {
  const renderContent = () => {
    switch (activeNav) {
      case "dashboard":
        return <DashboardOverview />;
      default:
        return (
          <ComingSoon
            label={navItems.find((n) => n.key === activeNav)?.label}
          />
        );
    }
  };

  return renderContent();
}

export default DashboardContent;
