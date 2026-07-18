import React, { useState, useEffect, useCallback } from "react";
import { Card, Typography, message, theme } from "antd";
import { feeAPI } from "../../services/feeApi";
import PaymentStatsCards from "./PaymentStatsCards";
import PaymentTable from "./PaymentTable";
import dayjs from "dayjs";

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
          console.error("Local webhook simulation failure:", err);
          message.error("Failed to automatically synchronize payment record");
        }
      };
      confirmPaymentLocally();

      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [fetchStudentFees]);

  const handleRealPayHereRedirect = (params) => {
    if (!params) return;
    
    const isSandbox = params.is_sandbox;
    const gatewayUrl = isSandbox
      ? "https://sandbox.payhere.lk/pay/checkout"
      : "https://www.payhere.lk/pay/checkout";

    const form = document.createElement("form");
    form.setAttribute("method", "post");
    form.setAttribute("action", gatewayUrl);
    
    const skipKeys = ["fee_id", "is_sandbox"];
    Object.keys(params).forEach(key => {
      if (skipKeys.includes(key)) return;
      const input = document.createElement("input");
      input.setAttribute("type", "hidden");
      input.setAttribute("name", key);
      input.setAttribute("value", params[key]);
      form.appendChild(input);
    });
    
    const extraParams = {
      phone: "0771234567",
      address: "No. 12, Main Street",
      city: "Colombo",
      country: "Sri Lanka"
    };

    Object.keys(extraParams).forEach(key => {
      const input = document.createElement("input");
      input.setAttribute("type", "hidden");
      input.setAttribute("name", key);
      input.setAttribute("value", extraParams[key]);
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };

  const handleInitiatePayHere = async (feeRecord) => {
    try {
      const res = await feeAPI.initiatePayHere(feeRecord.fee_id || feeRecord._id || feeRecord.id);
      const params = res.data || res;
      handleRealPayHereRedirect(params);
    } catch (err) {
      message.error(err.message || "Failed to initiate online PayHere transaction");
    }
  };

  const unpaidList = fees.filter(f => f.status !== "paid");
  const totalUnpaidAmount = unpaidList.reduce((acc, f) => acc + f.amount, 0);
  const nextDueDate = unpaidList.length > 0 
    ? dayjs(unpaidList.sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0].due_date).format("MMM DD, YYYY")
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
          background: themeToken.colorBgContainer
        }}
      >
        <PaymentTable fees={fees} loading={loading} onPay={handleInitiatePayHere} />
      </Card>
    </div>
  );
};

export default StudentPayments;
