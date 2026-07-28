import { Typography } from "antd";
import {
  FileTextOutlined,
  BookOutlined,
  CalendarOutlined,
  TeamOutlined,
  UserOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { formatDate } from "../../utils/dateUtils";

const { Text } = Typography;

const ProfileRoleFields = ({ user, profile }) => {
  const role = user?.role?.toLowerCase();
  if (!profile) return null;

  switch (role) {
    case "student":
      return (
        <>
          {profile?.student_number && (
            <div className="profile-detail-row">
              <div className="profile-detail-icon">
                <FileTextOutlined />
              </div>
              <div className="profile-detail-info">
                <Text type="secondary" className="profile-label">Student Number</Text>
                <Text strong className="profile-value">{profile.student_number}</Text>
              </div>
            </div>
          )}

          {profile?.grade && (
            <div className="profile-detail-row">
              <div className="profile-detail-icon">
                <BookOutlined />
              </div>
              <div className="profile-detail-info">
                <Text type="secondary" className="profile-label">Grade</Text>
                <Text strong className="profile-value">{profile.grade}</Text>
              </div>
            </div>
          )}

          {profile?.date_of_birth && (
            <div className="profile-detail-row">
              <div className="profile-detail-icon">
                <CalendarOutlined />
              </div>
              <div className="profile-detail-info">
                <Text type="secondary" className="profile-label">Date of Birth</Text>
                <Text strong className="profile-value">{formatDate(profile.date_of_birth)}</Text>
              </div>
            </div>
          )}

          {profile?.address && (
            <div className="profile-detail-row">
              <div className="profile-detail-icon">
                <TeamOutlined />
              </div>
              <div className="profile-detail-info">
                <Text type="secondary" className="profile-label">Address</Text>
                <Text strong className="profile-value">{profile.address}</Text>
              </div>
            </div>
          )}
        </>
      );

    case "teacher":
      return (
        <>
          {profile?.teacher_number && (
            <div className="profile-detail-row">
              <div className="profile-detail-icon">
                <FileTextOutlined />
              </div>
              <div className="profile-detail-info">
                <Text type="secondary" className="profile-label">Teacher Number</Text>
                <Text strong className="profile-value">{profile.teacher_number}</Text>
              </div>
            </div>
          )}

          {profile?.subjects && (
            <div className="profile-detail-row">
              <div className="profile-detail-icon">
                <BookOutlined />
              </div>
              <div className="profile-detail-info">
                <Text type="secondary" className="profile-label">Subjects</Text>
                <Text strong className="profile-value">{profile.subjects}</Text>
              </div>
            </div>
          )}

          {profile?.qualifications && (
            <div className="profile-detail-row">
              <div className="profile-detail-icon">
                <TeamOutlined />
              </div>
              <div className="profile-detail-info">
                <Text type="secondary" className="profile-label">Qualifications</Text>
                <Text strong className="profile-value">{profile.qualifications}</Text>
              </div>
            </div>
          )}
        </>
      );

    case "parent":
      return (
        <>
          {profile?.relationship && (
            <div className="profile-detail-row">
              <div className="profile-detail-icon">
                <UserOutlined />
              </div>
              <div className="profile-detail-info">
                <Text type="secondary" className="profile-label">Relationship</Text>
                <Text strong className="profile-value">{profile.relationship?.charAt(0).toUpperCase() + profile.relationship?.slice(1)}</Text>
              </div>
            </div>
          )}

          {profile?.occupation && (
            <div className="profile-detail-row">
              <div className="profile-detail-icon">
                <TeamOutlined />
              </div>
              <div className="profile-detail-info">
                <Text type="secondary" className="profile-label">Occupation</Text>
                <Text strong className="profile-value">{profile.occupation}</Text>
              </div>
            </div>
          )}

          {profile?.address && (
            <div className="profile-detail-row">
              <div className="profile-detail-icon">
                <TeamOutlined />
              </div>
              <div className="profile-detail-info">
                <Text type="secondary" className="profile-label">Address</Text>
                <Text strong className="profile-value">{profile.address}</Text>
              </div>
            </div>
          )}

          {profile?.emergency_contact && (
            <div className="profile-detail-row">
              <div className="profile-detail-icon">
                <PhoneOutlined />
              </div>
              <div className="profile-detail-info">
                <Text type="secondary" className="profile-label">Emergency Contact</Text>
                <Text strong className="profile-value">{profile.emergency_contact}</Text>
              </div>
            </div>
          )}
        </>
      );

    default:
      return null;
  }
};

export default ProfileRoleFields;
