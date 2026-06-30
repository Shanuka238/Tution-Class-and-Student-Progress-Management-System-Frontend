import { Typography } from "antd";
import {
  UserOutlined,
  BookOutlined,
  HistoryOutlined,
  TrophyOutlined,
  BankOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import StatCard from "../Common/StatCard";

const { Text, Title } = Typography;

function ParentDashboardOverview() {
  const { user } = useAuth();

  const stats = [
    { title: "Children Enrolled", value: "—", icon: <UserOutlined />, color: "#4F46E5" },
    { title: "Active Classes", value: "—", icon: <BookOutlined />, color: "#10B981" },
    { title: "Attendance Rate", value: "—", icon: <HistoryOutlined />, color: "#F59E0B" },
    { title: "Average Performance", value: "—", icon: <TrophyOutlined />, color: "#3B82F6" },
    { title: "Outstanding Fees", value: "—", icon: <BankOutlined />, color: "#EC4899" },
  ];

  return (
    <div className="dashboard-content">
      <div className="welcome-section">
        <Title level={2} style={{ margin: 0 }}>
          Welcome, {user?.first_name}! 👋
        </Title>
        <Text type="secondary">
          Monitor your child's progress, attendance, and academic performance.
        </Text>
      </div>

      <div className="stats-row">
        {stats.map((stat, i) => (
          <StatCard key={i} stat={stat} />
        ))}
      </div>

      <div className="placeholder-card">
        <Text type="secondary" style={{ fontSize: 15 }}>
          🚧 Full parent dashboard with child progress tracking, fee management, and performance 
          analytics will appear here as each module is built.
        </Text>
      </div>
    </div>
  );
}

export default ParentDashboardOverview;
