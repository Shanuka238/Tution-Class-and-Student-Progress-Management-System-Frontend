import { Card, Tag, Spin, Typography, Empty, theme } from "antd";
import { ClockCircleOutlined, EnvironmentOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

const TeacherTodayScheduleCard = ({ todaySessions = [], upcomingSessions = [], loading = false }) => {
  const { token: themeToken } = theme.useToken();

  return (
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
  );
};

export default TeacherTodayScheduleCard;
