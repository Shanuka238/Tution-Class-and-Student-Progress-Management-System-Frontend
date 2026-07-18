import React from "react";
import { Row, Col, Card, Statistic, theme } from "antd";

const FeeStatsCards = ({ stats }) => {
  const { token: themeToken } = theme.useToken();

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
      <Col xs={24} sm={8} md={6}>
        <Card bordered={false} style={{ borderRadius: "12px", background: "rgba(22, 163, 74, 0.08)", border: "1px solid rgba(22, 163, 74, 0.15)" }}>
          <Statistic
            title={<span style={{ color: themeToken.colorTextDescription }}>Total Collections (Paid)</span>}
            value={stats.totalRevenue}
            prefix="LKR "
            valueStyle={{ color: "#16a34a", fontWeight: "bold" }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={8} md={6}>
        <Card bordered={false} style={{ borderRadius: "12px", background: "rgba(37, 99, 235, 0.08)", border: "1px solid rgba(37, 99, 235, 0.15)" }}>
          <Statistic
            title={<span style={{ color: themeToken.colorTextDescription }}>Outstanding Collections</span>}
            value={stats.pendingAmount}
            prefix="LKR "
            valueStyle={{ color: "#2563eb", fontWeight: "bold" }}
          />
        </Card>
      </Col>
      <Col xs={12} sm={4} md={4}>
        <Card bordered={false} style={{ borderRadius: "12px", background: themeToken.colorBgContainer, border: `1px solid ${themeToken.colorBorderSecondary}` }}>
          <Statistic
            title={<span style={{ color: themeToken.colorTextDescription }}>Paid Invoices</span>}
            value={stats.paidCount}
            valueStyle={{ color: themeToken.colorText, fontWeight: "bold" }}
          />
        </Card>
      </Col>
      <Col xs={12} sm={4} md={4}>
        <Card bordered={false} style={{ borderRadius: "12px", background: themeToken.colorBgContainer, border: `1px solid ${themeToken.colorBorderSecondary}` }}>
          <Statistic
            title={<span style={{ color: themeToken.colorTextDescription }}>Unpaid Invoices</span>}
            value={stats.unpaidCount}
            valueStyle={{ color: themeToken.colorText, fontWeight: "bold" }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={8} md={4}>
        <Card bordered={false} style={{ borderRadius: "12px", background: "rgba(220, 38, 38, 0.08)", border: "1px solid rgba(220, 38, 38, 0.15)" }}>
          <Statistic
            title={<span style={{ color: themeToken.colorTextDescription }}>Overdue Invoices</span>}
            value={stats.overdueCount}
            valueStyle={{ color: "#dc2626", fontWeight: "bold" }}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default FeeStatsCards;
