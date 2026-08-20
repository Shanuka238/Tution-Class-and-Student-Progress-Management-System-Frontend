import { useState, useEffect } from "react";
import { Form, Input, Button, DatePicker, Select, Space, Divider, Typography } from "antd";
import { ArrowLeftOutlined, UserOutlined, BookOutlined, SolutionOutlined, HomeOutlined } from "@ant-design/icons";
import { authAPI } from "../../services/api";
import { formatPhoneForBackend, cleanPhoneForInput } from "../../utils/phoneHelper";
import { toast } from "../../utils/toast.jsx";
import dayjs from "dayjs";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

function ProfileEditView({ user, profile, onBack, onProfileUpdated }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const role = user?.role?.toLowerCase();

  useEffect(() => {
    if (user) {
      const initialValues = {
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: cleanPhoneForInput(user.phone || ""),
      };

      if (profile) {
        if (role === "student") {
          initialValues.grade = profile.grade || "";
          initialValues.address = profile.address || "";
          initialValues.emergency_contact = cleanPhoneForInput(profile.emergency_contact || "");
          initialValues.date_of_birth = profile.date_of_birth ? dayjs(profile.date_of_birth) : null;
        } else if (role === "teacher") {
          initialValues.subjects = profile.subjects || "";
          initialValues.qualifications = profile.qualifications || "";
          initialValues.address = profile.address || "";
        } else if (role === "parent") {
          initialValues.address = profile.address || "";
          initialValues.occupation = profile.occupation || "";
          initialValues.emergency_contact = cleanPhoneForInput(profile.emergency_contact || "");
          initialValues.relationship = profile.relationship || "Guardian";
        } else if (role === "admin") {
          initialValues.department = profile.department || "";
        }
      }

      form.setFieldsValue(initialValues);
    }
  }, [user, profile, role, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        phone: values.phone ? formatPhoneForBackend(values.phone) : "",
      };

      if (role === "student") {
        payload.grade = values.grade;
        payload.address = values.address;
        payload.emergency_contact = values.emergency_contact ? formatPhoneForBackend(values.emergency_contact) : "";
        payload.date_of_birth = values.date_of_birth ? values.date_of_birth.toISOString() : null;
      } else if (role === "teacher") {
        payload.subjects = values.subjects;
        payload.qualifications = values.qualifications;
        payload.address = values.address;
      } else if (role === "parent") {
        payload.address = values.address;
        payload.occupation = values.occupation;
        payload.emergency_contact = values.emergency_contact ? formatPhoneForBackend(values.emergency_contact) : "";
        payload.relationship = values.relationship;
      } else if (role === "admin") {
        payload.department = values.department;
      }

      const res = await authAPI.updateProfile(payload);
      const updatedUser = res?.data?.user || res?.user;
      const updatedProfile = res?.data?.profile || res?.profile;

      if (updatedUser) {
        localStorage.setItem("edutracker_user", JSON.stringify(updatedUser));
      }

      toast.success("Profile Updated", "Your profile details have been saved successfully.");
      if (onProfileUpdated) {
        onProfileUpdated(updatedUser, updatedProfile);
      }
      onBack();
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Update Failed", error.message || "Failed to update profile details");
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
          Edit Profile
        </Title>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
      >
        <Space direction="horizontal" style={{ width: "100%" }} size="middle">
          <Form.Item
            name="first_name"
            label="First Name"
            rules={[{ required: true, message: "Required" }]}
            style={{ width: "calc(50% - 8px)", marginBottom: 12 }}
          >
            <Input placeholder="First Name" />
          </Form.Item>

          <Form.Item
            name="last_name"
            label="Last Name"
            rules={[{ required: true, message: "Required" }]}
            style={{ width: "calc(50% - 8px)", marginBottom: 12 }}
          >
            <Input placeholder="Last Name" />
          </Form.Item>
        </Space>

        <Form.Item
          name="phone"
          label="Phone Number"
          style={{ marginBottom: 12 }}
          rules={[
            {
              pattern: /^[0-9]{9}$/,
              message: "Enter valid 9-digit phone number",
            },
          ]}
        >
          <Input addonBefore="+94" placeholder="771234567" maxLength={9} />
        </Form.Item>

        {/* Role-Specific Editable Fields */}
        {role === "student" && (
          <>
            <Divider style={{ margin: "10px 0" }}>Student Details</Divider>
            <Form.Item name="grade" label="Grade" style={{ marginBottom: 12 }}>
              <Select placeholder="Select Grade">
                {[6, 7, 8, 9, 10, 11, 12, 13].map((g) => (
                  <Option key={g} value={String(g)}>Grade {g}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="date_of_birth" label="Date of Birth" style={{ marginBottom: 12 }}>
              <DatePicker
                style={{ width: "100%" }}
                format="YYYY-MM-DD"
                disabledDate={(current) => current && current > dayjs().endOf("day")}
              />
            </Form.Item>

            <Form.Item name="emergency_contact" label="Emergency Contact" style={{ marginBottom: 12 }}>
              <Input addonBefore="+94" placeholder="771234567" maxLength={9} />
            </Form.Item>

            <Form.Item name="address" label="Address" style={{ marginBottom: 12 }}>
              <TextArea rows={2} placeholder="Residential address" />
            </Form.Item>
          </>
        )}

        {role === "teacher" && (
          <>
            <Divider style={{ margin: "10px 0" }}>Teacher Details</Divider>
            <Form.Item name="subjects" label="Subjects" style={{ marginBottom: 12 }}>
              <Input placeholder="e.g. Mathematics, Physics" prefix={<BookOutlined />} />
            </Form.Item>

            <Form.Item name="qualifications" label="Qualifications" style={{ marginBottom: 12 }}>
              <Input placeholder="e.g. B.Sc. (Hons)" prefix={<SolutionOutlined />} />
            </Form.Item>

            <Form.Item name="address" label="Address" style={{ marginBottom: 12 }}>
              <TextArea rows={2} placeholder="Residential address" prefix={<HomeOutlined />} />
            </Form.Item>
          </>
        )}

        {role === "parent" && (
          <>
            <Divider style={{ margin: "10px 0" }}>Parent Details</Divider>
            <Form.Item name="relationship" label="Relationship" style={{ marginBottom: 12 }}>
              <Select placeholder="Select relationship">
                <Option value="Father">Father</Option>
                <Option value="Mother">Mother</Option>
                <Option value="Guardian">Guardian</Option>
              </Select>
            </Form.Item>

            <Form.Item name="occupation" label="Occupation" style={{ marginBottom: 12 }}>
              <Input placeholder="Occupation" />
            </Form.Item>

            <Form.Item name="emergency_contact" label="Emergency Contact" style={{ marginBottom: 12 }}>
              <Input addonBefore="+94" placeholder="771234567" maxLength={9} />
            </Form.Item>

            <Form.Item name="address" label="Home Address" style={{ marginBottom: 12 }}>
              <TextArea rows={2} placeholder="Home address" />
            </Form.Item>
          </>
        )}

        {role === "admin" && (
          <>
            <Divider style={{ margin: "10px 0" }}>Administrative Details</Divider>
            <Form.Item name="department" label="Department" style={{ marginBottom: 12 }}>
              <Input placeholder="e.g. Administration" />
            </Form.Item>
          </>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <Button onClick={onBack} disabled={loading} style={{ flex: 1 }}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading} style={{ flex: 1, background: "#4F46E5" }}>
            Save
          </Button>
        </div>
      </Form>
    </div>
  );
}

export default ProfileEditView;
