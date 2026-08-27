import { useEffect, useState, useCallback } from "react";
import { Card, Typography, Row, Col, Tag, Spin, Space, Progress, theme } from "antd";
import {
  TeamOutlined,
  BookOutlined,
  DollarOutlined,
  CalendarOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import { adminAPI } from "../../services/adminApi";
import { classAPI } from "../../services/classApi";
import { feeAPI } from "../../services/feeApi";
import { examAPI } from "../../services/examApi";
import StatCard from "../Common/StatCard";
import dayjs from "dayjs";
import { getRoleColor } from "../../utils/roleHelper";
import AdminTodaySessionsCard from "./AdminTodaySessionsCard";

const { Title, Text } = Typography;

function AdminDashboardOverview() {
  const { user } = useAuth();
  const { token: themeToken } = theme.useToken();
  const [loading, setLoading] = useState(true);

  const [usersList, setUsersList] = useState([]);
  const [classList, setClassList] = useState([]);
  const [feesData, setFeesData] = useState([]);
  const [examsList, setExamsList] = useState([]);
  const [todaySessions, setTodaySessions] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);

  const loadAdminMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, classesRes, feesRes, examsRes, timetableRes] = await Promise.allSettled([
        adminAPI.getAllUsers(),
        classAPI.getActiveClasses(),
        feeAPI.getAllFees(),
        examAPI.getMyResults ? examAPI.getMyResults() : Promise.resolve([]),
        classAPI.getTimetable(),
      ]);

      const uData = usersRes.status === "fulfilled" ? usersRes.value.data || usersRes.value : [];
      setUsersList(Array.isArray(uData) ? uData : []);

      const cData = classesRes.status === "fulfilled" ? classesRes.value.data || classesRes.value : [];
      setClassList(Array.isArray(cData) ? cData : []);

      const fData = feesRes.status === "fulfilled" ? feesRes.value.data || feesRes.value : [];
      setFeesData(Array.isArray(fData) ? fData : []);

      const eData = examsRes.status === "fulfilled" ? examsRes.value.data || examsRes.value : [];
      setExamsList(Array.isArray(eData) ? eData : []);

      // Timetable & Live Sessions
      const ttData = timetableRes.status === "fulfilled" ? timetableRes.value.data || timetableRes.value : [];
      const sessionsArr = Array.isArray(ttData) ? ttData : [];

      const todayStr = dayjs().format("YYYY-MM-DD");
      const todayList = [];
      const upcomingList = [];

      sessionsArr.forEach((s) => {
        const sessionDate = s.date ? dayjs(s.date).format("YYYY-MM-DD") : null;
        if (sessionDate === todayStr) {
          todayList.push(s);
        } else if (s.date && dayjs(s.date).isAfter(dayjs(), "day")) {
          upcomingList.push(s);
        }
      });

      // Sort today's sessions by start time
      todayList.sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""));
      upcomingList.sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));

      setTodaySessions(todayList);
      setUpcomingSessions(upcomingList.slice(0, 5));
    } catch (err) {
      console.error("Error loading admin dashboard metrics:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminMetrics();
  }, [loadAdminMetrics]);

  const studentCount = usersList.filter((u) => u.user?.role === "student" || u.role === "student").length;
  const teacherCount = usersList.filter((u) => u.user?.role === "teacher" || u.role === "teacher").length;
  const parentCount = usersList.filter((u) => u.user?.role === "parent" || u.role === "parent").length;
  const adminCount = usersList.filter((u) => u.user?.role === "admin" || u.role === "admin").length;

  const totalUsers = usersList.length;

  const paidFees = feesData.filter((f) => f.status === "paid");
  const totalCollected = paidFees.reduce((acc, f) => acc + (f.amount || 0), 0);

  const statCardsData = [
    {
      title: "Total System Users",
      value: totalUsers.toString(),
      icon: <TeamOutlined />,
      color: "#4F46E5",
    },
    {
      title: "Active Classes",
      value: classList.length.toString(),
      icon: <BookOutlined />,
      color: "#10B981",
    },
    {
      title: "Fee Revenue Collected",
      value: `LKR ${totalCollected.toLocaleString()}`,
      icon: <DollarOutlined />,
      color: "#3B82F6",
    },
    {
      title: "Registered Teachers",
      value: teacherCount.toString(),
      icon: <UserSwitchOutlined />,
      color: "#8B5CF6",
    },
    {
      title: "Active Students",
      value: studentCount.toString(),
      icon: <UserSwitchOutlined />,
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
          background: themeToken.colorBgContainer,
          border: `1px solid ${themeToken.colorBorderSecondary}`,
          borderLeft: `4px solid ${themeToken.colorPrimary}`,
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <Title level={2} style={{ margin: "0 0 4px 0" }}>
              Welcome back, {user?.first_name || "Administrator"}!
            </Title>

            <Text type="secondary" style={{ fontSize: "15px" }}>
              System-wide operational overview, user accounts, active classes, and financial metrics.
            </Text>
          </div>
          <Tag color="blue" icon={<CalendarOutlined />} style={{ padding: "6px 14px", fontSize: "14px", borderRadius: "8px" }}>
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

      {/* Today's Live Sessions */}
      <AdminTodaySessionsCard
        todaySessions={todaySessions}
        upcomingSessions={upcomingSessions}
        loading={loading}
      />

      {/* Main Grid: Tuition Classes & User Role Breakdown */}
      <Row gutter={[20, 20]}>
        {/* Left Column: Active Classes Overview */}
        <Col xs={24} lg={15}>
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <BookOutlined style={{ color: "#10B981" }} />
                <span>Tuition Classes Overview ({classList.length})</span>
              </div>
            }
            bordered={false}
            style={{
              borderRadius: "14px",
              border: `1px solid ${themeToken.colorBorderSecondary}`,
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              height: "100%",
            }}
          >
            {loading ? (
              <div style={{ textAlign: "center", padding: "30px" }}>
                <Spin size="medium" />
              </div>
            ) : classList.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {classList.slice(0, 5).map((item) => (
                  <div
                    key={item._id}
                    style={{
                      padding: "14px 16px",
                      borderRadius: "10px",
                      background: themeToken.colorBgLayout,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "600", fontSize: "15px" }}>
                        {item.class_name}
                      </div>
                      <div style={{ fontSize: "12px", color: themeToken.colorTextSecondary }}>
                        Subject: {item.subject} • Grade {item.grade}
                      </div>
                    </div>
                    <Tag color="purple">Max Capacity: {item.max_students}</Tag>
                  </div>
                ))}
              </div>
            ) : (
              <Text type="secondary">No active tuition classes configured in the system.</Text>
            )}
          </Card>
        </Col>

        {/* Right Column: User Role Breakdown */}
        <Col xs={24} lg={9}>
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <TeamOutlined style={{ color: "#4F46E5" }} />
                <span>User Role Breakdown</span>
              </div>
            }
            bordered={false}
            style={{
              borderRadius: "14px",
              border: `1px solid ${themeToken.colorBorderSecondary}`,
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              height: "100%",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { role: "student", label: "Students", count: studentCount },
                { role: "teacher", label: "Teachers / Educators", count: teacherCount },
                { role: "parent", label: "Parents / Guardians", count: parentCount },
                { role: "admin", label: "Administrators", count: adminCount },
              ].map((item) => {
                const pct = totalUsers > 0 ? Math.round((item.count / totalUsers) * 100) : 0;
                return (
                  <div key={item.role}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span>
                        <Tag color={getRoleColor(item.role)}>{item.label}</Tag>
                      </span>
                      <span style={{ fontWeight: "bold" }}>
                        {item.count} ({pct}%)
                      </span>
                    </div>
                    <Progress percent={pct} showInfo={false} strokeColor={themeToken.colorPrimary} size="small" />
                  </div>
                );
              })}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default AdminDashboardOverview;



