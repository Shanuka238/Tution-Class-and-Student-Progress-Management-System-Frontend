import React, { useState, useMemo } from "react";
import { Table, Tag, Button, Space, Input, Select, Card, Row, Col, theme } from "antd";
import { CreditCardOutlined, FilePdfOutlined, SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import { formatDate } from "../../utils/dateUtils";

const { Option } = Select;

const PaymentTable = ({ fees = [], loading, onPay }) => {
  const { token: themeToken } = theme.useToken();
  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredFees = useMemo(() => {
    return fees.filter((item) => {
      // 1. Status Filter
      if (selectedStatus !== "all" && item.status !== selectedStatus) {
        return false;
      }

      // 2. Search Text
      if (searchText.trim()) {
        const q = searchText.toLowerCase().trim();
        const className = (item.class_id?.class_name || "").toLowerCase();
        const subject = (item.class_id?.subject || "").toLowerCase();
        const month = (item.month || "").toLowerCase();

        if (!className.includes(q) && !subject.includes(q) && !month.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [fees, searchText, selectedStatus]);

  const resetFilters = () => {
    setSearchText("");
    setSelectedStatus("all");
  };

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
      ),
    },
    {
      title: "Month",
      dataIndex: "month",
      key: "month",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => <strong>LKR {(amount || 0).toLocaleString()}</strong>,
    },
    {
      title: "Due Date",
      dataIndex: "due_date",
      key: "due_date",
      render: (date) => formatDate(date),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        if (status === "paid") return <Tag color="success">Paid</Tag>;
        if (status === "unpaid") return <Tag color="processing">Unpaid</Tag>;
        return <Tag color="error">Overdue</Tag>;
      },
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
      ),
    },
  ];

  const hasFilters = searchText || selectedStatus !== "all";

  return (
    <div>
      {/* Payment Filter Toolbar */}
      <Card
        size="small"
        style={{
          marginBottom: "16px",
          background: themeToken.colorBgLayout,
          borderRadius: "8px",
          border: `1px solid ${themeToken.colorBorderSecondary}`,
        }}
      >
        <Row gutter={[10, 10]} align="middle">
          <Col xs={24} sm={12} md={12}>
            <Input
              prefix={<SearchOutlined style={{ color: "#9CA3AF" }} />}
              placeholder="Search invoice by course, subject, or month..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={8} md={8}>
            <Select
              style={{ width: "100%" }}
              value={selectedStatus}
              onChange={(val) => setSelectedStatus(val)}
            >
              <Option value="all">All Payment Statuses</Option>
              <Option value="paid">Paid Invoices</Option>
              <Option value="unpaid">Unpaid Pending</Option>
              <Option value="overdue">Overdue Warnings</Option>
            </Select>
          </Col>
          <Col xs={12} sm={4} md={4} style={{ textAlign: "right" }}>
            {hasFilters && (
              <Button icon={<ReloadOutlined />} onClick={resetFilters} type="text" danger>
                Reset
              </Button>
            )}
          </Col>
        </Row>
      </Card>

      <Table
        dataSource={filteredFees}
        columns={columns}
        rowKey={(record) => record.fee_id || record._id}
        loading={loading}
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: "No matching payment records found" }}
      />
    </div>
  );
};

export default PaymentTable;
