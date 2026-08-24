import React, { useEffect, useState, useMemo } from "react";
import { Modal, Form, DatePicker, TimePicker, Select, Input, message } from "antd";
import { classAPI } from "../../services/classApi";
import { adminAPI } from "../../services/adminApi";
import dayjs from "dayjs";

const { Option } = Select;

const SessionModal = ({ visible, onCancel, onSuccess, course, courseId, courseName }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [teachers, setTeachers] = useState([]);

  // Extract assigned educators from the course object
  const courseAssignedTeachers = useMemo(() => {
    if (course?.teachers && Array.isArray(course.teachers) && course.teachers.length > 0) {
      return course.teachers.map((t) => ({
        id: t._id || t.teacher_id,
        name: t.user_id ? `${t.user_id.first_name} ${t.user_id.last_name}` : (t.name || "Teacher"),
        subjects: t.subjects || course.subject || "General",
      }));
    }
    if (course?.teacher_id) {
      const t = course.teacher_id;
      return [{
        id: t._id || t.teacher_id || t,
        name: t.user_id ? `${t.user_id.first_name} ${t.user_id.last_name}` : "Assigned Teacher",
        subjects: t.subjects || course.subject || "General",
      }];
    }
    return [];
  }, [course]);

  useEffect(() => {
    if (visible) {
      form.resetFields();
      if (courseAssignedTeachers.length > 0) {
        setTeachers(courseAssignedTeachers);
        form.setFieldsValue({ teacher_id: courseAssignedTeachers[0].id });
      } else {
        // Fallback for legacy courses with no teacher metadata
        const loadTeachers = async () => {
          try {
            const res = await adminAPI.getAllUsers();
            const userList = res.data || res;
            const filtered = userList
              .filter((item) => item.user?.role === "teacher")
              .map((item) => ({
                id: item.profile?._id || item.user?._id,
                name: `${item.user?.first_name} ${item.user?.last_name}`,
                subjects: item.profile?.subjects || "General",
              }));
            setTeachers(filtered);
            if (filtered.length > 0) {
              form.setFieldsValue({ teacher_id: filtered[0].id });
            }
          } catch (err) {
            console.error("Error fetching teachers:", err);
            message.error("Failed to fetch available teachers");
          }
        };
        loadTeachers();
      }
    }
  }, [visible, courseAssignedTeachers, form]);

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      const dateStr = values.date.format("YYYY-MM-DD");
      const startTime = values.start_time.format("HH:mm");
      const endTime = values.end_time.format("HH:mm");
      const teacherId = values.teacher_id;
      const venue = values.venue;
      const targetCourseId = courseId || course?._id;

      await classAPI.createSession(targetCourseId, dateStr, startTime, endTime, teacherId, venue);
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

  const displayName = courseName || course?.class_name || "Course";

  return (
    <Modal
      title={`Schedule Session for ${displayName}`}
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      destroyOnClose
      width={450}
    >
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ date: dayjs() }}>
        <Form.Item
          name="teacher_id"
          label="Assigned Educator"
          rules={[{ required: true, message: "Please select an educator for this session" }]}
        >
          <Select placeholder="Select teacher for this session">
            {teachers.map((t) => (
              <Option key={t.id} value={t.id}>
                {t.name} ({t.subjects})
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
