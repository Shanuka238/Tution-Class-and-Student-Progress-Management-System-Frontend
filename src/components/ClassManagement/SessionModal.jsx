import React, { useEffect, useState } from "react";
import { Modal, Form, DatePicker, TimePicker, Select, Input, message } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
import { classAPI } from "../../services/classApi";
import { adminAPI } from "../../services/adminApi";
import dayjs from "dayjs";

const SessionModal = ({ visible, onCancel, onSuccess, course, courseId, courseName }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    if (visible) {
      form.resetFields();
      form.setFieldsValue({ date: dayjs() });

      const loadTeachers = async () => {
        try {
          // Fetch system users to get actual full names and teacher profiles
          const res = await adminAPI.getAllUsers();
          const userList = res.data || res;
          const allTeachers = (Array.isArray(userList) ? userList : [])
            .filter((item) => item.user?.role === "teacher")
            .map((item) => {
              const userObj = item.user || {};
              const profObj = item.profile || {};
              const fullName = `${userObj.first_name || ""} ${userObj.last_name || ""}`.trim() || userObj.email || "Educator";
              return {
                id: String(profObj._id || userObj._id),
                profileId: profObj._id ? String(profObj._id) : null,
                userId: userObj._id ? String(userObj._id) : null,
                name: fullName,
                subjects: profObj.subjects || course?.subject || "General",
              };
            });

          // Check if course has specific assigned teachers
          let assignedList = [];

          // 1. Check aggregated teachers_data
          if (course?.teachers_data && Array.isArray(course.teachers_data) && course.teachers_data.length > 0) {
            assignedList = course.teachers_data.map((t) => {
              const matched = allTeachers.find(
                (at) => at.profileId === String(t.id || t._id) || at.userId === String(t.id || t._id) || at.id === String(t.id || t._id)
              );
              return {
                id: String(t.id || t._id),
                name: matched?.name || t.name || "Educator",
                subjects: course.subject || t.subjects || "General",
              };
            });
          }
          // 2. Check aggregated teacher_data
          else if (course?.teacher_data && (course.teacher_data.name || course.teacher_data.id || course.teacher_data._id)) {
            const tId = String(course.teacher_data.id || course.teacher_data._id);
            const matched = allTeachers.find(
              (at) => at.profileId === tId || at.userId === tId || at.id === tId
            );
            assignedList = [{
              id: tId,
              name: matched?.name || course.teacher_data.name || "Educator",
              subjects: course.subject || "General",
            }];
          }
          // 3. Check course.teachers or course.teacher_id raw IDs/objects
          else if (course?.teachers && Array.isArray(course.teachers) && course.teachers.length > 0) {
            assignedList = course.teachers.map((t) => {
              const rawId = String(t._id || t.teacher_id || t);
              const matched = allTeachers.find(
                (at) => at.profileId === rawId || at.userId === rawId || at.id === rawId
              );
              const fallbackName = t.user_id ? `${t.user_id.first_name} ${t.user_id.last_name}` : (t.name && t.name !== "Teacher" ? t.name : null);
              return {
                id: matched?.id || rawId,
                name: matched?.name || fallbackName || "Educator",
                subjects: matched?.subjects || t.subjects || course.subject || "General",
              };
            });
          } else if (course?.teacher_id) {
            const rawId = String(course.teacher_id._id || course.teacher_id.teacher_id || course.teacher_id);
            const matched = allTeachers.find(
              (at) => at.profileId === rawId || at.userId === rawId || at.id === rawId
            );
            const fallbackName = course.teacher_id?.user_id
              ? `${course.teacher_id.user_id.first_name} ${course.teacher_id.user_id.last_name}`
              : (course.teacher_id?.name && course.teacher_id.name !== "Teacher" ? course.teacher_id.name : null);
            assignedList = [{
              id: matched?.id || rawId,
              name: matched?.name || fallbackName || "Educator",
              subjects: matched?.subjects || course.subject || "General",
            }];
          }

          // If course has assigned teachers, use them; otherwise provide all system teachers
          const finalTeachers = assignedList.length > 0 ? assignedList : allTeachers;
          setTeachers(finalTeachers);

          if (finalTeachers.length > 0) {
            form.setFieldsValue({ teacher_id: String(finalTeachers[0].id) });
          }
        } catch (err) {
          console.error("Error loading teachers for session modal:", err);
          message.error("Failed to load available teachers");
        }
      };

      loadTeachers();
    }
  }, [visible, course, form]);

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

  const teacherOptions = teachers.map((t) => ({
    label: `${t.name} (${t.subjects || "General"})`,
    value: String(t.id),
  }));

  return (
    <Modal
      title={`Schedule Session for ${displayName}`}
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      destroyOnClose
      width={480}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ date: dayjs() }}
      >
        <Form.Item
          name="teacher_id"
          label="Assigned Educator"
          rules={[{ required: true, message: "Please select an educator for this session" }]}
          style={{ marginBottom: "16px" }}
        >
          <Select
            placeholder="Select teacher for this session"
            options={teacherOptions}
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="date"
          label="Session Date"
          rules={[{ required: true, message: "Please select a session date" }]}
          style={{ marginBottom: "16px" }}
        >
          <DatePicker
            style={{ width: "100%" }}
            format="YYYY-MM-DD"
            size="large"
            disabledDate={(current) => current && current < dayjs().startOf("day")}
          />
        </Form.Item>

        <Form.Item
          name="venue"
          label="Room / Venue"
          rules={[{ required: true, message: "Please specify the venue/classroom hall location" }]}
          style={{ marginBottom: "16px" }}
        >
          <Input placeholder="e.g. Hall A, Auditorium 2" size="large" prefix={<EnvironmentOutlined style={{ color: "#94a3b8" }} />} />
        </Form.Item>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <Form.Item
            name="start_time"
            label="Start Time (24h)"
            rules={[{ required: true, message: "Start time is required" }]}
            style={{ marginBottom: "8px" }}
          >
            <TimePicker
              format="HH:mm"
              placeholder="Start time"
              minuteStep={15}
              style={{ width: "100%" }}
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="end_time"
            label="End Time (24h)"
            rules={[{ required: true, message: "End time is required" }]}
            style={{ marginBottom: "8px" }}
          >
            <TimePicker
              format="HH:mm"
              placeholder="End time"
              minuteStep={15}
              style={{ width: "100%" }}
              size="large"
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default SessionModal;
