import { Typography } from "antd";
import { useEffect, useState } from "react";
import {
  BookOutlined,
  CheckSquareOutlined,
  FileTextOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import StatCard from "../Common/StatCard";

const { Text, Title } = Typography;

function StudentDashboardOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState([
    { title: "Enrolled Classes", value: "—", icon: <BookOutlined />, color: "#10B981" },
    { title: "Attendance Rate", value: "—", icon: <CheckSquareOutlined />, color: "#F59E0B" },
    { title: "Upcoming Exams", value: "—", icon: <FileTextOutlined />, color: "#3B82F6" },
    { title: "Average Grade", value: "—", icon: <TrophyOutlined />, color: "#8B5CF6" },
    { title: "Study Hours", value: "—", icon: <ClockCircleOutlined />, color: "#EC4899" },
  ]);

  return (
    <div className="dashboard-content">
      <div className="welcome-section">
        <Title level={2} style={{ margin: 0 }}>
          Welcome back, {user?.first_name}! 👋
        </Title>
        <Text type="secondary">
          Here's your academic progress and upcoming activities.
        </Text>
      </div>

      <div className="stats-row">
        {stats.map((stat, i) => (
          <StatCard key={i} stat={stat} />
        ))}
      </div>

      <div className="placeholder-card">
        <Text type="secondary" style={{ fontSize: 15 }}>
          🚧 Full student dashboard with grades, assignments, and class schedules will appear
          here as each module is built.
        </Text>
      </div>
    </div>
  );
}

export default StudentDashboardOverview;
