import React, { useState } from "react";
import { Table, Tag, Button, Space, Popconfirm, theme } from "antd";
import { CheckCircleOutlined, FilePdfOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import PayHereReceiptModal from "../PaymentManagement/PayHereReceiptModal";

const FeeTable = ({ fees, loading, onMarkCashPaid }) => {
  const { token: themeToken } = theme.useToken();
  const [receiptModalVisible, setReceiptModalVisible] = useState(false);
  const [selectedFeeForReceipt, setSelectedFeeForReceipt] = useState(null);

  const handleOpenReceipt = (feeRecord) => {
    setSelectedFeeForReceipt(feeRecord);
    setReceiptModalVisible(true);
  };

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
          <div style={{ color: themeToken.colorText, fontWeight: 500 }}>{record.class_id?.class_name}</div>
          <div style={{ fontSize: "12px", color: themeToken.colorTextSecondary }}>
            Grade {record.class_id?.grade} · {record.class_id?.subject}
          </div>
        </div>
      )
    },
    {
      title: "Billing Month",
      dataIndex: "month",
      key: "month",
      render: (m) => <span style={{ fontWeight: 500 }}>{m}</span>
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => <strong>LKR {(amount || 0).toLocaleString()}</strong>
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        if (status === "paid") return <Tag color="success" icon={<CheckCircleOutlined />}>Paid</Tag>;
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
              type="default"
              size="small"
              icon={<FilePdfOutlined style={{ color: "#7c3aed" }} />}
              onClick={() => handleOpenReceipt(record)}
            >
              View Receipt
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <>
      <Table
        dataSource={fees}
        columns={columns}
        rowKey={(record) => record.fee_id || record._id}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <PayHereReceiptModal
        visible={receiptModalVisible}
        onClose={() => {
          setReceiptModalVisible(false);
          setSelectedFeeForReceipt(null);
        }}
        fee={selectedFeeForReceipt}
      />
    </>
  );
};

export default FeeTable;
