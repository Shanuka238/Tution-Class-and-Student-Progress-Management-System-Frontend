import React, { useState, useEffect } from "react";
import { Modal, Form, Input, InputNumber, DatePicker, TimePicker, Select, Button, Tag, Row, Col, message } from "antd";
import { BookOutlined } from "@ant-design/icons";
import { examAPI } from "../../services/examApi";
import dayjs from "dayjs";

const { Option } = Select;

const CreateExamModal = ({ visible, onCancel, onSuccess, classId, classes = [] }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("edutracker_user") || "{}");
  const isTeacher = currentUser.role === "teacher";

  const hasPreselectedClass = Boolean(classId && classId !== "all");

  // Determine auto-assigned course for teacher
  const defaultClass = hasPreselectedClass
    ? classes.find((c) => (c.class_id || c._id) === classId) || classes[0]
    : classes[0];

  const singleClassMode = isTeacher && classes.length === 1;

  useEffect(() => {
    if (visible) {
      const initialValues = {
        term: "Term 1",
        total_marks: 100,
        start_time: dayjs("09:00", "HH:mm"),
        end_time: dayjs("11:00", "HH:mm"),
      };
      if (hasPreselectedClass) {
        initialValues.class_id = classId;
      } else if (isTeacher && classes.length > 0) {
        initialValues.class_id = classes[0].class_id || classes[0]._id;
      }
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [visible, classId, hasPreselectedClass, isTeacher, classes, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      let targetClassId;
      if (hasPreselectedClass) {
        targetClassId = classId;
      } else if (singleClassMode) {
        targetClassId = defaultClass?.class_id || defaultClass?._id;
      } else {
        targetClassId = values.class_id || defaultClass?.class_id || defaultClass?._id;
      }

      const payload = {
        class_id: targetClassId,
        exam_title: values.exam_title,
        exam_date: values.exam_date.format("YYYY-MM-DD"),
        start_time: values.start_time ? values.start_time.format("HH:mm") : "09:00",
        end_time: values.end_time ? values.end_time.format("HH:mm") : "11:00",
        term: values.term,
        total_marks: values.total_marks,
      };

      await examAPI.createExam(payload);
      message.success("Exam scheduled successfully!");
      form.resetFields();
      onSuccess();

    } catch (error) {
      if (error.errorFields) {
        return;
      }
      message.error(error.message || "Failed to schedule exam");
    } finally {
      setLoading(false);
    }
  };

  const currentSelectedClass = classes.find(
    (c) => (c.class_id || c._id) === (hasPreselectedClass ? classId : defaultClass?.class_id || defaultClass?._id)
  ) || defaultClass;

  return (
    <Modal
      title="Schedule New Exam"
      open={visible}
      onOk={handleOk}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      confirmLoading={loading}
      okText="Schedule Exam"
    >
      <Form form={form} layout="vertical">
        {/* If teacher has 1 assigned course or course is preselected, display clean locked badge */}
        {(singleClassMode || (hasPreselectedClass && isTeacher)) && currentSelectedClass ? (
          <div
            style={{
              marginBottom: "16px",
              padding: "12px 14px",
              background: "rgba(99, 102, 241, 0.08)",
              borderRadius: "8px",
              border: "1px solid rgba(99, 102, 241, 0.25)",
            }}
          >
            <div style={{ fontSize: "11px", color: "#818cf8", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.5px" }}>
              Assigned Course
            </div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#f8fafc", marginTop: "2px" }}>
              <BookOutlined style={{ marginRight: "6px" }} />
              {currentSelectedClass.class_name} • {currentSelectedClass.subject} (Grade {currentSelectedClass.grade})
            </div>
          </div>
        ) : (
          /* Multi-course selection for Admin or Teacher teaching multiple courses */
          !hasPreselectedClass && (
            <Form.Item
              name="class_id"
              label={isTeacher ? "Assigned Course" : "Target Class"}
              rules={[{ required: true, message: "Please select a target class" }]}
              initialValue={defaultClass ? defaultClass.class_id || defaultClass._id : undefined}
            >
              <Select placeholder="Select a class for this exam">
                {classes.map((cls) => (
                  <Option key={cls.class_id || cls._id} value={cls.class_id || cls._id}>
                    {cls.class_name} - {cls.subject} (Grade {cls.grade})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )
        )}

        <Form.Item
          name="exam_title"
          label="Exam Title"
          rules={[{ required: true, message: "Please enter the exam title" }]}
        >
          <Input placeholder="e.g. Term 1 Assessment Paper" />
        </Form.Item>

        <Form.Item
          name="term"
          label="Term"
          rules={[{ required: true, message: "Please select a term" }]}
          initialValue="Term 1"
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
                placeholder="11:00"
              />
            </Form.Item>
          </Col>
        </Row>

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
