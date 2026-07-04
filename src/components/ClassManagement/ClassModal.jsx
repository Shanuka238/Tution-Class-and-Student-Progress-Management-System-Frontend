import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, InputNumber, message, TimePicker, DatePicker } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { classAPI } from "../../services/classApi";
import { adminAPI } from "../../services/adminApi";

dayjs.extend(customParseFormat);

const { Option } = Select;

const ClassModal = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [teachers, setTeachers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());

  useEffect(() => {
    if (visible) {
      form.resetFields();
      setSelectedDate(dayjs());
      const loadTeachers = async () => {
        try {
          const res = await adminAPI.getAllUsers();
          const userList = res.data || res;
          const filtered = userList.filter(item => item.user?.role === "teacher");
          setTeachers(filtered);
        } catch (err) {
          console.error("Error fetching teachers:", err);
          message.error("Failed to fetch available teacher index rows");
        }
      };
      loadTeachers();
    }
  }, [visible, form]);

  const handleDateChange = (date) => {
    if (date) {
      setSelectedDate(date);
      const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][date.day()];
      form.setFieldValue("schedule_days", dayName);
    }
  };

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      const normalizedValues = {
        ...values,
        schedule_date: selectedDate.toDate(),
        schedule_start_time: values.schedule_start_time.format("HH:mm"),
        schedule_end_time: values.schedule_end_time.format("HH:mm"),
      };

      await classAPI.createClass(normalizedValues);
      message.success("Tuition class mapped and added successfully!");
      onSuccess();
    } catch (error) {
      console.error("Error creating class:", error);
      message.error(error.message || "Scheduling failure encountered.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Create New Class Schedule Slot"
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      destroyOnClose
      width={550}
    >
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ max_students: 30 }}>
        <Form.Item name="class_name" label="Class Title" rules={[{ required: true, message: "Required field" }]}>
          <Input placeholder="e.g. Advanced Level Physics 2027" />
        </Form.Item>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <Form.Item name="subject" label="Subject Domain" rules={[{ required: true }]}>
            <Input placeholder="e.g. Physics" />
          </Form.Item>
          <Form.Item name="grade" label="Target Grade Standard" rules={[{ required: true, message: "Please select target grade" }]}>
            <Select placeholder="Select Grade">
              <Option value="6">6</Option>
              <Option value="7">7</Option>
              <Option value="8">8</Option>
              <Option value="9">9</Option>
              <Option value="10">10</Option>
              <Option value="11">11</Option>
              <Option value="12">12</Option>
            </Select>
          </Form.Item>
        </div>

        <Form.Item name="teacher_id" label="Assigned Educator" rules={[{ required: true }]}>
          <Select placeholder="Select teacher from directory roster">
            {teachers.map(t => (
              <Option key={t.profile?._id} value={t.profile?._id || t.user?._id}>
                {t.user?.first_name} {t.user?.last_name} ({t.profile?.subjects || "General"})
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* DatePicker for Date Selection */}
        <Form.Item
          name="schedule_date"
          label="Select Class Date"
          rules={[{ required: true, message: "Please select a date" }]}
        >
          <DatePicker
            placeholder="Pick a date"
            style={{ width: "100%" }}
            onChange={handleDateChange}
            value={selectedDate}
          />
        </Form.Item>

        {/* Hidden field to store schedule_days */}
        <Form.Item name="schedule_days" hidden>
          <Input />
        </Form.Item>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <Form.Item
            name="schedule_start_time"
            label="Start Time (24h)"
            rules={[{ required: true, message: "Start time is required" }]}
          >
            <TimePicker
              format="HH:mm"
              placeholder="Select start time"
              minuteStep={15}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            name="schedule_end_time"
            label="End Time (24h)"
            rules={[{ required: true, message: "End time is required" }]}
          >
            <TimePicker
              format="HH:mm"
              placeholder="Select end time"
              minuteStep={15}
              style={{ width: "100%" }}
            />
          </Form.Item>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
          <Form.Item name="venue" label="Classroom Location/Hall Room" rules={[{ required: true }]}>
            <Input placeholder="e.g. Hall A, Auditorium 2" />
          </Form.Item>
          <Form.Item name="max_students" label="Max Seats Limit" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default ClassModal;