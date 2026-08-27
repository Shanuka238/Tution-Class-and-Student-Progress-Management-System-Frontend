import { Card, Button, Typography, Tag, theme } from "antd";
import {
  CreditCardOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

const ChildFeeStandingCard = ({
  childUser,
  unpaidFees = [],
  totalUnpaidAmount = 0,
  payingFeeId,
  handleInitiatePayHere,
}) => {
  const { token: themeToken } = theme.useToken();

  const overdueFees = unpaidFees.filter(
    (f) => f.status === "overdue" || (f.due_date && dayjs(f.due_date).isBefore(dayjs().startOf("day")))
  );
  const hasOverdue = overdueFees.length > 0;

  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CreditCardOutlined
              style={{ color: hasOverdue ? "#EF4444" : unpaidFees.length > 0 ? "#F59E0B" : "#10B981" }}
            />
            <span>Child Tuition Fee Standing</span>
          </div>
          {hasOverdue && (
            <Tag color="error" icon={<ClockCircleOutlined />}>
              Payment Overdue
            </Tag>
          )}
        </div>
      }
      bordered={false}
      style={{
        borderRadius: "14px",
        border: `1px solid ${themeToken.colorBorderSecondary}`,
        borderLeft: `4px solid ${hasOverdue ? "#EF4444" : unpaidFees.length > 0 ? "#F59E0B" : "#10B981"}`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
      }}
    >
      {unpaidFees.length > 0 ? (
        <div
          style={{
            padding: "16px",
            borderRadius: "10px",
            background: hasOverdue ? "rgba(239, 68, 68, 0.08)" : "rgba(245, 158, 11, 0.08)",
            border: `1px solid ${hasOverdue ? "rgba(239, 68, 68, 0.25)" : "rgba(245, 158, 11, 0.25)"}`,
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
                color: hasOverdue ? "#DC2626" : "#D97706",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              <WarningOutlined />
              <span>
                {hasOverdue
                  ? `Payment Overdue Warning (${overdueFees.length} invoice${overdueFees.length > 1 ? "s" : ""})`
                  : `Unpaid Fee Invoice (${unpaidFees.length})`}
              </span>
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: hasOverdue ? "#DC2626" : "#D97706",
                marginTop: "4px",
              }}
            >
              LKR {totalUnpaidAmount.toLocaleString()}
            </div>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {hasOverdue
                ? `Immediate payment required for ${childUser?.first_name || "your child"}.`
                : `Monthly tuition fee pending for ${childUser?.first_name || "your child"}.`}
            </Text>

            {/* Invoices summary */}
            <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
              {unpaidFees.map((fee) => {
                const feeOverdue = fee.status === "overdue" || (fee.due_date && dayjs(fee.due_date).isBefore(dayjs().startOf("day")));
                return (
                  <div
                    key={fee._id || fee.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "12px",
                      padding: "4px 8px",
                      background: "rgba(255, 255, 255, 0.5)",
                      borderRadius: "6px",
                    }}
                  >
                    <span>
                      <strong>{fee.month}</strong> — LKR {(fee.amount || 0).toLocaleString()}
                    </span>
                    <span style={{ color: feeOverdue ? "#EF4444" : "#6B7280" }}>
                      {feeOverdue ? "Overdue: " : "Due: "}
                      {fee.due_date ? dayjs(fee.due_date).format("MMM DD, YYYY") : "N/A"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <Button
            type="primary"
            danger
            block
            icon={<CreditCardOutlined />}
            loading={payingFeeId === unpaidFees[0]._id}
            onClick={() => handleInitiatePayHere(unpaidFees[0]._id)}
            style={{ marginTop: "4px" }}
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
