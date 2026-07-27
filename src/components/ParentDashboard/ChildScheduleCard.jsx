import { Card, Tag, Empty, theme } from "antd";
import { ClockCircleOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { SESSION_STATUS, SESSION_STATUS_COLORS } from "../../enums/sessionStatus";

const ChildScheduleCard = ({ childUser, todaySessions = [] }) => {
  const { token: themeToken } = theme.useToken();

  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <ClockCircleOutlined style={{ color: themeToken.colorPrimary }} />
          <span>
            Today's Live Classes for {childUser?.first_name || "Child"} ({todaySessions.length})
          </span>
        </div>
      }
      bordered={false}
      style={{
        borderRadius: "14px",
        border: `1px solid ${themeToken.colorBorderSecondary}`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
      }}
    >
      {todaySessions.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {todaySessions.map((session) => {
            const course = session.course_id || {};
            const statusKey = session.status || SESSION_STATUS.SCHEDULED;
            return (
              <div
                key={session._id}
                style={{
                  padding: "14px 16px",
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
                  <div style={{ fontSize: "15px", fontWeight: "600" }}>
                    {course.class_name || "Tuition Class"}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: themeToken.colorTextSecondary,
                      marginTop: "2px",
                    }}
                  >
                    {course.subject} • Grade {course.grade}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "16px",
                      marginTop: "6px",
                      fontSize: "12px",
                      color: themeToken.colorTextSecondary,
                    }}
                  >
                    <span>
                      <ClockCircleOutlined /> {session.start_time} - {session.end_time}
                    </span>
                    <span>
                      <EnvironmentOutlined /> {session.venue || "Main Room"}
                    </span>
                  </div>
                </div>
                <Tag color={SESSION_STATUS_COLORS[statusKey] || "blue"}>
                  {statusKey.toUpperCase()}
                </Tag>
              </div>
            );
          })}
        </div>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={`No live classes scheduled for ${childUser?.first_name || "your child"} today.`}
        />
      )}
    </Card>
  );
};

export default ChildScheduleCard;
