import { Modal, Typography, Spin, message } from "antd";
import { useEffect, useState } from "react";
import { authAPI } from "../../services/api";
import "../../styles/ProfileModal.css";

import ProfileHeader from "./ProfileHeader";
import ProfileCommonDetails from "./ProfileCommonDetails";
import ProfileRoleFields from "./ProfileRoleFields";
import ProfileFooterActions from "./ProfileFooterActions";
import ProfileEditView from "./ProfileEditView";
import ChangePasswordView from "./ChangePasswordView";

const { Text } = Typography;

function ProfileModal({ visible, onCancel }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeView, setActiveView] = useState("view"); // "view" | "edit" | "password"

  useEffect(() => {
    if (visible) {
      setActiveView("view");
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
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Please upload an image file");
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("Image must be smaller than 5MB");
      return false;
    }

    setUploading(true);
    try {
      const response = await authAPI.uploadProfileImage(file);
      const updatedUser = response?.data?.user || response?.user;

      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem("edutracker_user", JSON.stringify(updatedUser));
        message.success("Profile image uploaded successfully");
      }
    } catch (error) {
      message.error(error.message || "Failed to upload profile image");
      console.error(error);
    } finally {
      setUploading(false);
    }

    return false;
  };

  const handleProfileUpdated = (updatedUser, updatedProfile) => {
    if (updatedUser) setUser(updatedUser);
    if (updatedProfile) setProfile(updatedProfile);
    fetchUserProfile();
  };

  const handleClose = () => {
    setActiveView("view");
    onCancel();
  };

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={activeView === "edit" ? 420 : 360}
      centered
      className="profile-modal"
      styles={{ body: { padding: 0 } }}
      destroyOnClose
    >
      {loading ? (
        <div className="profile-loading">
          <Spin size="large" />
        </div>
      ) : user ? (
        <>
          {/* Main Profile View */}
          {activeView === "view" && (
            <div className="profile-content">
              {/* Top Section - Avatar & Name */}
              <ProfileHeader
                user={user}
                uploading={uploading}
                handleProfileImageUpload={handleProfileImageUpload}
              />

              {/* Details List */}
              <div className="profile-details">
                <ProfileCommonDetails user={user} />
                <ProfileRoleFields user={user} profile={profile} />
              </div>

              {/* Actions */}
              <ProfileFooterActions
                onEdit={() => setActiveView("edit")}
                onChangePassword={() => setActiveView("password")}
              />
            </div>
          )}

          {/* In-place Sub-Page: Edit Profile */}
          {activeView === "edit" && (
            <ProfileEditView
              user={user}
              profile={profile}
              onBack={() => setActiveView("view")}
              onProfileUpdated={handleProfileUpdated}
            />
          )}

          {/* In-place Sub-Page: Change Password */}
          {activeView === "password" && (
            <ChangePasswordView
              onBack={() => setActiveView("view")}
            />
          )}
        </>
      ) : (
        <div className="profile-loading">
          <Text type="secondary">Failed to load profile</Text>
        </div>
      )}
    </Modal>
  );
}

export default ProfileModal;
