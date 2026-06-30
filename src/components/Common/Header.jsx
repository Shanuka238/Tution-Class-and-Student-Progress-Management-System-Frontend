import { Layout, Button, Avatar, Dropdown, Typography, theme } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  UserOutlined,
  SettingOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { formatRoleDisplay } from "../../utils/roleHelper";

const { Header: AntHeader } = Layout;
const { Text, Title } = Typography;

function Header({ collapsed, onCollapseToggle, activeNav, navItems }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { token: themeToken } = theme.useToken();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const dropdownItems = {
    items: [
      { key: "profile", icon: <UserOutlined />, label: "Profile" },
      { key: "settings", icon: <SettingOutlined />, label: "Settings" },
      { type: "divider" },
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: "Logout",
        danger: true,
        onClick: handleLogout,
      },
    ],
  };

  const currentLabel = navItems.find((n) => n.key === activeNav)?.label || "Dashboard";

  return (
    <AntHeader
      style={{
        background: themeToken.colorBgContainer,
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid " + themeToken.colorBorderSecondary,
      }}
    >
      {/* Left: collapse toggle + title */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onCollapseToggle}
          style={{ fontSize: 16, width: 40, height: 40 }}
        />
        <Title level={4} style={{ margin: 0 }}>
          {currentLabel}
        </Title>
      </div>

      {/* Right: notifications + user */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Button type="text" icon={<BellOutlined />} style={{ fontSize: 18 }} />

        <Dropdown menu={dropdownItems} placement="bottomRight" trigger={["click"]}>
          <div className="user-trigger">
            <Avatar
              style={{ backgroundColor: "#4F46E5", verticalAlign: "middle" }}
              size="small"
              icon={<UserOutlined />}
            />
            <div className="user-trigger-info">
              <Text strong style={{ fontSize: 13 }}>
                {user?.first_name} {user?.last_name}
              </Text>
              <Text type="secondary" style={{ fontSize: 11 }}>
                {formatRoleDisplay(user?.role)}
              </Text>
            </div>
          </div>
        </Dropdown>
      </div>
    </AntHeader>
  );
}

export default Header;
