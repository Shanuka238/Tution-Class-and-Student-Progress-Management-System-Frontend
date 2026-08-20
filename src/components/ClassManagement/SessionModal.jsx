import React, { useEffect, useState } from "react";
import { Modal, Form, DatePicker, TimePicker, Select, Input, message } from "antd";
import { classAPI } from "../../services/classApi";
import { adminAPI } from "../../services/adminApi";
import dayjs from "dayjs";

const { Option } = Select;

const SessionModal = ({ visible, onCancel, onSuccess, courseId, courseName }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    if (visible) {
      form.resetFields();
      const loadTeachers = async () => {
        try {
          const res = await adminAPI.getAllUsers();
          const userList = res.data || res;
          const filtered = userList.filter(item => item.user?.role === "teacher");
          setTeachers(filtered);
        } catch (err) {
          console.error("Error fetching teachers:", err);
          message.error("Failed to fetch available teachers");
        }
      };
      loadTeachers();
    }
  }, [visible, form]);

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      const dateStr = values.date.format("YYYY-MM-DD");
      const startTime = values.start_time.format("HH:mm");
      const endTime = values.end_time.format("HH:mm");
      const teacherId = values.teacher_id;
      const venue = values.venue;
      await classAPI.createSession(courseId, dateStr, startTime, endTime, teacherId, venue);
      message.success("Session scheduled successfully!");
      form.resetFields();
      onSuccess();
    } catch (error) {
      console.error("Error creating session:", error);
      message.error(error.message || "Failed to schedule session");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={`Schedule Session for ${courseName}`}
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      destroyOnClose
      width={450}
    >
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ date: dayjs() }}>
        <Form.Item name="teacher_id" label="Assigned Educator" rules={[{ required: true }]}>
          <Select placeholder="Select teacher for this session">
            {teachers.map(t => (
              <Option key={t.profile?._id} value={t.profile?._id || t.user?._id}>
                {t.user?.first_name} {t.user?.last_name} ({t.profile?.subjects || "General"})
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="date"
          label="Session Date"
          rules={[{ required: true, message: "Please select a session date" }]}
        >
          <DatePicker
            style={{ width: "100%" }}
            disabledDate={(current) => current && current < dayjs().startOf("day")}
          />
        </Form.Item>
        <Form.Item
          name="venue"
          label="Room/Venue"
          rules={[{ required: true, message: "Please specify the venue/classroom hall location" }]}
        >
          <Input placeholder="e.g. Hall A, Auditorium 2" />
        </Form.Item>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <Form.Item
            name="start_time"
            label="Start Time (24h)"
            rules={[{ required: true, message: "Start time is required" }]}
          >
            <TimePicker
              format="HH:mm"
              placeholder="Start time"
              minuteStep={15}
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item
            name="end_time"
            label="End Time (24h)"
            rules={[{ required: true, message: "End time is required" }]}
          >
            <TimePicker
              format="HH:mm"
              placeholder="End time"
              minuteStep={15}
              style={{ width: "100%" }}
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default SessionModal;
