import { useEffect, useState, useCallback } from "react";
import { Row, Col, Space } from "antd";
import {
  BookOutlined,
  CheckSquareOutlined,
  DollarOutlined,
  TrophyOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

import { useAuth } from "../../context/AuthContext";
import { attendanceAPI } from "../../services/attendanceApi";
import { classAPI } from "../../services/classApi";
import { feeAPI } from "../../services/feeApi";
import { examAPI } from "../../services/examApi";
import StatCard from "../Common/StatCard";

import dayjs from "dayjs";
import StudentWelcomeBanner from "./StudentWelcomeBanner";
import StudentTodayScheduleCard from "./StudentTodayScheduleCard";
import StudentRecentResultsCard from "./StudentRecentResultsCard";
import StudentFeeStatusCard from "./StudentFeeStatusCard";
import StudentAttendanceRatioCard from "./StudentAttendanceRatioCard";

function StudentDashboardOverview() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [feesList, setFeesList] = useState([]);
  const [examResults, setExamResults] = useState([]);
  const [todaySessions, setTodaySessions] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [classesRes, attendanceRes, feesRes, resultsRes, timetableRes] =
        await Promise.allSettled([
          classAPI.getMyClasses(),
          attendanceAPI.getMyAttendance(),
          feeAPI.getMyFees(),
          examAPI.getMyResults(),
          classAPI.getTimetable(),
        ]);

      const classesData =
        classesRes.status === "fulfilled"
          ? classesRes.value.data || classesRes.value
          : [];
      setEnrolledClasses(Array.isArray(classesData) ? classesData : []);

      const attData =
        attendanceRes.status === "fulfilled"
          ? attendanceRes.value.data || attendanceRes.value
          : [];
      setAttendanceRecords(Array.isArray(attData) ? attData : []);

      const feesData =
        feesRes.status === "fulfilled"
          ? feesRes.value.data || feesRes.value
          : [];
      setFeesList(Array.isArray(feesData) ? feesData : []);

      const resData =
        resultsRes.status === "fulfilled"
          ? resultsRes.value.data || resultsRes.value
          : [];
      setExamResults(Array.isArray(resData) ? resData : []);

      const ttData =
        timetableRes.status === "fulfilled"
          ? timetableRes.value.data || timetableRes.value
          : [];
      const sessionsArr = Array.isArray(ttData) ? ttData : [];

      const todayStr = dayjs().format("YYYY-MM-DD");
      const todayList = [];
      const upcomingList = [];

      sessionsArr.forEach((s) => {
        const sessionDate = dayjs(s.date).format("YYYY-MM-DD");
        if (sessionDate === todayStr) {
          todayList.push(s);
        } else if (dayjs(s.date).isAfter(dayjs(), "day")) {
          upcomingList.push(s);
        }
      });

      setTodaySessions(todayList);
      setUpcomingSessions(upcomingList.slice(0, 4));
    } catch (err) {
      console.error("Error loading student overview dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const totalAttendance = attendanceRecords.length;
  let presentCount = 0;
  let lateCount = 0;
  let absentCount = 0;

  attendanceRecords.forEach((r) => {
    if (r.status === "present") presentCount++;
    else if (r.status === "late") lateCount++;
    else if (r.status === "absent") absentCount++;
  });

  const attendancePct =
    totalAttendance > 0
      ? Math.round(((presentCount + lateCount * 0.5) / totalAttendance) * 100)
      : null;

  const unpaidFees = feesList.filter((f) => f.status !== "paid");
  const totalUnpaidAmount = unpaidFees.reduce((acc, f) => acc + (f.amount || 0), 0);

  const scoredExams = examResults
    .map((r) => {
      const marksVal =
        r.marks_obtained !== undefined && r.marks_obtained !== null
          ? r.marks_obtained
          : r.marks !== undefined && r.marks !== null
          ? r.marks
          : r.score;

      if (marksVal !== undefined && marksVal !== null) {
        return Number(marksVal);
      }

      const gradeMap = { A: 85, B: 75, C: 65, S: 55, F: 35 };
      if (r.grade && gradeMap[r.grade.toUpperCase()]) {
        return gradeMap[r.grade.toUpperCase()];
      }

      return null;
    })
    .filter((m) => m !== null && !isNaN(m));

  const avgExamScore =
    scoredExams.length > 0
      ? Math.round(
          scoredExams.reduce((acc, val) => acc + val, 0) / scoredExams.length
        )
      : null;

  const statCardsData = [
    {
      title: "Enrolled Classes",
      value: enrolledClasses.length > 0 ? enrolledClasses.length.toString() : "—",
      icon: <BookOutlined />,
      color: "#10B981",
    },
    {
      title: "Attendance Rate",
      value: totalAttendance > 0 ? `${attendancePct}%` : "—",
      icon: <CheckSquareOutlined />,
      color: totalAttendance > 0 ? (attendancePct >= 80 ? "#10B981" : "#F59E0B") : "#94A3B8",
    },
    {
      title: "Pending Invoices",
      value: feesList.length === 0 ? "—" : unpaidFees.length > 0 ? `LKR ${totalUnpaidAmount.toLocaleString()}` : "Cleared",
      icon: <DollarOutlined />,
      color: feesList.length === 0 ? "#94A3B8" : unpaidFees.length > 0 ? "#EF4444" : "#10B981",
    },
    {
      title: "Exams Completed",
      value: examResults.length > 0 ? examResults.length.toString() : "—",
      icon: <FileTextOutlined />,
      color: "#3B82F6",
    },
    {
      title: "Average Score",
      value: scoredExams.length > 0 ? `${avgExamScore}%` : "—",
      icon: <TrophyOutlined />,
      color: scoredExams.length > 0 ? "#8B5CF6" : "#94A3B8",
    },
  ];

  return (
    <div className="dashboard-content" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Welcome Banner */}
      <StudentWelcomeBanner user={user} />

      {/* Stat Cards */}
      <div className="stats-row">
        {statCardsData.map((stat, i) => (
          <StatCard key={i} stat={stat} />
        ))}
      </div>

      {/* Main Grid */}
      <Row gutter={[20, 20]}>
        {/* Left Column: Today's Schedule & Recent Exam Results */}
        <Col xs={24} lg={15}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <StudentTodayScheduleCard
              todaySessions={todaySessions}
              upcomingSessions={upcomingSessions}
              loading={loading}
            />

            <StudentRecentResultsCard
              examResults={examResults}
            />
          </Space>
        </Col>

        {/* Right Column: Tuition Fee Status & Attendance Ratio */}
        <Col xs={24} lg={9}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <StudentFeeStatusCard
              unpaidFees={unpaidFees}
              totalUnpaidAmount={totalUnpaidAmount}
            />

            <StudentAttendanceRatioCard
              attendancePct={attendancePct}
              presentCount={presentCount}
              lateCount={lateCount}
              absentCount={absentCount}
              totalAttendance={totalAttendance}
            />
          </Space>
        </Col>
      </Row>
    </div>
  );
}

export default StudentDashboardOverview;
