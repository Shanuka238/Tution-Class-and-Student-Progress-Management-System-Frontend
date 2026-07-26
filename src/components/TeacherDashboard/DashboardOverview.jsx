import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  Typography,
  Row,
  Col,
  Tag,
  Progress,
  Spin,
  Space,
  Empty,
  theme,
} from "antd";
import {
  BookOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  BarChartOutlined,
  CalendarOutlined as CalendarIcon,
} from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import { classAPI } from "../../services/classApi";
import StatCard from "../Common/StatCard";
import dayjs from "dayjs";

const { Title, Text } = Typography;

function TeacherDashboardOverview() {
  const { user } = useAuth();
  const { token: themeToken } = theme.useToken();
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
      <Card
        bordered={false}
        style={{
          borderRadius: "16px",
          background: `linear-gradient(135deg, ${themeToken.colorPrimary}15 0%, ${themeToken.colorPrimary}05 100%)`,
          border: `1px solid ${themeToken.colorPrimary}30`,
          boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <Title level={2} style={{ margin: "0 0 4px 0" }}>
              Welcome back, {user?.first_name || "Educator"}! 👨‍🏫
            </Title>
            <Text type="secondary" style={{ fontSize: "15px" }}>
              Here is your active teaching schedule, class student counts, and session metrics.
            </Text>
          </div>
          <Tag color="blue" icon={<CalendarIcon />} style={{ padding: "6px 14px", fontSize: "14px", borderRadius: "8px" }}>
            {dayjs().format("dddd, MMMM D, YYYY")}
          </Tag>
        </div>
      </Card>

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
            {/* Today's Teaching Schedule */}
            <Card
              title={
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <ClockCircleOutlined style={{ color: themeToken.colorPrimary }} />
                  <span>Today's Teaching Schedule ({todaySessions.length})</span>
                </div>
              }
              bordered={false}
              style={{
                borderRadius: "14px",
                border: `1px solid ${themeToken.colorBorderSecondary}`,
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              }}
            >
              {loading ? (
                <div style={{ textAlign: "center", padding: "30px" }}>
                  <Spin size="medium" />
                </div>
              ) : todaySessions.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {todaySessions.map((session) => {
                    const course = session.course_id || {};
                    return (
                      <div
                        key={session._id}
                        style={{
                          padding: "16px",
                          borderRadius: "10px",
                          border: `1px solid ${themeToken.colorBorderSecondary}`,
                          background: themeToken.colorBgContainer,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: "12px",
                        }}
                      >
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "16px", fontWeight: "600", color: themeToken.colorText }}>
                              {course.class_name || "Tuition Class"}
                            </span>
                            <Tag color="purple">Grade {course.grade || "N/A"}</Tag>
                          </div>
                          <div style={{ fontSize: "13px", color: themeToken.colorTextSecondary, marginTop: "4px" }}>
                            Subject: {course.subject || "General"}
                          </div>
                          <div style={{ display: "flex", gap: "16px", marginTop: "8px", fontSize: "12px", color: themeToken.colorTextSecondary }}>
                            <span>
                              <ClockCircleOutlined /> {session.start_time} - {session.end_time}
                            </span>
                            <span>
                              <EnvironmentOutlined /> {session.venue || "Main Room"}
                            </span>
                          </div>
                        </div>
                        <Tag color={session.status === "held" ? "green" : "red"}>
                          {(session.status || "Scheduled").toUpperCase()}
                        </Tag>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <div>
                      <Text type="secondary">No live teaching sessions scheduled for today!</Text>
                      {upcomingSessions.length > 0 && (
                        <div style={{ marginTop: "6px", fontSize: "12px", color: themeToken.colorTextSecondary }}>
                          Next upcoming session: <strong>{upcomingSessions[0]?.course_id?.class_name}</strong> on {dayjs(upcomingSessions[0]?.date).format("MMM D")} ({upcomingSessions[0]?.start_time})
                        </div>
                      )}
                    </div>
                  }
                />
              )}
            </Card>

            {/* Assigned Classes Roster Card */}
            <Card
              title={
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <BookOutlined style={{ color: "#10B981" }} />
                  <span>My Assigned Classes ({assignedClasses.length})</span>
                </div>
              }
              bordered={false}
              style={{
                borderRadius: "14px",
                border: `1px solid ${themeToken.colorBorderSecondary}`,
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              }}
            >
              {assignedClasses.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {assignedClasses.map((item) => {
                    const enrolled = item.enrolled_count || (item.enrolled_students ? item.enrolled_students.length : 0);
                    return (
                      <div
                        key={item._id || item.class_id}
                        style={{
                          padding: "14px 16px",
                          borderRadius: "10px",
                          background: themeToken.colorBgLayout,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: "12px",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: "600", fontSize: "15px" }}>
                            {item.class_name}
                          </div>
                          <div style={{ fontSize: "12px", color: themeToken.colorTextSecondary, marginTop: "2px" }}>
                            {item.subject} • Grade {item.grade}
                          </div>
                          <div style={{ fontSize: "12px", color: themeToken.colorTextSecondary, marginTop: "4px" }}>
                            <CalendarOutlined /> Dates: {item.start_date ? dayjs(item.start_date).format("MMM D, YYYY") : "N/A"} - {item.end_date ? dayjs(item.end_date).format("MMM D, YYYY") : "N/A"}
                          </div>
                        </div>
                        <Tag color="blue" icon={<TeamOutlined />} style={{ padding: "4px 10px", borderRadius: "6px" }}>
                          {enrolled} / {item.max_students} Students Enrolled
                        </Tag>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No active classes assigned to your profile." />
              )}
            </Card>
          </Space>
        </Col>

        {/* Right Column: Capacity Analytics & Session Summary */}
        <Col xs={24} lg={9}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {/* Student Capacity Filled Progress */}
            <Card
              title={
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <TeamOutlined style={{ color: "#3B82F6" }} />
                  <span>Classroom Seat Utilization</span>
                </div>
              }
              bordered={false}
              style={{
                borderRadius: "14px",
                border: `1px solid ${themeToken.colorBorderSecondary}`,
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              }}
            >
              <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <Progress
                  type="dashboard"
                  percent={capacityFillPct}
                  strokeColor="#3B82F6"
                  format={(percent) => `${percent}%`}
                  size={140}
                />
              </div>

              <div
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  background: themeToken.colorBgLayout,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "15px", fontWeight: "600", color: themeToken.colorText }}>
                  {totalEnrolledStudents} / {totalMaxCapacity} Seats Enrolled
                </div>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  Total student enrollment across all your assigned class rosters.
                </Text>
              </div>
            </Card>

            {/* Sessions Summary */}
            <Card
              title={
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <CalendarOutlined style={{ color: "#8B5CF6" }} />
                  <span>Session Summary</span>
                </div>
              }
              bordered={false}
              style={{
                borderRadius: "14px",
                border: `1px solid ${themeToken.colorBorderSecondary}`,
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              }}
            >
              <Row gutter={[12, 12]}>
                <Col span={12}>
                  <div
                    style={{
                      padding: "16px",
                      borderRadius: "10px",
                      background: "rgba(16, 185, 129, 0.08)",
                      border: "1px solid rgba(16, 185, 129, 0.2)",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "20px", fontWeight: "bold", color: "#10B981" }}>
                      {heldSessionsCount}
                    </div>
                    <div style={{ fontSize: "12px", color: "#10B981", fontWeight: "500" }}>
                      Conducted (Held)
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div
                    style={{
                      padding: "16px",
                      borderRadius: "10px",
                      background: "rgba(59, 130, 246, 0.08)",
                      border: "1px solid rgba(59, 130, 246, 0.2)",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "20px", fontWeight: "bold", color: "#3B82F6" }}>
                      {timetableSessions.length}
                    </div>
                    <div style={{ fontSize: "12px", color: "#3B82F6", fontWeight: "500" }}>
                      Total Scheduled
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
}

export default TeacherDashboardOverview;
