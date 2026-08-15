import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, DatePicker, message } from "antd";
import { adminAPI } from "../../services/adminApi";
import dayjs from "dayjs";

const { Option } = Select;

const cleanPhoneForInput = (ph) => {
  if (!ph) return "";
  let str = String(ph).trim().replace(/\D/g, "");
  if (str.startsWith("94") && str.length === 11) {
    return str.substring(2);
  }
  if (str.startsWith("0") && str.length === 10) {
    return str.substring(1);
  }
  return str.slice(0, 9);
};

const UserModal = ({ visible, onCancel, onSuccess, editingUser }) => {
  const [form] = Form.useForm();
  const [selectedRole, setSelectedRole] = useState("student");
  const [submitting, setSubmitting] = useState(false);
  const [parentsList, setParentsList] = useState([]);
  const [loadingParents, setLoadingParents] = useState(false);

  useEffect(() => {
    if (visible) {
      const fetchParents = async () => {
        setLoadingParents(true);
        try {
          const res = await adminAPI.getAllUsers();
          const list = res.data || res;
          if (Array.isArray(list)) {
            const parents = list.filter(
              (u) => u.user?.role === "parent" && u.profile
            );
            setParentsList(parents);
          }
        } catch (err) {
          console.error("Error fetching parents for dropdown:", err);
        } finally {
          setLoadingParents(false);
        }
      };

      fetchParents();

      if (editingUser) {
        const baseUser = editingUser.user || {};
        const profile = editingUser.profile || {};

        setSelectedRole(baseUser.role);

        const parentIdValue = profile.parent_id
          ? typeof profile.parent_id === "object"
            ? profile.parent_id._id || profile.parent_id.id
            : profile.parent_id
          : undefined;

        form.setFieldsValue({
          first_name: baseUser.first_name,
          last_name: baseUser.last_name,
          email: baseUser.email,
          phone: cleanPhoneForInput(baseUser.phone),
          role: baseUser.role,
          parent_id: parentIdValue,
          grade: profile.grade,
          address: profile.address,
          subjects: profile.subjects,
          qualifications: profile.qualifications,
          relationship: profile.relationship,
          emergency_contact: cleanPhoneForInput(profile.emergency_contact),
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
      const payload = { ...values };
      if (payload.phone && payload.phone.trim()) {
        const digits = payload.phone.trim().replace(/\D/g, "");
        payload.phone = "+94" + digits;
      }
      if (payload.emergency_contact && payload.emergency_contact.trim()) {
        const digits = payload.emergency_contact.trim().replace(/\D/g, "");
        payload.emergency_contact = "+94" + digits;
      }

      if (editingUser) {
        const id = editingUser.user._id || editingUser.user.user_id;
        const { role, ...updatePayload } = payload;

        await adminAPI.updateUser(id, updatePayload);
        message.success("User account and profile updated successfully");
      } else {
        await adminAPI.createUser(payload);
        message.success("User account initialized successfully");
      }
      onSuccess();
    } catch (error) {
      message.error(error.message || "Failed to process user form");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={editingUser ? "Modify User Account & Profile" : "Register New System User"}
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      destroyOnClose={false}
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

        <Form.Item
          name="phone"
          label="Contact Phone Number"
          rules={[
            {
              validator: (_, value) => {
                if (!value || !value.trim()) return Promise.resolve();
                const digits = value.trim().replace(/\D/g, "");
                if (digits.length === 9) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Please enter exactly 9 digits following +94 (e.g. 771234567)"));
              },
            },
          ]}
        >
          <Input
            addonBefore="+94"
            placeholder="771234567"
            maxLength={9}
            onChange={(e) => {
              const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 9);
              form.setFieldsValue({ phone: digitsOnly });
            }}
          />
        </Form.Item>

        <Form.Item name="role" label="Role Authorization Group">
          <Select onChange={(value) => setSelectedRole(value)} disabled={!!editingUser}>
            <Option value="student">Student Profile Scope</Option>
            <Option value="teacher">Educator/Teacher Profile Scope</Option>
            <Option value="parent">Parent/Guardian Profile Scope</Option>
            <Option value="admin">Systems Administrator Scope</Option>
          </Select>
        </Form.Item>

        {/* Conditional fields based on selected role */}
        {selectedRole === "student" && (
          <>
            <Form.Item
              name="parent_id"
              label="Assigned Parent / Guardian (Optional)"
            >
              <Select
                showSearch
                allowClear
                placeholder="Select or Search Parent (Optional)"
                loading={loadingParents}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                }
                options={parentsList.map((p) => {
                  const pUser = p.user || {};
                  const pProf = p.profile || {};
                  const labelStr = `${pUser.first_name || ""} ${pUser.last_name || ""} (${pUser.email || ""})`;
                  return {
                    value: pProf._id || pProf.parent_id,
                    label: labelStr,
                  };
                })}
              />
            </Form.Item>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Form.Item name="grade" label="Academic Grade Standard" rules={[{ required: true, message: "Please select a grade" }]}>
                <Select placeholder="Select Grade">
                  <Option value="6">Grade 6</Option>
                  <Option value="7">Grade 7</Option>
                  <Option value="8">Grade 8</Option>
                  <Option value="9">Grade 9</Option>
                  <Option value="10">Grade 10</Option>
                  <Option value="11">Grade 11</Option>
                  <Option value="12">Grade 12</Option>
                </Select>
              </Form.Item>
              <Form.Item name="date_of_birth" label="Date of Birth" rules={[{ required: true }]}>
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item name="address" label="Home Postal Address" style={{ gridColumn: "span 2" }}>
                <Input.TextArea rows={2} />
              </Form.Item>
            </div>
          </>
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
            <Form.Item
              name="emergency_contact"
              label="Emergency Secondary Phone Number"
              rules={[
                {
                  validator: (_, value) => {
                    if (!value || !value.trim()) return Promise.resolve();
                    const digits = value.trim().replace(/\D/g, "");
                    if (digits.length === 9) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Please enter exactly 9 digits following +94 (e.g. 771234567)"));
                  },
                },
              ]}
            >
              <Input
                addonBefore="+94"
                placeholder="771234567"
                maxLength={9}
                onChange={(e) => {
                  const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 9);
                  form.setFieldsValue({ emergency_contact: digitsOnly });
                }}
              />
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