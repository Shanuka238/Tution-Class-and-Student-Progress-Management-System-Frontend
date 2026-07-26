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
  CheckSquareOutlined,
  DollarOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  UserOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CalendarOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import { attendanceAPI } from "../../services/attendanceApi";
import { classAPI } from "../../services/classApi";
import { feeAPI } from "../../services/feeApi";
import { examAPI } from "../../services/examApi";
import StatCard from "../Common/StatCard";
import dayjs from "dayjs";

const { Title, Text } = Typography;

function StudentDashboardOverview() {
  const { user } = useAuth();
  const { token: themeToken } = theme.useToken();
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
      : 100;

  const unpaidFees = feesList.filter((f) => f.status !== "paid");
  const totalUnpaidAmount = unpaidFees.reduce((acc, f) => acc + (f.amount || 0), 0);

  const scoredExams = examResults.filter(
    (r) => r.marks !== undefined && r.marks !== null
  );
  const avgExamScore =
    scoredExams.length > 0
      ? Math.round(
          scoredExams.reduce((acc, r) => acc + (r.marks || 0), 0) /
            scoredExams.length
        )
      : 0;

  const statCardsData = [
    {
      title: "Enrolled Classes",
      value: enrolledClasses.length.toString(),
      icon: <BookOutlined />,
      color: "#10B981",
    },
    {
      title: "Attendance Rate",
      value: `${attendancePct}%`,
      icon: <CheckSquareOutlined />,
      color: attendancePct >= 80 ? "#10B981" : "#F59E0B",
    },
    {
      title: "Pending Invoices",
      value: unpaidFees.length > 0 ? `LKR ${totalUnpaidAmount.toLocaleString()}` : "Cleared",
      icon: <DollarOutlined />,
      color: unpaidFees.length > 0 ? "#EF4444" : "#10B981",
    },
    {
      title: "Exams Completed",
      value: examResults.length.toString(),
      icon: <FileTextOutlined />,
      color: "#3B82F6",
    },
    {
      title: "Average Score",
      value: scoredExams.length > 0 ? `${avgExamScore}%` : "—",
      icon: <TrophyOutlined />,
      color: "#8B5CF6",
    },
  ];

  const getGradeColor = (grade) => {
    switch (grade) {
      case "A": return "green";
      case "B": return "blue";
      case "C": return "orange";
      case "S": return "warning";
      case "F": return "red";
      default: return "default";
    }
  };

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
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <Title level={2} style={{ margin: 0 }}>
                Welcome back, {user?.first_name || "Student"}! 👋
              </Title>
            </div>
            <Text type="secondary" style={{ fontSize: "15px" }}>
              Here is your active learning schedule, attendance metrics, and fee summary for today.
            </Text>
          </div>
          <Tag color="blue" icon={<CalendarOutlined />} style={{ padding: "6px 14px", fontSize: "14px", borderRadius: "8px" }}>
            {dayjs().format("dddd, MMMM D, YYYY")}
          </Tag>
        </div>
      </Card>

      <div className="stats-row">
        {statCardsData.map((stat, i) => (
          <StatCard key={i} stat={stat} />
        ))}
      </div>

      <Row gutter={[20, 20]}>
        <Col xs={24} lg={15}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Card
              title={
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <ClockCircleOutlined style={{ color: themeToken.colorPrimary }} />
                  <span>Today's Class Schedule ({todaySessions.length})</span>
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
                    const teacher = session.teacher_id?.user_id;
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
                          <div style={{ fontSize: "16px", fontWeight: "600", color: themeToken.colorText }}>
                            {course.class_name || "Tuition Class"}
                          </div>
                          <div style={{ fontSize: "13px", color: themeToken.colorTextSecondary, marginTop: "2px" }}>
                            {course.subject} • Grade {course.grade}
                          </div>
                          <div style={{ display: "flex", gap: "16px", marginTop: "8px", fontSize: "12px", color: themeToken.colorTextSecondary }}>
                            <span>
                              <ClockCircleOutlined /> {session.start_time} - {session.end_time}
                            </span>
                            <span>
                              <EnvironmentOutlined /> {session.venue || "Main Hall"}
                            </span>
                            {teacher && (
                              <span>
                                <UserOutlined /> {teacher.first_name} {teacher.last_name}
                              </span>
                            )}
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
                      <Text type="secondary">No live class sessions scheduled for today!</Text>
                      {upcomingSessions.length > 0 && (
                        <div style={{ marginTop: "6px", fontSize: "12px", color: themeToken.colorTextSecondary }}>
                          Next upcoming: <strong>{upcomingSessions[0]?.course_id?.class_name}</strong> on {dayjs(upcomingSessions[0]?.date).format("MMM D")}
                        </div>
                      )}
                    </div>
                  }
                />
              )}
            </Card>

            <Card
              title={
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <TrophyOutlined style={{ color: "#8B5CF6" }} />
                  <span>Recent Exam Results</span>
                </div>
              }
              bordered={false}
              style={{
                borderRadius: "14px",
                border: `1px solid ${themeToken.colorBorderSecondary}`,
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              }}
            >
              {examResults.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {examResults.slice(0, 4).map((item) => {
                    const exam = item.exam_id || {};
                    const cls = exam.class_id || {};
                    return (
                      <div
                        key={item._id}
                        style={{
                          padding: "12px 16px",
                          borderRadius: "8px",
                          background: themeToken.colorBgLayout,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: "600", fontSize: "14px" }}>
                            {exam.title || cls.class_name || "Class Exam"}
                          </div>
                          <div style={{ fontSize: "12px", color: themeToken.colorTextSecondary }}>
                            {cls.subject || "Subject"} • Score: {item.marks !== undefined ? `${item.marks}/100` : "N/A"}
                          </div>
                        </div>
                        <Tag color={getGradeColor(item.grade)} style={{ fontWeight: "bold", padding: "4px 10px" }}>
                          Grade {item.grade || "N/A"}
                        </Tag>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No exam results published yet." />
              )}
            </Card>
          </Space>
        </Col>

        <Col xs={24} lg={9}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Card
              title={
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <DollarOutlined style={{ color: unpaidFees.length > 0 ? "#EF4444" : "#10B981" }} />
                  <span>Tuition Fee Status</span>
                </div>
              }
              bordered={false}
              style={{
                borderRadius: "14px",
                border: `1px solid ${themeToken.colorBorderSecondary}`,
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              }}
            >
              {unpaidFees.length > 0 ? (
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "10px",
                    background: "rgba(239, 68, 68, 0.08)",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#DC2626", fontWeight: "600", marginBottom: "4px" }}>
                    <WarningOutlined />
                    <span>Unpaid Invoices Pending</span>
                  </div>
                  <div style={{ fontSize: "22px", fontWeight: "bold", color: "#DC2626" }}>
                    LKR {totalUnpaidAmount.toLocaleString()}
                  </div>
                  <Text type="secondary" style={{ fontSize: "12px", display: "block", marginTop: "4px" }}>
                    You have {unpaidFees.length} pending fee invoice(s). Please clear them via PayHere Online.
                  </Text>
                </div>
              ) : (
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "10px",
                    background: "rgba(16, 185, 129, 0.08)",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <CheckCircleOutlined style={{ fontSize: "28px", color: "#10B981" }} />
                  <div>
                    <div style={{ fontWeight: "600", color: "#10B981" }}>All Fees Up to Date</div>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      No pending dues for your enrolled classes.
                    </Text>
                  </div>
                </div>
              )}
            </Card>

            <Card
              title={
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <CheckSquareOutlined style={{ color: "#F59E0B" }} />
                  <span>Attendance Analytics</span>
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
                  percent={attendancePct}
                  strokeColor={attendancePct >= 80 ? "#10B981" : "#F59E0B"}
                  format={(percent) => `${percent}%`}
                  size={140}
                />
              </div>

              <Row gutter={[8, 8]} style={{ textAlign: "center" }}>
                <Col span={8}>
                  <div style={{ background: themeToken.colorBgLayout, padding: "8px", borderRadius: "8px" }}>
                    <div style={{ fontWeight: "bold", color: "#10B981" }}>{presentCount}</div>
                    <div style={{ fontSize: "11px", color: themeToken.colorTextSecondary }}>Present</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ background: themeToken.colorBgLayout, padding: "8px", borderRadius: "8px" }}>
                    <div style={{ fontWeight: "bold", color: "#F59E0B" }}>{lateCount}</div>
                    <div style={{ fontSize: "11px", color: themeToken.colorTextSecondary }}>Late</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ background: themeToken.colorBgLayout, padding: "8px", borderRadius: "8px" }}>
                    <div style={{ fontWeight: "bold", color: "#EF4444" }}>{absentCount}</div>
                    <div style={{ fontSize: "11px", color: themeToken.colorTextSecondary }}>Absent</div>
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

export default StudentDashboardOverview;
