import React, { useEffect, useState, useCallback } from "react";
import { Typography, Space, Spin, theme } from "antd";
import { examAPI } from "../../services/examApi";
import StudentPerformanceTrendChart from "./StudentPerformanceTrendChart";

const { Title, Text } = Typography;

const StudentAnalyticsView = () => {
  const { token: themeToken } = theme.useToken();
  const [loading, setLoading] = useState(true);
  const [examResults, setExamResults] = useState([]);

  const loadStudentResults = useCallback(async () => {
    setLoading(true);
    try {
      const res = await examAPI.getMyResults();
      const data = res.data || res;
      setExamResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading student exam results:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudentResults();
  }, [loadStudentResults]);

  return (
    <div className="dashboard-content" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="welcome-section">
        <Title level={3} style={{ margin: 0, color: themeToken.colorText }}>
          My Performance Analytics & Score Trends
        </Title>
        <Text type="secondary">
          Track your marks over time across academic terms and compare performance across enrolled subjects.
        </Text>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
        </div>
      ) : (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <StudentPerformanceTrendChart examResults={examResults} />
        </Space>
      )}
    </div>
  );
};

export default StudentAnalyticsView;
