import React from "react";
import { Typography, Space, theme } from "antd";
import ChildAcademicTrendChart from "./ChildAcademicTrendChart";

const { Title, Text } = Typography;

const ParentAnalyticsView = ({ examResults = [] }) => {
  const { token: themeToken } = theme.useToken();

  return (
    <div className="dashboard-content" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="welcome-section">
        <Title level={3} style={{ margin: 0, color: themeToken.colorText }}>
          Child Performance Analytics & Trend Reports
        </Title>
        <Text type="secondary">
          Visual term-by-term score progression line charts and subject comparison bar charts for your selected child.
        </Text>
      </div>

      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <ChildAcademicTrendChart examResults={examResults} />
      </Space>
    </div>
  );
};

export default ParentAnalyticsView;
