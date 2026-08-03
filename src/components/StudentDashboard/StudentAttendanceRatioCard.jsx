import { Card, Progress, Typography, theme } from "antd";
import { CheckSquareOutlined } from "@ant-design/icons";

const { Text } = Typography;

const StudentAttendanceRatioCard = ({
  attendancePct = 100,
  presentCount = 0,
  lateCount = 0,
  absentCount = 0,
  totalAttendance = 0,
}) => {
  const { token: themeToken } = theme.useToken();

  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <CheckSquareOutlined style={{ color: "#10B981" }} />
          <span>Attendance Ratio</span>
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

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "10px 16px",
          borderRadius: "8px",
          background: themeToken.colorBgLayout,
          textAlign: "center",
          fontSize: "12px",
        }}
      >
        <div>
          <Text type="secondary">Present</Text>
          <div style={{ fontWeight: "bold", color: "#10B981" }}>{presentCount}</div>
        </div>
        <div>
          <Text type="secondary">Late</Text>
          <div style={{ fontWeight: "bold", color: "#F59E0B" }}>{lateCount}</div>
        </div>
        <div>
          <Text type="secondary">Absent</Text>
          <div style={{ fontWeight: "bold", color: "#EF4444" }}>{absentCount}</div>
        </div>
        <div>
          <Text type="secondary">Total</Text>
          <div style={{ fontWeight: "bold" }}>{totalAttendance}</div>
        </div>
      </div>
    </Card>
  );
};

export default StudentAttendanceRatioCard;
