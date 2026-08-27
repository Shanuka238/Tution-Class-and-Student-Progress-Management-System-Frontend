import { useState } from "react";
import { Modal, Form, Input, Button, message } from "antd";
import { MailOutlined, LockOutlined, KeyOutlined } from "@ant-design/icons";
import { authAPI } from "../../services/api";

const ResetPasswordModal = ({ visible, onClose, initialEmail = "" }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    const { email, newPassword, confirmPassword } = values;

    if (newPassword !== confirmPassword) {
      message.error("Passwords do not match. Please check and try again.");
      return;
    }

    try {
      setLoading(true);
      const res = await authAPI.resetPassword({ email, newPassword });
      message.success(res?.message || "Password updated successfully! You can now sign in.");
      form.resetFields();
      onClose();
    } catch (err) {
      message.error(err?.message || "Failed to reset password. Please check your email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <KeyOutlined style={{ color: "#6366f1", fontSize: "18px" }} />
          <span>Reset Account Password</span>
        </div>
      }
      open={visible}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      footer={null}
      destroyOnClose
      centered
      width={440}
    >
      <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "20px" }}>
        Enter your registered account email and set your new password below.
      </p>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ email: initialEmail }}
      >
        <Form.Item
          label="Registered Email Address"
          name="email"
          rules={[
            { required: true, message: "Please enter your registered email" },
            { type: "email", message: "Please enter a valid email address" },
          ]}
        >
          <Input
            prefix={<MailOutlined style={{ color: "#94a3b8" }} />}
            placeholder="e.g. user@example.com"
            size="large"
          />
        </Form.Item>

        <Form.Item
          label="New Password"
          name="newPassword"
          rules={[
            { required: true, message: "Please enter your new password" },
            { min: 6, message: "Password must be at least 6 characters" },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: "#94a3b8" }} />}
            placeholder="Enter new password (min. 6 chars)"
            size="large"
          />
        </Form.Item>

        <Form.Item
          label="Confirm New Password"
          name="confirmPassword"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "Please confirm your new password" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Passwords do not match"));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: "#94a3b8" }} />}
            placeholder="Re-enter new password"
            size="large"
          />
        </Form.Item>

        <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
          <Button
            style={{ flex: 1 }}
            size="large"
            onClick={() => {
              form.resetFields();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={loading}
            style={{
              flex: 2,
              background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
              border: "none",
            }}
          >
            Update Password
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ResetPasswordModal;
