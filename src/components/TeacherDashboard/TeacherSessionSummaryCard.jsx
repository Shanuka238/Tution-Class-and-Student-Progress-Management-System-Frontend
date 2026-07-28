import { Card, Row, Col, theme } from "antd";
import { CalendarOutlined } from "@ant-design/icons";

const TeacherSessionSummaryCard = ({ heldSessionsCount = 0, totalSessionsCount = 0 }) => {
  const { token: themeToken } = theme.useToken();

  return (
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
              {totalSessionsCount}
            </div>
            <div style={{ fontSize: "12px", color: "#3B82F6", fontWeight: "500" }}>
              Total Scheduled
            </div>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default TeacherSessionSummaryCard;
