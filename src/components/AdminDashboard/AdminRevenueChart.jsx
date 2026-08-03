import React from "react";
import { Card, Row, Col, Typography, theme } from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { aggregateMonthlyRevenue, aggregateFeeStatusBreakdown } from "../../utils/chartUtils";

const { Text } = Typography;

const AdminRevenueChart = ({ feesList = [] }) => {
  const { token: themeToken } = theme.useToken();
  const revenueData = aggregateMonthlyRevenue(feesList);
  const statusData = aggregateFeeStatusBreakdown(feesList);

  return (
    <Row gutter={[20, 20]}>
      <Col xs={24} lg={15}>
        <Card
          title="Monthly Fee Revenue Collection (LKR)"
          bordered={false}
          style={{
            borderRadius: "14px",
            border: `1px solid ${themeToken.colorBorderSecondary}`,
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={revenueData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={themeToken.colorBorderSecondary} />
                <XAxis dataKey="month" stroke={themeToken.colorTextSecondary} fontSize={12} />
                <YAxis stroke={themeToken.colorTextSecondary} fontSize={12} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: themeToken.colorBgContainer,
                    borderColor: themeToken.colorBorderSecondary,
                    borderRadius: "8px",
                  }}
                  formatter={(val) => [`LKR ${val.toLocaleString()}`, "Collected Revenue"]}
                />
                <Bar dataKey="revenue" fill={themeToken.colorPrimary} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </Col>

      <Col xs={24} lg={9}>
        <Card
          title="Fee Payment Status Breakdown"
          bordered={false}
          style={{
            borderRadius: "14px",
            border: `1px solid ${themeToken.colorBorderSecondary}`,
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: themeToken.colorBgContainer,
                    borderColor: themeToken.colorBorderSecondary,
                    borderRadius: "8px",
                  }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default AdminRevenueChart;
