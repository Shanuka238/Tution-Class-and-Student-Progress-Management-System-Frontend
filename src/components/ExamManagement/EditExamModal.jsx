import React, { useState, useEffect } from "react";
import { Modal, Form, Input, DatePicker, TimePicker, Row, Col, Tag, Typography, message } from "antd";
import { EditOutlined, BookOutlined, CalendarOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { examAPI } from "../../services/examApi";
import dayjs from "dayjs";

const { Text } = Typography;

const EditExamModal = ({ visible, onCancel, onSuccess, exam }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && exam) {
      const examDate = exam.exam_date ? dayjs(exam.exam_date) : null;
      const startTime = exam.start_time ? dayjs(exam.start_time, "HH:mm") : dayjs("09:00", "HH:mm");
      const endTime = exam.end_time ? dayjs(exam.end_time, "HH:mm") : dayjs("11:00", "HH:mm");

      form.setFieldsValue({
        exam_title: exam.exam_title || "",
        exam_date: examDate,
        start_time: startTime,
        end_time: endTime,
      });
    } else {
      form.resetFields();
    }
  }, [visible, exam, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const examId = exam._id || exam.exam_id || exam.id;
      const payload = {
        exam_title: values.exam_title.trim(),
        exam_date: values.exam_date.format("YYYY-MM-DD"),
        start_time: values.start_time ? values.start_time.format("HH:mm") : "09:00",
        end_time: values.end_time ? values.end_time.format("HH:mm") : "11:00",
      };

      await examAPI.updateExam(examId, payload);
      message.success("Exam details updated successfully!");
      form.resetFields();
      onSuccess();
    } catch (error) {
      if (error.errorFields) return;
      message.error(error.message || "Failed to update exam details");
    } finally {
      setLoading(false);
    }
  };

  const className = exam?.class_id?.class_name || exam?.class_name || "Course Batch";
  const subject = exam?.class_id?.subject || "";
  const grade = exam?.class_id?.grade || "";

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <EditOutlined style={{ color: "#6366f1" }} />
          <span>Edit Exam Schedule</span>
        </div>
      }
      open={visible}
      onOk={handleOk}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      confirmLoading={loading}
      okText="Save Changes"
      destroyOnClose
      width={500}
    >
      {/* Read-only Context Box */}
      <div
        style={{
          marginBottom: "20px",
          padding: "12px 16px",
          background: "rgba(99, 102, 241, 0.06)",
          borderRadius: "10px",
          border: "1px solid rgba(99, 102, 241, 0.2)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontWeight: 600, fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
            <BookOutlined style={{ color: "#6366f1" }} />
            <span>{className}</span>
          </div>
          <Tag color="purple">{exam?.total_marks || 100} Marks</Tag>
        </div>
        <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
          {subject ? `${subject} • ` : ""}Grade {grade || "N/A"} • Term: <Tag color="blue" style={{ margin: 0 }}>{exam?.term || "General"}</Tag>
        </div>
      </div>

      <Text type="secondary" style={{ fontSize: "12px", display: "block", marginBottom: "16px" }}>
        Note: Only the <strong>Exam Name</strong>, <strong>Exam Date</strong>, and <strong>Time Slot</strong> can be modified.
      </Text>

      <Form form={form} layout="vertical">
        {/* 1. Exam Name / Title */}
        <Form.Item
          label="Exam Name / Title"
          name="exam_title"
          rules={[
            { required: true, message: "Please enter the exam title" },
            { whitespace: true, message: "Exam title cannot be empty" },
          ]}
        >
          <Input placeholder="e.g. Mid-Term Theory Assessment 2026" size="large" />
        </Form.Item>

        {/* 2. Exam Date */}
        <Form.Item
          label="Exam Date"
          name="exam_date"
          rules={[{ required: true, message: "Please select the exam date" }]}
        >
          <DatePicker
            style={{ width: "100%" }}
            format="YYYY-MM-DD"
            placeholder="Select exam date"
            size="large"
          />
        </Form.Item>

        {/* 3. Start Time & End Time */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Start Time"
              name="start_time"
              rules={[{ required: true, message: "Please select start time" }]}
            >
              <TimePicker
                format="HH:mm"
                minuteStep={15}
                style={{ width: "100%" }}
                size="large"
                placeholder="09:00"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="End Time"
              name="end_time"
              rules={[{ required: true, message: "Please select end time" }]}
            >
              <TimePicker
                format="HH:mm"
                minuteStep={15}
                style={{ width: "100%" }}
                size="large"
                placeholder="11:00"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default EditExamModal;
