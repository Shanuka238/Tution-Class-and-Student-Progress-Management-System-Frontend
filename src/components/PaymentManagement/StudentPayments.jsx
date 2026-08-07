import React, { useState, useEffect, useCallback } from "react";
import { Card, Typography, message, theme } from "antd";
import { feeAPI } from "../../services/feeApi";
import PaymentStatsCards from "./PaymentStatsCards";
import PaymentTable from "./PaymentTable";
import { launchPayHereCheckout } from "../../utils/paymentUtils";
import { formatDate } from "../../utils/dateUtils";

const { Title, Text } = Typography;

const StudentPayments = () => {
  const { token: themeToken } = theme.useToken();
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStudentFees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await feeAPI.getMyFees();
      setFees(res.data || res);
    } catch (err) {
      console.error("Error fetching fees history:", err);
      message.error("Failed to load fee invoices history");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudentFees();

    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get("payment");
    const returnedFeeId = urlParams.get("fee_id");

    if (paymentStatus === "success" && returnedFeeId) {
      const confirmPaymentLocally = async () => {
        try {
          await feeAPI.mockPayHereSuccess(returnedFeeId);
          message.success("Online payment verified successfully!");
          fetchStudentFees();
        } catch (err) {
          console.error("Payment synchronization failure:", err);
          message.error("Failed to automatically synchronize payment record");
        }
      };
      confirmPaymentLocally();

      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [fetchStudentFees]);

  const handleInitiatePayHere = async (feeRecord) => {
    try {
      const targetFeeId =
        typeof feeRecord === "object"
          ? feeRecord._id || feeRecord.fee_id || feeRecord.id
          : feeRecord;
      if (!targetFeeId) {
        throw new Error("Invalid fee record ID");
      }
      const res = await feeAPI.initiatePayHere(targetFeeId);
      launchPayHereCheckout(res.data || res);
    } catch (err) {
      console.error("Error launching PayHere gateway:", err);
      message.error(err.message || "Failed to initiate online checkout");
    }
  };

  const unpaidList = fees.filter((f) => f.status !== "paid");
  const totalUnpaidAmount = unpaidList.reduce((acc, f) => acc + (f.amount || 0), 0);
  const sortedUnpaid = [...unpaidList].sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  const nextDueDate = sortedUnpaid.length > 0
    ? formatDate(sortedUnpaid[0].due_date)
    : "No Pending Invoices";

  return (
    <div className="dashboard-content">
      <div className="welcome-section" style={{ marginBottom: "24px" }}>
        <Title level={3} style={{ margin: 0, color: themeToken.colorText }}>My Tuition Fees & Payments</Title>
        <Text type="secondary">View invoices, complete secure payments via PayHere, and retrieve digital PDF payment receipts.</Text>
      </div>

      <PaymentStatsCards
        totalUnpaidAmount={totalUnpaidAmount}
        unpaidCount={unpaidList.length}
        nextDueDate={nextDueDate}
      />

      <Card
        bordered={false}
        style={{
          borderRadius: "12px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
          border: `1px solid ${themeToken.colorBorderSecondary}`,
          background: themeToken.colorBgContainer,
        }}
      >
        <PaymentTable fees={fees} loading={loading} onPay={handleInitiatePayHere} />
      </Card>
    </div>
  );
};

export default StudentPayments;
