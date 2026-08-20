import React from "react";
import { Modal, Form, Select, InputNumber, DatePicker, Button, Space } from "antd";
import dayjs from "dayjs";

const BillingModal = ({ visible, onCancel, onFinish, classes }) => {
  const [form] = Form.useForm();

  const handleFinish = (values) => {
    onFinish(values);
    form.resetFields();
  };

  return (
    <Modal
      title="Generate Class Monthly Invoice Billing"
      open={visible}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        style={{ marginTop: "16px" }}
      >
        <Form.Item
          name="class_id"
          label="Target Course/Class"
          rules={[{ required: true, message: "Please select target course" }]}
        >
          <Select
            placeholder="Select Course"
            options={classes.map((cls) => ({
              label: `${cls.class_name} (${cls.subject}) • Grade ${cls.grade}`,
              value: cls._id || cls.class_id
            }))}
          />
        </Form.Item>

        <Form.Item
          name="month"
          label="Billing Month"
          rules={[{ required: true, message: "Please enter billing month" }]}
        >
          <Select
            placeholder="Select Month"
            options={[
              "January 2026", "February 2026", "March 2026", "April 2026",
              "May 2026", "June 2026", "July 2026", "August 2026",
              "September 2026", "October 2026", "November 2026", "December 2026"
            ].map(m => ({ label: m, value: m }))}
          />
        </Form.Item>

        <Form.Item
          name="amount"
          label="Fee Amount (LKR)"
          rules={[
            { required: true, message: "Please enter tuition fee amount" },
            { type: "number", min: 1, message: "Amount must be greater than 0" }
          ]}
        >
          <InputNumber style={{ width: "100%" }} placeholder="e.g. 5000" />
        </Form.Item>

        <Form.Item
          name="due_date"
          label="Payment Due Date"
          rules={[{ required: true, message: "Please select payment due date" }]}
        >
          <DatePicker
            style={{ width: "100%" }}
            format="YYYY-MM-DD"
            disabledDate={(current) => current && current < dayjs().startOf("day")}
          />
        </Form.Item>

        <Form.Item style={{ display: "flex", justifyContent: "flex-end", marginBottom: 0 }}>
          <Space>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit">Generate Billing Roster</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BillingModal;
