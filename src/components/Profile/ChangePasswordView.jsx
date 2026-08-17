import { useState } from "react";
import { Form, Input, Button, Typography } from "antd";
import { ArrowLeftOutlined, LockOutlined, KeyOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { authAPI } from "../../services/api";
import { toast } from "../../utils/toast.jsx";

const { Title } = Typography;

function ChangePasswordView({ onBack }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await authAPI.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      toast.success("Password Updated", "Your account password has been changed successfully.");
      form.resetFields();
      onBack();
    } catch (error) {
      console.error("Change password error:", error);
      toast.error("Password Change Failed", error.message || "Could not change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-subpage-content">
      {/* Subpage Header with Back navigation */}
      <div className="profile-subpage-header">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          className="profile-back-btn"
        />
        <Title level={5} style={{ margin: 0 }}>
          Change Password
        </Title>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
      >
        <Form.Item
          name="currentPassword"
          label="Current Password"
          rules={[{ required: true, message: "Please enter current password" }]}
          style={{ marginBottom: 14 }}
        >
          <Input.Password
            prefix={<KeyOutlined style={{ color: "#9CA3AF" }} />}
            placeholder="Current password"
          />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="New Password"
          rules={[
            { required: true, message: "Please enter new password" },
            { min: 6, message: "Min. 6 characters required" },
          ]}
          style={{ marginBottom: 14 }}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: "#9CA3AF" }} />}
            placeholder="New password (min. 6 chars)"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Confirm New Password"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "Please confirm new password" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Passwords do not match!"));
              },
            }),
          ]}
          style={{ marginBottom: 20 }}
        >
          <Input.Password
            prefix={<CheckCircleOutlined style={{ color: "#9CA3AF" }} />}
            placeholder="Confirm new password"
          />
        </Form.Item>

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <Button onClick={onBack} disabled={loading} style={{ flex: 1 }}>
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{ flex: 1, background: "#EF4444", borderColor: "#EF4444" }}
          >
            Update
          </Button>
        </div>
      </Form>
    </div>
  );
}

export default ChangePasswordView;
