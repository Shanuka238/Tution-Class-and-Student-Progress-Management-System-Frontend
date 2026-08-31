import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, Typography, Button, message, Space, Select, Input, DatePicker, Row, Col, theme } from "antd";
import { PlusOutlined, SendOutlined, SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import { classAPI } from "../../services/classApi";
import { feeAPI } from "../../services/feeApi";
import FeeStatsCards from "./FeeStatsCards";
import BillingModal from "./BillingModal";
import FeeTable from "./FeeTable";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const FeeManagement = () => {
  const { token: themeToken } = theme.useToken();
  const [classes, setClasses] = useState([]);
  const [fees, setFees] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    paidCount: 0,
    unpaidCount: 0,
    overdueCount: 0,
  });
  const [loading, setLoading] = useState(false);

  // Filters
  const [searchText, setSearchText] = useState("");
  const [selectedClassFilter, setSelectedClassFilter] = useState(null);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [reminding, setReminding] = useState(false);

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const classRes = await classAPI.getActiveClasses();
      const classList = classRes.data || classRes || [];
      setClasses(Array.isArray(classList) ? classList : []);

      const statsRes = await feeAPI.getFinancialStats(
        selectedClassFilter ? { class_id: selectedClassFilter } : {}
      );
      const rawStats = statsRes.data || statsRes || {};

      const feesRes = await feeAPI.getAllFees(
        selectedClassFilter ? { class_id: selectedClassFilter } : {}
      );
      const feeList = feesRes.data || feesRes || [];
      setFees(Array.isArray(feeList) ? feeList : []);

      // Calculate stats directly from fees array if backend keys are missing or 0
      const paidList = Array.isArray(feeList) ? feeList.filter((f) => f.status === "paid") : [];
      const unpaidList = Array.isArray(feeList) ? feeList.filter((f) => f.status === "unpaid") : [];
      const overdueList = Array.isArray(feeList) ? feeList.filter((f) => f.status === "overdue") : [];

      setStats({
        totalRevenue: rawStats.totalRevenue ?? paidList.reduce((sum, f) => sum + (Number(f.amount) || 0), 0),
        pendingAmount: rawStats.pendingAmount ?? [...unpaidList, ...overdueList].reduce((sum, f) => sum + (Number(f.amount) || 0), 0),
        paidCount: rawStats.paidCount ?? rawStats.paidInvoicesCount ?? paidList.length,
        unpaidCount: rawStats.unpaidCount !== undefined ? rawStats.unpaidCount : unpaidList.length,
        overdueCount: rawStats.overdueCount ?? rawStats.overdueInvoicesCount ?? overdueList.length,
      });
    } catch (err) {
      console.error("Error loading fee management:", err);
      message.error("Failed to load fees directory and metrics");
    } finally {
      setLoading(false);
    }
  }, [selectedClassFilter]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Dynamic filter calculation
  const filteredFees = useMemo(() => {
    return fees.filter((fee) => {
      // 1. Status Filter
      if (selectedStatusFilter !== "all") {
        const isOverdue =
          fee.status === "overdue" ||
          (fee.status === "unpaid" && fee.due_date && dayjs(fee.due_date).isBefore(dayjs().startOf("day")));
        const computedStatus = fee.status === "paid" ? "paid" : isOverdue ? "overdue" : "unpaid";
        if (computedStatus !== selectedStatusFilter) return false;
      }

      // 2. Search Text
      if (searchText.trim()) {
        const q = searchText.toLowerCase().trim();
        const studentUser = fee.student_id?.user_id || {};
        const studentName = `${studentUser.first_name || ""} ${studentUser.last_name || ""}`.toLowerCase();
        const studentNo = String(fee.student_id?.student_number || "").toLowerCase();
        const className = String(fee.class_id?.class_name || "").toLowerCase();
        const subject = String(fee.class_id?.subject || "").toLowerCase();
        const month = String(fee.month || "").toLowerCase();

        if (
          !studentName.includes(q) &&
          !studentNo.includes(q) &&
          !className.includes(q) &&
          !subject.includes(q) &&
          !month.includes(q)
        ) {
          return false;
        }
      }

      // 3. Date Range Filter
      if (dateRange && dateRange[0] && dateRange[1]) {
        const startDate = dayjs(dateRange[0]).startOf("day");
        const endDate = dayjs(dateRange[1]).endOf("day");

        const dueDate = fee.due_date ? dayjs(fee.due_date) : null;
        const paidDate = fee.paid_date ? dayjs(fee.paid_date) : null;

        const isDueInRange = dueDate && (dueDate.isAfter(startDate) || dueDate.isSame(startDate, "day")) && (dueDate.isBefore(endDate) || dueDate.isSame(endDate, "day"));
        const isPaidInRange = paidDate && (paidDate.isAfter(startDate) || paidDate.isSame(startDate, "day")) && (paidDate.isBefore(endDate) || paidDate.isSame(endDate, "day"));

        if (!isDueInRange && !isPaidInRange) {
          return false;
        }
      }

      return true;
    });
  }, [fees, selectedStatusFilter, searchText, dateRange]);

  const resetFilters = () => {
    setSearchText("");
    setSelectedClassFilter(null);
    setSelectedStatusFilter("all");
    setDateRange(null);
  };

  const hasActiveFilters = Boolean(
    searchText.trim() || selectedClassFilter || selectedStatusFilter !== "all" || (dateRange && dateRange.length > 0)
  );

  const handleMarkCashPaid = async (feeId) => {
    try {
      await feeAPI.markAsPaid(feeId);
      message.success("Cash payment recorded successfully!");
      fetchInitialData();
    } catch (err) {
      message.error(err.message || "Failed to log cash payment transaction");
    }
  };

  const handleGenerateFees = async (values) => {
    try {
      const payload = {
        class_id: values.class_id,
        month: values.month,
        amount: values.amount,
        due_date: values.due_date.toISOString(),
      };

      await feeAPI.generateMonthlyFees(payload);
      message.success(`Billing successfully generated for selected student roster`);
      setModalVisible(false);
      fetchInitialData();
    } catch (err) {
      message.error(err.message || "Failed to generate billing records");
    }
  };

  const handleSendReminders = async () => {
    setReminding(true);
    try {
      const res = await feeAPI.sendOverdueReminders();
      message.success(res.message || "Successfully sent overdue alerts");
      fetchInitialData();
    } catch (err) {
      message.error(err.message || "Failed to trigger overdue reminders");
    } finally {
      setReminding(false);
    }
  };

  return (
    <div className="dashboard-content">
      <div
        className="welcome-section"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0, color: themeToken.colorText }}>
            Fee & Payment Registry
          </Title>
          <Text type="secondary">
            Track monthly invoice collections, cash log entries, and automated overdue tracking.
          </Text>
        </div>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            Generate Class Billing
          </Button>
          <Button
            type="default"
            danger
            icon={<SendOutlined />}
            loading={reminding}
            onClick={handleSendReminders}
          >
            Send Overdue Alerts
          </Button>
        </Space>
      </div>

      <FeeStatsCards stats={stats} />

      <Card
        bordered={false}
        style={{
          borderRadius: "12px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
          border: `1px solid ${themeToken.colorBorderSecondary}`,
          background: themeToken.colorBgContainer,
        }}
      >
        {/* Filter Toolbar */}
        <div style={{ marginBottom: "16px" }}>
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} sm={12} md={7}>
              <Input
                prefix={<SearchOutlined style={{ color: themeToken.colorTextPlaceholder }} />}
                placeholder="Search student, index, class, month..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>

            <Col xs={12} sm={6} md={5}>
              <Select
                placeholder="All Courses"
                allowClear
                style={{ width: "100%" }}
                value={selectedClassFilter}
                onChange={setSelectedClassFilter}
                options={classes.map((cls) => ({
                  label: `${cls.class_name} (${cls.subject})`,
                  value: cls._id || cls.class_id,
                }))}
              />
            </Col>

            <Col xs={12} sm={6} md={4}>
              <Select
                style={{ width: "100%" }}
                value={selectedStatusFilter}
                onChange={setSelectedStatusFilter}
                placeholder="Payment Status"
              >
                <Option value="all">All Statuses</Option>
                <Option value="paid">Paid</Option>
                <Option value="unpaid">Unpaid</Option>
                <Option value="overdue">Overdue</Option>
              </Select>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <RangePicker
                style={{ width: "100%" }}
                value={dateRange}
                onChange={(dates) => setDateRange(dates)}
                format="YYYY-MM-DD"
                placeholder={["Start Date", "End Date"]}
              />
            </Col>

            <Col xs={24} sm={12} md={2} style={{ textAlign: "right" }}>
              {hasActiveFilters && (
                <Button icon={<ReloadOutlined />} onClick={resetFilters} type="text" danger>
                  Reset
                </Button>
              )}
            </Col>
          </Row>
        </div>

        <FeeTable fees={filteredFees} loading={loading} onMarkCashPaid={handleMarkCashPaid} />
      </Card>

      <BillingModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onFinish={handleGenerateFees}
        classes={classes}
      />
    </div>
  );
};

export default FeeManagement;
