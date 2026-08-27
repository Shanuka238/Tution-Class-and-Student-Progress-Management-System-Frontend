import React from "react";
import { Card, Tag, Spin, Typography, Empty, Button, Space, theme } from "antd";
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  RightOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

const AdminTodaySessionsCard = ({
  todaySessions = [],
  upcomingSessions = [],
  loading = false,
  onNavigateTimetable,
}) => {
  const { token: themeToken } = theme.useToken();

  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ClockCircleOutlined style={{ color: "#4F46E5" }} />
            <span>Today's Live Sessions ({todaySessions.length})</span>
          </div>
          {todaySessions.length > 0 && (
            <Tag color="processing" style={{ borderRadius: "6px", fontSize: "12px" }}>
              Live Schedule
            </Tag>
          )}
        </div>
      }
      extra={
        onNavigateTimetable && (
          <Button
            type="link"
            size="small"
            onClick={onNavigateTimetable}
            style={{ padding: 0 }}
          >
            Full Timetable <RightOutlined style={{ fontSize: "10px" }} />
          </Button>
        )
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
            const course = session.course_id || session.class_id || {};
            const teacher = session.teacher_id?.user_id || session.teacher_id || {};
            const teacherName = teacher.first_name
              ? `${teacher.first_name} ${teacher.last_name || ""}`.trim()
              : "Assigned Teacher";

            const statusColors = {
              held: "green",
              cancelled: "red",
              scheduled: "blue",
            };
            const currentStatus = session.status || "scheduled";

            return (
              <div
                key={session._id || session.id}
                style={{
                  padding: "16px",
                  borderRadius: "10px",
                  border: `1px solid ${themeToken.colorBorderSecondary}`,
                  background: themeToken.colorBgLayout,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "15px", fontWeight: "600", color: themeToken.colorText }}>
                      {course.class_name || "Tuition Course"}
                    </span>
                    {course.grade && <Tag color="purple">Grade {course.grade}</Tag>}
                    {course.subject && (
                      <Tag color="cyan">{course.subject}</Tag>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "18px",
                      marginTop: "8px",
                      fontSize: "12px",
                      color: themeToken.colorTextSecondary,
                      flexWrap: "wrap",
                    }}
                  >
                    <span>
                      <ClockCircleOutlined style={{ marginRight: "4px", color: "#4F46E5" }} />
                      {session.start_time} - {session.end_time}
                    </span>
                    <span>
                      <EnvironmentOutlined style={{ marginRight: "4px", color: "#10B981" }} />
                      {session.venue || "Main Lecture Hall"}
                    </span>
                    <span>
                      <UserOutlined style={{ marginRight: "4px", color: "#F59E0B" }} />
                      {teacherName}
                    </span>
                  </div>
                </div>

                <Tag color={statusColors[currentStatus] || "blue"}>
                  {currentStatus.toUpperCase()}
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
              <Text type="secondary">No live teaching sessions scheduled for today.</Text>
              {upcomingSessions.length > 0 && (
                <div
                  style={{
                    marginTop: "10px",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    background: "rgba(99, 102, 241, 0.06)",
                    border: "1px solid rgba(99, 102, 241, 0.15)",
                    fontSize: "12px",
                    color: themeToken.colorTextSecondary,
                  }}
                >
                  <CalendarOutlined style={{ marginRight: "6px", color: "#4F46E5" }} />
                  Next upcoming session:{" "}
                  <strong>
                    {upcomingSessions[0]?.course_id?.class_name ||
                      upcomingSessions[0]?.class_id?.class_name ||
                      "Scheduled Class"}
                  </strong>{" "}
                  on {dayjs(upcomingSessions[0]?.date).format("dddd, MMM D")} (
                  {upcomingSessions[0]?.start_time} - {upcomingSessions[0]?.end_time})
                </div>
              )}
            </div>
          }
        />
      )}
    </Card>
  );
};

export default AdminTodaySessionsCard;
