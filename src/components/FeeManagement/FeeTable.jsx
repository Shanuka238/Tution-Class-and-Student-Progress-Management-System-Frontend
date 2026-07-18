import React from "react";
import { Table, Tag, Button, Space, Popconfirm, theme } from "antd";
import { CheckCircleOutlined, FilePdfOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const FeeTable = ({ fees, loading, onMarkCashPaid }) => {
  const { token: themeToken } = theme.useToken();

  const columns = [
    {
      title: "Student Details",
      key: "student",
      render: (_, record) => {
        const studentUser = record.student_id?.user_id || {};
        return (
          <div>
            <div style={{ fontWeight: 600, color: themeToken.colorText }}>
              {studentUser.first_name} {studentUser.last_name}
            </div>
            <div style={{ fontSize: "12px", color: themeToken.colorTextSecondary }}>
              No: {record.student_id?.student_number || "N/A"}
            </div>
          </div>
        );
      }
    },
    {
      title: "Class Details",
      key: "class",
      render: (_, record) => (
        <div>
          <div style={{ color: themeToken.colorText }}>{record.class_id?.class_name}</div>
          <div style={{ fontSize: "12px", color: themeToken.colorTextSecondary }}>
            Grade {record.class_id?.grade}
          </div>
        </div>
      )
    },
    {
      title: "Month",
      dataIndex: "month",
      key: "month"
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => <strong>LKR {amount.toLocaleString()}</strong>
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        if (status === "paid") return <Tag color="success">Paid</Tag>;
        if (status === "unpaid") return <Tag color="processing">Unpaid</Tag>;
        return <Tag color="error">Overdue</Tag>;
      }
    },
    {
      title: "Due Date",
      dataIndex: "due_date",
      key: "due_date",
      render: (date) => dayjs(date).format("MMM DD, YYYY")
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          {record.status !== "paid" ? (
            <Popconfirm
              title="Record Cash Payment"
              description="Are you sure you want to mark this fee record as paid via Cash?"
              onConfirm={() => onMarkCashPaid(record.fee_id || record._id || record.id)}
              okText="Yes, Confirm"
              cancelText="Cancel"
            >
              <Button type="primary" size="small" icon={<CheckCircleOutlined />}>
                Mark Paid (Cash)
              </Button>
            </Popconfirm>
          ) : (
            <Button
              type="link"
              icon={<FilePdfOutlined />}
              onClick={() => window.open(record.receipt_url, "_blank")}
            >
              Receipt
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <Table
      dataSource={fees}
      columns={columns}
      rowKey={(record) => record.fee_id || record._id}
      loading={loading}
      pagination={{ pageSize: 10 }}
    />
  );
};

export default FeeTable;
