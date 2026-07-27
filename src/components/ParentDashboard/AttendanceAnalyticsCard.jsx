import { Card, Progress, Row, Col, theme } from "antd";
import { CheckSquareOutlined } from "@ant-design/icons";

const AttendanceAnalyticsCard = ({
  attendancePct = 100,
  presentCount = 0,
  lateCount = 0,
  absentCount = 0,
}) => {
  const { token: themeToken } = theme.useToken();

  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <CheckSquareOutlined style={{ color: "#F59E0B" }} />
          <span>Attendance Rate Analytics</span>
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
          <div
            style={{
              background: themeToken.colorBgLayout,
              padding: "8px",
              borderRadius: "8px",
            }}
          >
            <div style={{ fontWeight: "bold", color: "#10B981" }}>{presentCount}</div>
            <div style={{ fontSize: "11px", color: themeToken.colorTextSecondary }}>
              Present
            </div>
          </div>
        </Col>
        <Col span={8}>
          <div
            style={{
              background: themeToken.colorBgLayout,
              padding: "8px",
              borderRadius: "8px",
            }}
          >
            <div style={{ fontWeight: "bold", color: "#F59E0B" }}>{lateCount}</div>
            <div style={{ fontSize: "11px", color: themeToken.colorTextSecondary }}>
              Late
            </div>
          </div>
        </Col>
        <Col span={8}>
          <div
            style={{
              background: themeToken.colorBgLayout,
              padding: "8px",
              borderRadius: "8px",
            }}
          >
            <div style={{ fontWeight: "bold", color: "#EF4444" }}>{absentCount}</div>
            <div style={{ fontSize: "11px", color: themeToken.colorTextSecondary }}>
              Absent
            </div>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default AttendanceAnalyticsCard;
