import { useEffect, useState, useCallback } from "react";
import { Row, Col, Space } from "antd";
import {
  BookOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import { classAPI } from "../../services/classApi";
import StatCard from "../Common/StatCard";

import dayjs from "dayjs";

import TeacherWelcomeBanner from "./TeacherWelcomeBanner";
import TeacherTodayScheduleCard from "./TeacherTodayScheduleCard";
import TeacherAssignedClassesCard from "./TeacherAssignedClassesCard";
import TeacherSeatUtilizationCard from "./TeacherSeatUtilizationCard";
import TeacherSessionSummaryCard from "./TeacherSessionSummaryCard";

function TeacherDashboardOverview() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  const [assignedClasses, setAssignedClasses] = useState([]);
  const [timetableSessions, setTimetableSessions] = useState([]);
  const [todaySessions, setTodaySessions] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);

  const loadTeacherDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [classesRes, timetableRes] = await Promise.allSettled([
        classAPI.getActiveClasses(),
        classAPI.getTimetable(),
      ]);

      // 1. Assigned Classes
      const classesData =
        classesRes.status === "fulfilled"
          ? classesRes.value.data || classesRes.value
          : [];
      const classList = Array.isArray(classesData) ? classesData : [];
      setAssignedClasses(classList);

      // 2. Timetable Sessions
      const ttData =
        timetableRes.status === "fulfilled"
          ? timetableRes.value.data || timetableRes.value
          : [];
      const sessionsArr = Array.isArray(ttData) ? ttData : [];
      setTimetableSessions(sessionsArr);

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
      console.error("Error loading teacher dashboard overview:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeacherDashboard();
  }, [loadTeacherDashboard]);

  // Derived Metrics
  const totalEnrolledStudents = assignedClasses.reduce(
    (acc, c) => acc + (c.enrolled_count || (c.enrolled_students ? c.enrolled_students.length : 0)),
    0
  );

  const totalMaxCapacity = assignedClasses.reduce(
    (acc, c) => acc + (c.max_students || 0),
    0
  );

  const capacityFillPct =
    totalMaxCapacity > 0
      ? Math.round((totalEnrolledStudents / totalMaxCapacity) * 100)
      : 0;

  const heldSessionsCount = timetableSessions.filter(
    (s) => s.status === "held"
  ).length;

  const statCardsData = [
    {
      title: "Active Classes",
      value: assignedClasses.length.toString(),
      icon: <BookOutlined />,
      color: "#10B981",
    },
    {
      title: "Enrolled Students",
      value: totalEnrolledStudents.toString(),
      icon: <TeamOutlined />,
      color: "#3B82F6",
    },
    {
      title: "Today's Sessions",
      value: todaySessions.length.toString(),
      icon: <ClockCircleOutlined />,
      color: "#F59E0B",
    },
    {
      title: "Sessions Conducted",
      value: heldSessionsCount.toString(),
      icon: <CheckCircleOutlined />,
      color: "#8B5CF6",
    },
    {
      title: "Capacity Filled",
      value: `${capacityFillPct}%`,
      icon: <BarChartOutlined />,
      color: "#EC4899",
    },
  ];

  return (
    <div className="dashboard-content" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Welcome Banner */}
      <TeacherWelcomeBanner user={user} />

      {/* High-Level Stat Cards */}
      <div className="stats-row">
        {statCardsData.map((stat, i) => (
          <StatCard key={i} stat={stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <Row gutter={[20, 20]}>
        {/* Left Column: Today's Schedule & My Assigned Classes */}
        <Col xs={24} lg={15}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <TeacherTodayScheduleCard
              todaySessions={todaySessions}
              upcomingSessions={upcomingSessions}
              loading={loading}
            />

            <TeacherAssignedClassesCard
              assignedClasses={assignedClasses}
            />
          </Space>
        </Col>

        {/* Right Column: Capacity Analytics & Session Summary */}
        <Col xs={24} lg={9}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <TeacherSeatUtilizationCard
              capacityFillPct={capacityFillPct}
              totalEnrolledStudents={totalEnrolledStudents}
              totalMaxCapacity={totalMaxCapacity}
            />

            <TeacherSessionSummaryCard
              heldSessionsCount={heldSessionsCount}
              totalSessionsCount={timetableSessions.length}
            />
          </Space>
        </Col>
      </Row>
    </div>
  );
}

export default TeacherDashboardOverview;
