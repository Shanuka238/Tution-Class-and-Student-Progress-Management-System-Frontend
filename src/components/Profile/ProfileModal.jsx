import { Modal, Avatar, Button, Tag, Typography, Spin, message, Upload } from "antd";
import { UserOutlined, MailOutlined, PhoneOutlined, SafetyOutlined, EditOutlined, LockOutlined, FileTextOutlined, BookOutlined, TeamOutlined, CalendarOutlined, CameraOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { authAPI } from "../../services/api";
import "../../styles/ProfileModal.css";

const { Title, Text } = Typography;

function ProfileModal({ visible, onCancel }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchUserProfile();
    }
  }, [visible]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await authAPI.getMe();
      const userData = response?.user || response?.data?.user;
      const profileData = response?.profile || response?.data?.profile;
      setUser(userData);
      setProfile(profileData);
    } catch (error) {
      message.error("Failed to load profile details");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileImageUpload = async (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Please upload an image file');
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Image must be smaller than 5MB');
      return false;
    }

    setUploading(true);
    try {
      const response = await authAPI.uploadProfileImage(file);
      const updatedUser = response?.data?.user || response?.user;
      
      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem("edutracker_user", JSON.stringify(updatedUser));
        message.success('Profile image uploaded successfully');
      }
    } catch (error) {
      message.error(error.message || 'Failed to upload profile image');
      console.error(error);
    } finally {
      setUploading(false);
    }

    return false; 
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

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderRoleSpecificFields = () => {
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
            <div style={{ position: 'relative', display: 'inline-block' }}>
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
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: '#4F46E5',
                    border: 'none',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    opacity: uploading ? 0.6 : 1,
                  }}
                  disabled={uploading}
                >
                  <CameraOutlined style={{ color: 'white', fontSize: '14px' }} />
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

          {/* Details List */}
          <div className="profile-details">
            {/* Common Fields */}
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

            {/* Role-Specific Fields */}
            {renderRoleSpecificFields()}
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
