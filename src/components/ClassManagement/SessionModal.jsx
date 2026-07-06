import React, { useState } from "react";
import { Modal, Form, DatePicker, TimePicker, message } from "antd";
import { classAPI } from "../../services/classApi";
import dayjs from "dayjs";

const SessionModal = ({ visible, onCancel, onSuccess, courseId, courseName }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      const dateStr = values.date.format("YYYY-MM-DD");
      const startTime = values.start_time.format("HH:mm");
      const endTime = values.end_time.format("HH:mm");
      await classAPI.createSession(courseId, dateStr, startTime, endTime);
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
        <Form.Item
          name="date"
          label="Session Date"
          rules={[{ required: true, message: "Please select a session date" }]}
        >
          <DatePicker style={{ width: "100%" }} />
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
