import React, { useEffect, useState, useCallback } from "react";
import { Typography, Space, Spin, theme } from "antd";
import { classAPI } from "../../services/classApi";
import { examAPI } from "../../services/examApi";
import { attendanceAPI } from "../../services/attendanceApi";
import TeacherAttendanceAnalyticsChart from "./TeacherAttendanceAnalyticsChart";
import TeacherExamPerformanceChart from "./TeacherExamPerformanceChart";
import TeacherStudentPerformanceCard from "./TeacherStudentPerformanceCard";

const { Title, Text } = Typography;

const TeacherAnalyticsView = () => {
  const { token: themeToken } = theme.useToken();
  const [loading, setLoading] = useState(true);
  const [examResults, setExamResults] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);

  const loadTeacherData = useCallback(async () => {
    setLoading(true);
    try {
      const classesRes = await classAPI.getActiveClasses();
      const myClasses = classesRes.data || classesRes || [];
      const classList = Array.isArray(myClasses) ? myClasses : [];

      if (classList.length > 0) {
        // Fetch Attendance Registers
        const attendancePromises = classList.map((cls) => attendanceAPI.getAttendanceRegister(cls._id));
        const attendanceSettled = await Promise.allSettled(attendancePromises);
        let allAttendanceLogs = [];
        attendanceSettled.forEach((res) => {
          if (res.status === "fulfilled") {
            const data = res.value.data || res.value || {};
            const list = data.attendance || (Array.isArray(data) ? data : []);
            if (Array.isArray(list)) allAttendanceLogs.push(...list);
          }
        });
        setAttendanceLogs(allAttendanceLogs);

        // Fetch Exam Results
        const examPromises = classList.map((cls) => examAPI.getExamsByClass(cls._id));
        const examSettled = await Promise.allSettled(examPromises);
        let allExams = [];
        examSettled.forEach((res) => {
          if (res.status === "fulfilled") {
            const list = res.value.data || res.value || [];
            if (Array.isArray(list)) allExams.push(...list);
          }
        });

        if (allExams.length > 0) {
          const resultPromises = allExams.map((ex) => examAPI.getResultsByExam(ex._id));
          const resultSettled = await Promise.allSettled(resultPromises);
          let combinedResults = [];
          resultSettled.forEach((res) => {
            if (res.status === "fulfilled") {
              const list = res.value.data || res.value || [];
              if (Array.isArray(list)) combinedResults.push(...list);
            }
          });
          setExamResults(combinedResults);
        }
      }
    } catch (err) {
      console.error("Error loading teacher analytics data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeacherData();
  }, [loadTeacherData]);

  return (
    <div className="dashboard-content" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="welcome-section">
        <Title level={3} style={{ margin: 0, color: themeToken.colorText }}>
          Class Performance & Attendance Analytics
        </Title>
        <Text type="secondary">
          Detailed visual trend reports for class attendance ratios, pass vs fail distributions, and average exam scores.
        </Text>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
        </div>
      ) : (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <TeacherAttendanceAnalyticsChart attendanceLogs={attendanceLogs} />
          <TeacherExamPerformanceChart examResults={examResults} />
          <TeacherStudentPerformanceCard examResults={examResults} />
        </Space>
      )}
    </div>
  );
};

export default TeacherAnalyticsView;
