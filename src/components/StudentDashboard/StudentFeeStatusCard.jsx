import { Card, Typography, theme } from "antd";
import { DollarOutlined, WarningOutlined, CheckCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;

const StudentFeeStatusCard = ({ unpaidFees = [], totalUnpaidAmount = 0 }) => {
  const { token: themeToken } = theme.useToken();

  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <DollarOutlined style={{ color: unpaidFees.length > 0 ? "#EF4444" : "#10B981" }} />
          <span>Tuition Fee Status</span>
        </div>
      }
      bordered={false}
      style={{
        borderRadius: "14px",
        border: `1px solid ${themeToken.colorBorderSecondary}`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
      }}
    >
      {unpaidFees.length > 0 ? (
        <div
          style={{
            padding: "16px",
            borderRadius: "10px",
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#DC2626", fontWeight: "600", marginBottom: "4px" }}>
            <WarningOutlined />
            <span>Unpaid Invoices Pending</span>
          </div>
          <div style={{ fontSize: "22px", fontWeight: "bold", color: "#DC2626" }}>
            LKR {totalUnpaidAmount.toLocaleString()}
          </div>
          <Text type="secondary" style={{ fontSize: "12px", display: "block", marginTop: "4px" }}>
            You have {unpaidFees.length} pending fee invoice(s). Please clear them via PayHere Online.
          </Text>
        </div>
      ) : (
        <div
          style={{
            padding: "16px",
            borderRadius: "10px",
            background: "rgba(16, 185, 129, 0.08)",
            border: "1px solid rgba(16, 185, 129, 0.2)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <CheckCircleOutlined style={{ fontSize: "28px", color: "#10B981" }} />
          <div>
            <div style={{ fontWeight: "600", color: "#10B981" }}>All Invoices Settled</div>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              No outstanding tuition fee balances on your account.
            </Text>
          </div>
        </div>
      )}
    </Card>
  );
};

export default StudentFeeStatusCard;
