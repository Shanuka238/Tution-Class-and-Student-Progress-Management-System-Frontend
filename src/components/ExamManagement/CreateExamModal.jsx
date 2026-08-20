import React, { useState, useEffect } from "react";
import { Modal, Form, Input, InputNumber, DatePicker, Select, Button, message } from "antd";
import { examAPI } from "../../services/examApi";
import dayjs from "dayjs";

const { Option } = Select;

const CreateExamModal = ({ visible, onCancel, onSuccess, classId, classes = [] }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const hasPreselectedClass = classId && classId !== "all";

  useEffect(() => {
    if (visible) {
      if (hasPreselectedClass) {
        form.setFieldsValue({ class_id: classId });
      } else {
        form.resetFields();
      }
    }
  }, [visible, classId, hasPreselectedClass, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const targetClassId = hasPreselectedClass ? classId : values.class_id;

      const payload = {
        class_id: targetClassId,
        exam_title: values.exam_title,
        exam_date: values.exam_date.format("YYYY-MM-DD"),
        term: values.term,
        total_marks: values.total_marks,
      };

      await examAPI.createExam(payload);
      message.success("Exam created successfully!");
      form.resetFields();
      onSuccess();
    } catch (error) {
      if (error.errorFields) {
        // Validation error, ignore
        return;
      }
      message.error(error.message || "Failed to create exam");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Create New Exam"
      open={visible}
      onOk={handleOk}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      confirmLoading={loading}
      okText="Create Exam"
    >
      <Form form={form} layout="vertical">
        {!hasPreselectedClass && (
          <Form.Item
            name="class_id"
            label="Target Class"
            rules={[{ required: true, message: "Please select a target class" }]}
          >
            <Select placeholder="Select a class for this exam">
              {classes.map((cls) => (
                <Option key={cls.class_id || cls._id} value={cls.class_id || cls._id}>
                  {cls.class_name} - {cls.subject} (Grade {cls.grade})
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}

        <Form.Item
          name="exam_title"
          label="Exam Title"
          rules={[{ required: true, message: "Please enter the exam title" }]}
        >
          <Input placeholder="e.g. Mid Term Mathematics Exam" />
        </Form.Item>

        <Form.Item
          name="term"
          label="Term"
          rules={[{ required: true, message: "Please select a term" }]}
        >
          <Select placeholder="Select Term">
            <Option value="Term 1">Term 1</Option>
            <Option value="Term 2">Term 2</Option>
            <Option value="Term 3">Term 3</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="exam_date"
          label="Exam Date"
          rules={[{ required: true, message: "Please select the exam date" }]}
        >
          <DatePicker
            style={{ width: "100%" }}
            disabledDate={(current) => current && current < dayjs().startOf("day")}
          />
        </Form.Item>

        <Form.Item
          name="total_marks"
          label="Total Marks"
          rules={[{ required: true, message: "Please enter total marks" }]}
          initialValue={100}
        >
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateExamModal;
