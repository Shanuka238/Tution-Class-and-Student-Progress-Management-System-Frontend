import { Typography, message } from "antd";
import { useEffect, useState } from "react";
import {
  TeamOutlined,
  BookOutlined,
  CheckSquareOutlined,
  DollarOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import { adminAPI } from "../../services/adminApi";
import StatCard from "../Common/StatCard";

const { Text, Title } = Typography;

function AdminDashboardOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState([
    { title: "Total Users", value: "—", icon: <TeamOutlined />, color: "#4F46E5" },
    { title: "Active Classes", value: "—", icon: <BookOutlined />, color: "#10B981" },
    { title: "Today's Attendance", value: "—", icon: <CheckSquareOutlined />, color: "#F59E0B" },
    { title: "Fee Collected", value: "—", icon: <DollarOutlined />, color: "#3B82F6" },
    { title: "Exams This Month", value: "—", icon: <FileTextOutlined />, color: "#8B5CF6" },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminAPI.getAllUsers();
        const users = response.data || response;
        const userCount = Array.isArray(users) ? users.length : 0;

        setStats((prevStats) =>
          prevStats.map((stat) =>
            stat.title === "Total Users"
              ? { ...stat, value: userCount.toString() }
              : stat
          )
        );
      } catch (error) {
        console.error("Failed to fetch user count:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="dashboard-content">
      <div className="welcome-section">
        <Title level={2} style={{ margin: 0 }}>
          Welcome back, {user?.first_name}! 👋
        </Title>
        <Text type="secondary">
          Here's what's happening at your tuition center today.
        </Text>
      </div>

      <div className="stats-row">
        {stats.map((stat, i) => (
          <StatCard key={i} stat={stat} />
        ))}
      </div>

      <div className="placeholder-card">
        <Text type="secondary" style={{ fontSize: 15 }}>
          🚧 Full admin analytics, charts, and management tables will appear
          here as each module is built.
        </Text>
      </div>
    </div>
  );
}

export default AdminDashboardOverview;
