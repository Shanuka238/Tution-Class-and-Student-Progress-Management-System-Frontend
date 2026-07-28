import { Avatar, Tag, Typography, Upload } from "antd";
import { UserOutlined, CameraOutlined } from "@ant-design/icons";
import { getRoleColor } from "../../utils/roleHelper";

const { Title } = Typography;

const ProfileHeader = ({ user, uploading, handleProfileImageUpload }) => {
  return (
    <div className="profile-top">
      <div style={{ position: "relative", display: "inline-block" }}>
        <Avatar
          size={72}
          src={user?.profile_image || undefined}
          icon={!user?.profile_image ? <UserOutlined /> : undefined}
          style={{ backgroundColor: "#4F46E5" }}
        />
        <Upload
          maxCount={1}
          beforeUpload={handleProfileImageUpload}
          showUploadList={false}
        >
          <button
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              backgroundColor: "#4F46E5",
              border: "none",
              borderRadius: "50%",
              width: "28px",
              height: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: uploading ? "not-allowed" : "pointer",
              opacity: uploading ? 0.6 : 1,
            }}
            disabled={uploading}
          >
            <CameraOutlined style={{ color: "white", fontSize: "14px" }} />
          </button>
        </Upload>
      </div>
      <Title level={4} style={{ margin: "12px 0 4px" }}>
        {user?.first_name} {user?.last_name}
      </Title>
      <Tag color={getRoleColor(user?.role)}>
        {user?.role?.toUpperCase()}
      </Tag>
    </div>
  );
};

export default ProfileHeader;
