import { useNavigate } from "react-router-dom";
import { Layout, Menu, Button, theme } from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  BookOutlined,
  CheckSquareOutlined,
  FileTextOutlined,
  DollarOutlined,
  RobotOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";

const { Sider } = Layout;

const navItems = [
  { key: "dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
  { key: "users", icon: <TeamOutlined />, label: "User Management" },
  { key: "classes", icon: <BookOutlined />, label: "Classes" },
  { key: "attendance", icon: <CheckSquareOutlined />, label: "Attendance" },
  { key: "exams", icon: <FileTextOutlined />, label: "Exams & Results" },
  { key: "payments", icon: <DollarOutlined />, label: "Payments" },
  { key: "chatbot", icon: <RobotOutlined />, label: "AI Assistant" },
];

function AdminSidebar({ collapsed, activeNav, onNavChange }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { token: themeToken } = theme.useToken();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={250}
      style={{
        background: themeToken.colorBgContainer,
        borderRight: "1px solid " + themeToken.colorBorderSecondary,
      }}
    >
      {/* Logo area */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <span>E</span>
        </div>
        {!collapsed && <span className="logo-text">EduTracker</span>}
      </div>

      {/* Navigation */}
      <Menu
        mode="inline"
        selectedKeys={[activeNav]}
        onClick={({ key }) => onNavChange(key)}
        items={navItems.map((item) => ({
          key: item.key,
          icon: item.icon,
          label: item.label,
        }))}
        style={{ borderInlineEnd: "none", marginTop: 8 }}
      />

      {/* Bottom: logout button */}
      <div className="sidebar-footer">
        <Button
          type="text"
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          danger
          block
          style={{ justifyContent: "flex-start", paddingLeft: 24 }}
        >
          {!collapsed && "Logout"}
        </Button>
      </div>
    </Sider>
  );
}

export default AdminSidebar;
