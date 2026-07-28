import { Card, Progress, Typography, theme } from "antd";
import { TeamOutlined } from "@ant-design/icons";

const { Text } = Typography;

const TeacherSeatUtilizationCard = ({
  capacityFillPct = 0,
  totalEnrolledStudents = 0,
  totalMaxCapacity = 0,
}) => {
  const { token: themeToken } = theme.useToken();

  return (
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
  );
};

export default TeacherSeatUtilizationCard;
