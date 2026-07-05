import { Typography } from "antd";
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
import { classAPI } from "../../services/classApi";
import StatCard from "../Common/StatCard";

const { Text, Title } = Typography;

// Returns Monday and Sunday dates of the current week
function getCurrentWeekRange() {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, ...
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { monday, sunday };
}

function AdminDashboardOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState([
    { title: "Total Users", value: "—", icon: <TeamOutlined />, color: "#4F46E5" },
    { title: "Active Classes This Week", value: "—", icon: <BookOutlined />, color: "#10B981" },
    { title: "Today's Attendance", value: "—", icon: <CheckSquareOutlined />, color: "#F59E0B" },
    { title: "Fee Collected", value: "—", icon: <DollarOutlined />, color: "#3B82F6" },
    { title: "Exams This Month", value: "—", icon: <FileTextOutlined />, color: "#8B5CF6" },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total users
        const userResponse = await adminAPI.getAllUsers();
        const users = userResponse.data || userResponse;
        const userCount = Array.isArray(users) ? users.length : 0;

        // Fetch active classes and filter for current week
        let weekClassCount = 0;
        try {
          const classResponse = await classAPI.getActiveClasses();
          const classes = classResponse.data || classResponse;
          if (Array.isArray(classes)) {
            const { monday, sunday } = getCurrentWeekRange();
            weekClassCount = classes.filter((cls) => {
              if (!cls.schedule_date) return false;
              const classDate = new Date(cls.schedule_date);
              return classDate >= monday && classDate <= sunday;
            }).length;
          }
        } catch (classError) {
          console.error("Failed to fetch class count:", classError);
        }

        setStats((prevStats) =>
          prevStats.map((stat) => {
            if (stat.title === "Total Users") return { ...stat, value: userCount.toString() };
            if (stat.title === "Active Classes This Week") return { ...stat, value: weekClassCount.toString() };
            return stat;
          })
        );
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
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
