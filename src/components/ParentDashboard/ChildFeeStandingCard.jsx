import { Card, Button, Typography, theme } from "antd";
import {
  CreditCardOutlined,
  WarningOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const ChildFeeStandingCard = ({
  childUser,
  unpaidFees = [],
  totalUnpaidAmount = 0,
  payingFeeId,
  handleInitiatePayHere,
}) => {
  const { token: themeToken } = theme.useToken();

  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <CreditCardOutlined
            style={{ color: unpaidFees.length > 0 ? "#EF4444" : "#10B981" }}
          />
          <span>Child Tuition Fees Standing</span>
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
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#DC2626",
                fontWeight: "600",
              }}
            >
              <WarningOutlined />
              <span>Unpaid Fee Invoice Alert ({unpaidFees.length})</span>
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#DC2626",
                marginTop: "4px",
              }}
            >
              LKR {totalUnpaidAmount.toLocaleString()}
            </div>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              Monthly tuition fees pending for {childUser?.first_name || "your child"}.
            </Text>
          </div>

          <Button
            type="primary"
            danger
            block
            icon={<CreditCardOutlined />}
            loading={payingFeeId === unpaidFees[0]._id}
            onClick={() => handleInitiatePayHere(unpaidFees[0]._id)}
          >
            Pay Online Now (PayHere Gateway)
          </Button>
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
            <div style={{ fontWeight: "600", color: "#10B981" }}>All Tuition Fees Settled</div>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              No outstanding invoices for {childUser?.first_name || "your child"}.
            </Text>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ChildFeeStandingCard;
