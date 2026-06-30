import { Typography } from "antd";
import {
  BookOutlined,
  TeamOutlined,
  FileTextOutlined,
  CheckSquareOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import StatCard from "../Common/StatCard";

const { Text, Title } = Typography;

function TeacherDashboardOverview() {
  const { user } = useAuth();

  const stats = [
    { title: "Active Classes", value: "—", icon: <BookOutlined />, color: "#10B981" },
    { title: "Total Students", value: "—", icon: <TeamOutlined />, color: "#3B82F6" },
    { title: "Assignments Given", value: "—", icon: <FileTextOutlined />, color: "#F59E0B" },
    { title: "Attendance Average", value: "—", icon: <CheckSquareOutlined />, color: "#8B5CF6" },
    { title: "Class Performance", value: "—", icon: <BarChartOutlined />, color: "#EC4899" },
  ];

  return (
    <div className="dashboard-content">
      <div className="welcome-section">
        <Title level={2} style={{ margin: 0 }}>
          Welcome back, {user?.first_name}! 👋
        </Title>
        <Text type="secondary">
          Manage your classes, students, and track their progress.
        </Text>
      </div>

      <div className="stats-row">
        {stats.map((stat, i) => (
          <StatCard key={i} stat={stat} />
        ))}
      </div>

      <div className="placeholder-card">
        <Text type="secondary" style={{ fontSize: 15 }}>
          🚧 Full teacher dashboard with class management, student tracking, and assignment grading 
          will appear here as each module is built.
        </Text>
      </div>
    </div>
  );
}

export default TeacherDashboardOverview;
