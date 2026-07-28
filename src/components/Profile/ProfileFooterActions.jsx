import { Button } from "antd";
import { EditOutlined, LockOutlined } from "@ant-design/icons";

const ProfileFooterActions = () => {
  return (
    <div className="profile-footer">
      <Button type="primary" icon={<EditOutlined />} block>
        Edit Profile
      </Button>
      <Button icon={<LockOutlined />} block>
        Change Password
      </Button>
    </div>
  );
};

export default ProfileFooterActions;
