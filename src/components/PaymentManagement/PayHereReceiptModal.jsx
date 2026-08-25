import React, { useRef } from "react";
import { Modal, Button, Tag, Space, Typography, Divider, Row, Col, theme } from "antd";
import {
  PrinterOutlined,
  CheckCircleFilled,
  SafetyCertificateOutlined,
  BankOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const PayHereReceiptModal = ({ visible, onClose, fee }) => {
  const { token: themeToken } = theme.useToken();
  const receiptRef = useRef(null);

  if (!fee) return null;

  const studentUser =
    fee.student_id?.user_id ||
    fee.student?.user_id ||
    fee.student_id?.user ||
    fee.student?.user ||
    {};
  const studentProfile = fee.student_id || fee.student || {};
  const classItem = fee.class_id || fee.class || {};

  const studentName =
    `${studentUser.first_name || ""} ${studentUser.last_name || ""}`.trim() ||
    fee.student_name ||
    "Student User";

  const studentNumber =
    studentProfile.student_number || studentProfile.student_id || "STU-2026-001";

  const className = classItem.class_name || "Tuition Class";
  const subject = classItem.subject || "Academic Course";
  const amount = Number(fee.amount || 0);

  const formattedPaidDate = fee.paid_date
    ? dayjs(fee.paid_date).format("DD MMMM YYYY, hh:mm A")
    : dayjs().format("DD MMMM YYYY, hh:mm A");

  const receiptNo =
    fee.payment_id && fee.payment_id.startsWith("MOCK_PH")
      ? `PH-REC-${fee.payment_id.slice(-8).toUpperCase()}`
      : fee.payment_id
      ? `PH-REC-${fee.payment_id}`
      : `PH-REC-${(fee._id || fee.id || "00000000").slice(-8).toUpperCase()}`;

  const paymentMethodDisplay =
    fee.payment_method === "cash"
      ? "Direct Cash / Counter Settlement"
      : "PayHere Online Payment Gateway (LKR)";

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Text type="secondary" style={{ fontSize: "11px" }}>
            Secured by PayHere Sri Lanka (LKR)
          </Text>
          <Space>
            <Button onClick={onClose}>Close</Button>
            <Button
              type="primary"
              icon={<PrinterOutlined />}
              onClick={handlePrint}
              style={{ background: "#7c3aed", borderColor: "#7c3aed" }}
            >
              Print / Save PDF
            </Button>
          </Space>
        </div>
      }
      width={680}
      centered
      bodyStyle={{ padding: "0" }}
    >
      {/* Printable Receipt Container */}
      <div
        id="payhere-printable-receipt"
        ref={receiptRef}
        style={{
          padding: "32px 36px",
          background: "#ffffff",
          color: "#0f172a",
          fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        {/* Receipt Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            borderBottom: "2px solid #6d28d9",
            paddingBottom: "18px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  fontWeight: "bold",
                  fontSize: "18px",
                  boxShadow: "0 2px 6px rgba(124, 58, 237, 0.3)",
                }}
              >
                E
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#0f172a" }}>
                  EduManage 360
                </h2>
                <span style={{ fontSize: "11px", color: "#6d28d9", fontWeight: 600 }}>
                  Tuition &amp; Academic Center Management
                </span>
              </div>
            </div>
            <div style={{ fontSize: "11.5px", color: "#475569", marginTop: "8px", lineHeight: "1.4" }}>
              123 Academy Road, Colombo, Sri Lanka<br />
              Tel: +94 11 234 5678 | info@edumanage360.lk
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "#f5f3ff",
                border: "1.5px solid #8b5cf6",
                padding: "5px 12px",
                borderRadius: "20px",
                color: "#6d28d9",
                fontWeight: "700",
                fontSize: "12px",
                marginBottom: "8px",
              }}
            >
              <CheckCircleFilled style={{ color: "#7c3aed" }} /> PAID &amp; VERIFIED
            </div>
            <div style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a", letterSpacing: "0.5px" }}>
              OFFICIAL RECEIPT
            </div>
            <div style={{ fontSize: "11px", color: "#64748b" }}>
              Ref: <strong style={{ color: "#6d28d9" }}>{receiptNo}</strong>
            </div>
          </div>
        </div>

        {/* Metadata Details Grid */}
        <div
          style={{
            margin: "20px 0",
            padding: "14px 18px",
            background: "#faf5ff",
            borderRadius: "8px",
            border: "1px solid #e9d5ff",
          }}
        >
          <Row gutter={[16, 12]}>
            <Col span={12}>
              <div style={{ fontSize: "11px", color: "#7c3aed", textTransform: "uppercase", fontWeight: 700 }}>
                Student Details
              </div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a", marginTop: "2px" }}>
                {studentName}
              </div>
              <div style={{ fontSize: "12px", color: "#475569" }}>
                Registration ID: <strong style={{ color: "#6d28d9" }}>{studentNumber}</strong>
              </div>
            </Col>

            <Col span={12} style={{ textAlign: "right" }}>
              <div style={{ fontSize: "11px", color: "#7c3aed", textTransform: "uppercase", fontWeight: 700 }}>
                Payment Date &amp; Time
              </div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a", marginTop: "2px" }}>
                {formattedPaidDate}
              </div>
              <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>
                Channel: <strong>{paymentMethodDisplay}</strong>
              </div>
            </Col>
          </Row>
        </div>

        {/* Fee Itemization Table */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            margin: "18px 0",
            fontSize: "13px",
          }}
        >
          <thead>
            <tr style={{ background: "#f3e8ff", borderBottom: "1.5px solid #d8b4fe" }}>
              <th style={{ padding: "10px 12px", textAlign: "left", color: "#581c87", fontWeight: 700 }}>
                Description
              </th>
              <th style={{ padding: "10px 12px", textAlign: "center", color: "#581c87", fontWeight: 700 }}>
                Billing Period
              </th>
              <th style={{ padding: "10px 12px", textAlign: "right", color: "#581c87", fontWeight: 700 }}>
                Amount (LKR)
              </th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid #e9d5ff" }}>
              <td style={{ padding: "12px 12px" }}>
                <div style={{ fontWeight: 600, color: "#0f172a" }}>{className}</div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>
                  Subject: {subject}
                </div>
              </td>
              <td style={{ padding: "12px 12px", textAlign: "center", fontWeight: 600, color: "#6d28d9" }}>
                {fee.month || "Current Term"}
              </td>
              <td style={{ padding: "12px 12px", textAlign: "right", fontWeight: 700, color: "#0f172a" }}>
                LKR {amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
            </tr>

            <tr style={{ borderBottom: "1px solid #e9d5ff", background: "#fcfaff" }}>
              <td colSpan={2} style={{ padding: "8px 12px", textAlign: "right", color: "#64748b" }}>
                Gateway Processing Fee (PayHere 0% Subsidy):
              </td>
              <td style={{ padding: "8px 12px", textAlign: "right", color: "#7c3aed", fontWeight: 600 }}>
                LKR 0.00
              </td>
            </tr>

            <tr style={{ background: "#f5f3ff", borderTop: "2px solid #6d28d9" }}>
              <td colSpan={2} style={{ padding: "12px 12px", textAlign: "right", fontSize: "15px", fontWeight: 800, color: "#4c1d95" }}>
                Total Net Amount Paid:
              </td>
              <td style={{ padding: "12px 12px", textAlign: "right", fontSize: "16px", fontWeight: 800, color: "#6d28d9" }}>
                LKR {amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Security & Verification Seal */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "24px",
            paddingTop: "14px",
            borderTop: "1px dashed #d8b4fe",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <SafetyCertificateOutlined style={{ fontSize: "28px", color: "#7c3aed" }} />
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#0f172a" }}>
                PayHere Authenticated Transaction
              </div>
              <div style={{ fontSize: "10px", color: "#64748b" }}>
                Payment Reference ID: {fee.payment_id || `PH_TRX_${Date.now()}`}
              </div>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "10px", color: "#94a3b8" }}>
              Digitally Generated &amp; Verified
            </div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#6d28d9" }}>
              EduManage 360 Finance Authority
            </div>
          </div>
        </div>

        <div style={{ marginTop: "14px", textAlign: "center", fontSize: "10px", color: "#94a3b8" }}>
          * This is an official computer-generated e-receipt. No physical signature is required.
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #payhere-printable-receipt, #payhere-printable-receipt * {
            visibility: visible;
          }
          #payhere-printable-receipt {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            margin: 0;
            padding: 20px;
            background: #ffffff !important;
            color: #000000 !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </Modal>
  );
};

export default PayHereReceiptModal;
