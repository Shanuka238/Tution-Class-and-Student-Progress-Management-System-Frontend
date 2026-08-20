import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, InputNumber, DatePicker, message } from "antd";
import { classAPI } from "../../services/classApi";
import { adminAPI } from "../../services/adminApi";
import dayjs from "dayjs";

const { Option } = Select;

const ClassModal = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [teachers, setTeachers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

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
          message.error("Failed to fetch available teacher index rows");
        }
      };
      loadTeachers();
    }
  }, [visible, form]);

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        start_date: values.start_date ? values.start_date.format("YYYY-MM-DD") : null,
        end_date: values.end_date ? values.end_date.format("YYYY-MM-DD") : null,
      };
      await classAPI.createClass(payload);
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
              <Option value="13">13</Option>
            </Select>
          </Form.Item>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <Form.Item name="start_date" label="Start Date" rules={[{ required: true, message: "Please select a start date" }]}>
            <DatePicker 
              style={{ width: "100%" }} 
              disabledDate={(current) => current && current < dayjs().startOf("day")} 
            />
          </Form.Item>
          <Form.Item name="end_date" label="End Date" rules={[{ required: true, message: "Please select an end date" }]}>
            <DatePicker 
              style={{ width: "100%" }} 
              disabledDate={(current) => {
                const startDate = form.getFieldValue("start_date");
                return current && (current < dayjs().startOf("day") || (startDate && current < dayjs(startDate).startOf("day")));
              }} 
            />
          </Form.Item>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
          <Form.Item name="max_students" label="Max Seats Limit" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default ClassModal;