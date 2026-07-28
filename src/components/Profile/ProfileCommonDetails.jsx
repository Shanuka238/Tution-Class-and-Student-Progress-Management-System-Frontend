import { Tag, Typography } from "antd";
import { MailOutlined, PhoneOutlined, SafetyOutlined } from "@ant-design/icons";

const { Text } = Typography;

const ProfileCommonDetails = ({ user }) => {
  return (
    <>
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
    </>
  );
};

export default ProfileCommonDetails;
