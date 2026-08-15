import React, { useEffect, useState, useCallback } from "react";
import { Card, Typography, Spin, Space, theme } from "antd";
import { classAPI } from "../../services/classApi";
import { feeAPI } from "../../services/feeApi";
import { attendanceAPI } from "../../services/attendanceApi";
import AdminRevenueChart from "./AdminRevenueChart";
import AdminEnrollmentAttendanceChart from "./AdminEnrollmentAttendanceChart";

const { Title, Text } = Typography;

const AdminAnalyticsView = () => {
  const { token: themeToken } = theme.useToken();
  const [loading, setLoading] = useState(true);
  const [classList, setClassList] = useState([]);
  const [feesData, setFeesData] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);

  const loadMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const [classesRes, feesRes, attendanceRes] = await Promise.allSettled([
        classAPI.getActiveClasses(),
        feeAPI.getAllFees(),
        attendanceAPI.getAllAttendance(),
      ]);

      const cData = classesRes.status === "fulfilled" ? classesRes.value.data || classesRes.value : [];
      setClassList(Array.isArray(cData) ? cData : []);

      const fData = feesRes.status === "fulfilled" ? feesRes.value.data || feesRes.value : [];
      setFeesData(Array.isArray(fData) ? fData : []);

      const aData = attendanceRes.status === "fulfilled" ? attendanceRes.value.data || attendanceRes.value : [];
      setAttendanceLogs(Array.isArray(aData) ? aData : []);
    } catch (err) {
      console.error("Error loading admin analytics:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  return (
    <div className="dashboard-content" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="welcome-section">
        <Title level={3} style={{ margin: 0, color: themeToken.colorText }}>
          Performance & Financial Analytics
        </Title>
        <Text type="secondary">
          System-wide revenue collection reports, fee status distribution, student grade capacity, and attendance trends.
        </Text>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
        </div>
      ) : (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <AdminRevenueChart feesList={feesData} />
          <AdminEnrollmentAttendanceChart classList={classList} attendanceLogs={attendanceLogs} />
        </Space>
      )}
    </div>
  );
};

export default AdminAnalyticsView;
