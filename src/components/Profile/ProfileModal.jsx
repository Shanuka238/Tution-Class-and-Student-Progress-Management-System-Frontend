import { Modal, Avatar, Button, Tag, Typography, Spin, message, theme } from "antd";
import { UserOutlined, MailOutlined, PhoneOutlined, SafetyOutlined, EditOutlined, LockOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { authAPI } from "../../services/api";
import "../../styles/ProfileModal.css";

const { Title, Text } = Typography;

function ProfileModal({ visible, onCancel }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token: themeToken } = theme.useToken();

  useEffect(() => {
    if (visible) {
      fetchUserProfile();
    }
  }, [visible]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await authAPI.getMe();
      const userData = response?.user || response;
      setUser(userData);
    } catch (error) {
      message.error("Failed to load profile details");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: "volcano",
      teacher: "purple",
      student: "geekblue",
      parent: "green",
    };
    return colors[role] || "default";
  };

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={360}
      centered
      className="profile-modal"
      styles={{ body: { padding: 0 } }}
    >
      {loading ? (
        <div className="profile-loading">
          <Spin size="large" />
        </div>
      ) : user ? (
        <div className="profile-content">
          {/* Top Section - Avatar & Name */}
          <div className="profile-top">
            <Avatar
              size={72}
              icon={<UserOutlined />}
              style={{ backgroundColor: "#4F46E5" }}
            />
            <Title level={4} style={{ margin: "12px 0 4px" }}>
              {user?.first_name} {user?.last_name}
            </Title>
            <Tag color={getRoleColor(user?.role)}>
              {user?.role?.toUpperCase()}
            </Tag>
          </div>

          {/* Details List */}
          <div className="profile-details">
            <div className="profile-detail-row">
              <div className="profile-detail-icon">
                <MailOutlined />
              </div>
              <div className="profile-detail-info">
                <Text type="secondary" className="profile-label">Email</Text>
                <Text strong className="profile-value">{user?.email || "—"}</Text>
              </div>
            </div>

            <div className="profile-detail-row">
              <div className="profile-detail-icon">
                <PhoneOutlined />
              </div>
              <div className="profile-detail-info">
                <Text type="secondary" className="profile-label">Phone</Text>
                <Text strong className="profile-value">{user?.phone || "—"}</Text>
              </div>
            </div>

            <div className="profile-detail-row">
              <div className="profile-detail-icon">
                <SafetyOutlined />
              </div>
              <div className="profile-detail-info">
                <Text type="secondary" className="profile-label">Status</Text>
                <Tag color={user?.is_active ? "success" : "error"} style={{ margin: 0 }}>
                  {user?.is_active ? "Active" : "Inactive"}
                </Tag>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="profile-footer">
            <Button type="primary" icon={<EditOutlined />} block>
              Edit Profile
            </Button>
            <Button icon={<LockOutlined />} block>
              Change Password
            </Button>
          </div>
        </div>
      ) : (
        <div className="profile-loading">
          <Text type="secondary">Failed to load profile</Text>
        </div>
      )}
    </Modal>
  );
}

export default ProfileModal;
