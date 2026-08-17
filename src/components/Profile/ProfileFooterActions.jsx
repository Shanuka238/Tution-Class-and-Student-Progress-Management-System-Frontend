import { Button } from "antd";
import { EditOutlined, LockOutlined } from "@ant-design/icons";

const ProfileFooterActions = ({ onEdit, onChangePassword }) => {
  return (
    <div className="profile-footer">
      <Button type="primary" icon={<EditOutlined />} onClick={onEdit} block>
        Edit Profile
      </Button>
      <Button icon={<LockOutlined />} onClick={onChangePassword} block>
        Change Password
      </Button>
    </div>
  );
};

export default ProfileFooterActions;
