import React, { useState, useEffect, useCallback } from "react";
import { Card, Typography, Button, message, Space, Select, theme } from "antd";
import { PlusOutlined, SendOutlined } from "@ant-design/icons";
import { classAPI } from "../../services/classApi";
import { feeAPI } from "../../services/feeApi";
import FeeStatsCards from "./FeeStatsCards";
import BillingModal from "./BillingModal";
import FeeTable from "./FeeTable";

const { Title, Text } = Typography;

const FeeManagement = () => {
  const { token: themeToken } = theme.useToken();
  const [classes, setClasses] = useState([]);
  const [fees, setFees] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    paidCount: 0,
    unpaidCount: 0,
    overdueCount: 0
  });
  const [loading, setLoading] = useState(false);
  const [selectedClassFilter, setSelectedClassFilter] = useState(null);
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
      const paidList = Array.isArray(feeList) ? feeList.filter(f => f.status === "paid") : [];
      const unpaidList = Array.isArray(feeList) ? feeList.filter(f => f.status === "unpaid") : [];
      const overdueList = Array.isArray(feeList) ? feeList.filter(f => f.status === "overdue") : [];

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
        due_date: values.due_date.toISOString()
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
      <div className="welcome-section" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <Title level={3} style={{ margin: 0, color: themeToken.colorText }}>Fee & Payment Registry</Title>
          <Text type="secondary">Track monthly invoice collections, cash log entries, and automated overdue tracking.</Text>
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
          background: themeToken.colorBgContainer
        }}
      >
        <div style={{ marginBottom: "16px" }}>
          <span style={{ marginRight: "12px", color: themeToken.colorTextDescription }}>Filter by Course:</span>
          <Select
            placeholder="All Courses"
            allowClear
            style={{ width: 250 }}
            value={selectedClassFilter}
            onChange={setSelectedClassFilter}
            options={classes.map((cls) => ({
              label: `${cls.class_name} (${cls.subject})`,
              value: cls._id || cls.class_id
            }))}
          />
        </div>

        <FeeTable fees={fees} loading={loading} onMarkCashPaid={handleMarkCashPaid} />
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
