import React from "react";
import { Table, Tag, Button, Space, theme } from "antd";
import { CreditCardOutlined, FilePdfOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const PaymentTable = ({ fees, loading, onPay }) => {
  const { token: themeToken } = theme.useToken();

  const columns = [
    {
      title: "Course / Subject",
      key: "subject",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, color: themeToken.colorText }}>
            {record.class_id?.class_name || "Tuition Class"}
          </div>
          <div style={{ fontSize: "12px", color: themeToken.colorTextSecondary }}>
            {record.class_id?.subject || "Subject"}
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
      title: "Due Date",
      dataIndex: "due_date",
      key: "due_date",
      render: (date) => dayjs(date).format("MMM DD, YYYY")
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
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          {record.status !== "paid" ? (
            <Button
              type="primary"
              size="small"
              icon={<CreditCardOutlined />}
              onClick={() => onPay(record)}
            >
              Pay Online
            </Button>
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

export default PaymentTable;
