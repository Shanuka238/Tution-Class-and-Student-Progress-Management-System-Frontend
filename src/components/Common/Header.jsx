import { Layout, Button, Avatar, Dropdown, Typography, theme } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  UserOutlined,
  BellOutlined,
  SunOutlined,
  MoonOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { formatRoleDisplay } from "../../utils/roleHelper";
import ProfileModal from "../Profile/ProfileModal";
import NotificationDropdown from "../Notifications/NotificationDropdown";

const { Header: AntHeader } = Layout;
const { Text, Title } = Typography;

function Header({ collapsed, onCollapseToggle, activeNav, navItems }) {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { token: themeToken } = theme.useToken();
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleProfileClick = () => {
    setProfileModalVisible(true);
  };

  const dropdownItems = {
    items: [
      { key: "profile", icon: <UserOutlined />, label: "Profile", onClick: handleProfileClick },
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
    <>
      <AntHeader
        style={{
          background: themeToken.colorBgContainer,
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid " + themeToken.colorBorderSecondary,
          height: 64,
          lineHeight: "64px",
        }}
      >
        {/* Left: collapse toggle + title */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={onCollapseToggle}
            style={{ fontSize: 18, width: 40, height: 40 }}
          />
          <Title 
            level={4} 
            style={{ 
              margin: 0, 
              whiteSpace: "nowrap", 
              overflow: "hidden", 
              textOverflow: "ellipsis",
              fontSize: "clamp(15px, 4vw, 18px)"
            }}
          >
            {currentLabel}
          </Title>
        </div>

        {/* Right: notifications + theme toggle + user */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <NotificationDropdown />

          <Button
            type="text"
            icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
            onClick={toggleTheme}
            style={{
              fontSize: 18,
              width: 38,
              height: 38,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          />

          <div
            style={{
              width: "1px",
              height: "24px",
              background: themeToken.colorBorderSecondary,
              margin: "0 4px",
            }}
          />

          <Dropdown menu={dropdownItems} placement="bottomRight" trigger={["click"]}>
            <div className="user-trigger" style={{ padding: "4px 10px", gap: 10 }}>
              <Avatar
                src={user?.profile_image || undefined}
                icon={!user?.profile_image ? <UserOutlined /> : undefined}
                style={{ 
                  backgroundColor: "#4F46E5", 
                  verticalAlign: "middle" 
                }}
                size={34}
              />
              <div className="user-trigger-info" style={{ gap: 2 }}>
                <Text strong style={{ fontSize: 13, lineHeight: 1.2 }}>
                  {user?.first_name} {user?.last_name}
                </Text>
                <Text type="secondary" style={{ fontSize: 11, lineHeight: 1.1 }}>
                  {formatRoleDisplay(user?.role)}
                </Text>
              </div>
            </div>
          </Dropdown>
        </div>
      </AntHeader>

      <ProfileModal 
        visible={profileModalVisible} 
        onCancel={() => setProfileModalVisible(false)} 
      />
    </>
  );
}

export default Header;
