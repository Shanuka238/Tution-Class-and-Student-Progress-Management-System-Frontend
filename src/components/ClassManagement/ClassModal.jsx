import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, InputNumber, DatePicker, message } from "antd";
import { classAPI } from "../../services/classApi";
import { adminAPI } from "../../services/adminApi";
import dayjs from "dayjs";

const { Option } = Select;

const ClassModal = ({ visible, onCancel, onSuccess, editingClass = null }) => {
  const [form] = Form.useForm();
  const [teachers, setTeachers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      form.resetFields();

      const loadTeachersAndData = async () => {
        try {
          const res = await adminAPI.getAllUsers();
          const userList = res.data || res;
          const filtered = (Array.isArray(userList) ? userList : []).filter((item) => item.user?.role === "teacher");
          setTeachers(filtered);

          if (editingClass) {
            // Determine teacher IDs array
            let teacherIds = [];
            if (editingClass.teachers && Array.isArray(editingClass.teachers) && editingClass.teachers.length > 0) {
              teacherIds = editingClass.teachers.map((t) => String(t._id || t.id || t));
            } else if (editingClass.teacher_id) {
              teacherIds = [String(editingClass.teacher_id._id || editingClass.teacher_id.id || editingClass.teacher_id)];
            }

            form.setFieldsValue({
              class_name: editingClass.class_name || "",
              subject: editingClass.subject || "",
              grade: editingClass.grade ? String(editingClass.grade) : undefined,
              start_date: editingClass.start_date ? dayjs(editingClass.start_date) : null,
              end_date: editingClass.end_date ? dayjs(editingClass.end_date) : null,
              max_students: editingClass.max_students || 30,
              teacher_ids: teacherIds,
            });
          }
        } catch (err) {
          console.error("Error loading educators or class details:", err);
          message.error("Failed to load educator directory.");
        }
      };

      loadTeachersAndData();
    } else {
      form.resetFields();
    }
  }, [visible, editingClass, form]);

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        start_date: values.start_date ? values.start_date.format("YYYY-MM-DD") : null,
        end_date: values.end_date ? values.end_date.format("YYYY-MM-DD") : null,
      };

      if (editingClass) {
        await classAPI.updateClass(editingClass._id || editingClass.id, payload);
        message.success("Tuition class updated successfully!");
      } else {
        await classAPI.createClass(payload);
        message.success("Tuition class scheduled and created successfully!");
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving class:", error);
      message.error(error.message || "Failed to save class details.");
    } finally {
      setSubmitting(false);
    }
  };

  const isEditing = Boolean(editingClass);

  return (
    <Modal
      title={isEditing ? `Edit Class: ${editingClass?.class_name || ""}` : "Create New Class Schedule"}
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      destroyOnClose
      width={550}
      okText={isEditing ? "Save Changes" : "Create Class"}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ max_students: 30 }}
      >
        <Form.Item
          name="class_name"
          label="Class Title"
          rules={[{ required: true, message: "Class title is required" }]}
        >
          <Input placeholder="e.g. Advanced Level Physics 2027" />
        </Form.Item>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <Form.Item
            name="subject"
            label="Subject Domain"
            rules={[{ required: true, message: "Subject is required" }]}
          >
            <Input placeholder="e.g. Physics" />
          </Form.Item>
          <Form.Item
            name="grade"
            label="Target Grade Standard"
            rules={[{ required: true, message: "Please select target grade" }]}
          >
            <Select placeholder="Select Grade">
              {["6", "7", "8", "9", "10", "11", "12", "13"].map((g) => (
                <Option key={g} value={g}>
                  Grade {g}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <Form.Item
            name="start_date"
            label="Start Date"
            rules={[{ required: true, message: "Please select a start date" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
            />
          </Form.Item>
          <Form.Item
            name="end_date"
            label="End Date"
            rules={[{ required: true, message: "Please select an end date" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
              disabledDate={(current) => {
                const startDate = form.getFieldValue("start_date");
                return current && startDate && current < dayjs(startDate).startOf("day");
              }}
            />
          </Form.Item>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <Form.Item
            name="max_students"
            label="Max Seats Limit"
            rules={[{ required: true, message: "Max seats limit is required" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="teacher_ids"
            label="Assigned Educator(s)"
            rules={[{ required: true, message: "Please select at least one educator" }]}
          >
            <Select
              mode="multiple"
              placeholder="Select educators"
              allowClear
              optionFilterProp="label"
              style={{ width: "100%" }}
            >
              {teachers.map((t) => (
                <Option
                  key={t.profile?._id || t.user?._id}
                  value={String(t.profile?._id || t.user?._id)}
                  label={`${t.user?.first_name || ""} ${t.user?.last_name || ""}`.trim()}
                >
                  {t.user?.first_name} {t.user?.last_name} ({t.profile?.subjects || "General"})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default ClassModal;