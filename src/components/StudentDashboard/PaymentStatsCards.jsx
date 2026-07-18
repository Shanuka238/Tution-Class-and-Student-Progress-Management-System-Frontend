import React from "react";
import { Row, Col, Card, Statistic, theme } from "antd";

const PaymentStatsCards = ({ totalUnpaidAmount, unpaidCount, nextDueDate }) => {
  const { token: themeToken } = theme.useToken();

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
      <Col xs={24} sm={8}>
        <Card bordered={false} style={{ borderRadius: "12px", background: "rgba(220, 38, 38, 0.08)", border: "1px solid rgba(220, 38, 38, 0.15)" }}>
          <Statistic
            title={<span style={{ color: themeToken.colorTextDescription }}>Total Outstanding Dues</span>}
            value={totalUnpaidAmount}
            prefix="LKR "
            valueStyle={{ color: "#dc2626", fontWeight: "bold" }}
          />
        </Card>
      </Col>
      <Col xs={12} sm={8}>
        <Card bordered={false} style={{ borderRadius: "12px", background: themeToken.colorBgContainer, border: `1px solid ${themeToken.colorBorderSecondary}` }}>
          <Statistic
            title={<span style={{ color: themeToken.colorTextDescription }}>Pending Invoices</span>}
            value={unpaidCount}
            valueStyle={{ color: themeToken.colorText, fontWeight: "bold" }}
          />
        </Card>
      </Col>
      <Col xs={12} sm={8}>
        <Card bordered={false} style={{ borderRadius: "12px", background: "rgba(22, 163, 74, 0.08)", border: "1px solid rgba(22, 163, 74, 0.15)" }}>
          <Statistic
            title={<span style={{ color: themeToken.colorTextDescription }}>Next Due Date</span>}
            value={nextDueDate}
            valueStyle={{
              color: unpaidCount > 0 ? "#16a34a" : themeToken.colorTextDescription,
              fontSize: unpaidCount > 0 ? "24px" : "18px",
              fontWeight: "bold"
            }}
            formatter={(value) => value}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default PaymentStatsCards;
