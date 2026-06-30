import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, DatePicker, message } from "antd";
import { adminAPI } from "../../services/adminApi";
import dayjs from "dayjs";

const { Option } = Select;

const UserModal = ({ visible, onCancel, onSuccess, editingUser }) => {
  const [form] = Form.useForm();
  const [selectedRole, setSelectedRole] = useState("student");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      if (editingUser) {
        const baseUser = editingUser.user || {};
        const profile = editingUser.profile || {};
        
        setSelectedRole(baseUser.role);
        
        form.setFieldsValue({
          first_name: baseUser.first_name,
          last_name: baseUser.last_name,
          email: baseUser.email,
          phone: baseUser.phone,
          role: baseUser.role,
          grade: profile.grade,
          address: profile.address,
          subjects: profile.subjects,
          qualifications: profile.qualifications,
          relationship: profile.relationship,
          emergency_contact: profile.emergency_contact,
          occupation: profile.occupation,
          date_of_birth: profile.date_of_birth ? dayjs(profile.date_of_birth) : null,
        });
      } else {
        form.resetFields();
        setSelectedRole("student");
      }
    }
  }, [visible, editingUser, form]);

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      if (editingUser) {
        const id = editingUser.user._id || editingUser.user.user_id;
        const { role, ...updatePayload } = values; 

        await adminAPI.updateUser(id, updatePayload);
        message.success("User record updated successfully");
      } else {
        await adminAPI.createUser(values);
        message.success("User profile initialized successfully");
      }
      onSuccess();
    } catch (error) {
      message.error(error.message || "Failed to process form changes");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={editingUser ? "Modify User Account Profile" : "Register New System Stakeholder"}
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      destroyOnClose
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ role: "student" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <Form.Item name="first_name" label="First Name" rules={[{ required: true, message: "Field is required" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="last_name" label="Last Name" rules={[{ required: true, message: "Field is required" }]}>
            <Input />
          </Form.Item>
        </div>

        <Form.Item name="email" label="Email Address" rules={[{ required: true, type: "email", message: "Valid email required" }]}>
          <Input disabled={!!editingUser} />
        </Form.Item>

        {!editingUser && (
          <Form.Item name="password" label="Temporary Password" rules={[{ required: true, min: 6, message: "Minimum 6 characters" }]}>
            <Input.Password />
          </Form.Item>
        )}

        <Form.Item name="phone" label="Contact Mobile Number">
          <Input />
        </Form.Item>

        <Form.Item name="role" label="System Authentication Authorization Group">
          <Select onChange={(value) => setSelectedRole(value)} disabled={!!editingUser}>
            <Option value="student">Student Profile Scope</Option>
            <Option value="teacher">Educator/Teacher Profile Scope</Option>
            <Option value="parent">Parent/Guardian Profile Scope</Option>
            <Option value="admin">Systems Administrator Scope</Option>
          </Select>
        </Form.Item>

        {/* Conditional fields based on selected role */}
        {selectedRole === "student" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Form.Item name="grade" label="Academic Grade Standard" rules={[{ required: true }]}>
              <Input placeholder="e.g. Grade 11" />
            </Form.Item>
            <Form.Item name="date_of_birth" label="Date of Birth" rules={[{ required: true }]}>
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="address" label="Home Postal Address" style={{ gridColumn: "span 2" }}>
              <Input.TextArea rows={2} />
            </Form.Item>
          </div>
        )}

        {selectedRole === "teacher" && (
          <>
            <Form.Item name="subjects" label="Teaching Domain Competencies" rules={[{ required: true }]}>
              <Input placeholder="e.g. Pure Mathematics, Physics" />
            </Form.Item>
            <Form.Item name="qualifications" label="Professional Certifications / Academic Degrees">
              <Input placeholder="e.g. B.Sc (Hons) in Mathematics" />
            </Form.Item>
          </>
        )}

        {selectedRole === "parent" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Form.Item name="relationship" label="Relationship to Student" rules={[{ required: true }]}>
              <Select>
                <Option value="father">Father</Option>
                <Option value="mother">Mother</Option>
                <Option value="guardian">Legal Guardian</Option>
              </Select>
            </Form.Item>
            <Form.Item name="emergency_contact" label="Emergency Secondary Phone Number">
              <Input />
            </Form.Item>
            <Form.Item name="occupation" label="Primary Profession">
              <Input />
            </Form.Item>
          </div>
        )}
      </Form>
    </Modal>
  );
};

export default UserModal;