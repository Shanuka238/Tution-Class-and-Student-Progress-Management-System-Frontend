import { Card, Typography, Tag, theme } from "antd";
import {
  FireOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  DollarOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const GrowthHighlightsBanner = ({
  childUser,
  growthBadge,
  attendancePct,
  presentCount,
  scoredExams,
  avgExamScore,
  unpaidFees,
}) => {
  const { token: themeToken } = theme.useToken();

  if (!growthBadge) return null;

  return (
    <Card
      bordered={false}
      style={{
        borderRadius: "14px",
        background: `linear-gradient(135deg, ${growthBadge.color}10 0%, ${themeToken.colorBgContainer} 100%)`,
        border: `1px solid ${growthBadge.color}30`,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            background: growthBadge.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: "22px",
            flexShrink: 0,
          }}
        >
          <FireOutlined />
        </div>
        <div>
          <div style={{ fontWeight: "700", fontSize: "16px", color: themeToken.colorText }}>
            {childUser?.first_name || "Child"}'s Academic Growth Highlights
          </div>
          <Text type="secondary" style={{ fontSize: "13px" }}>
            {growthBadge.text}
          </Text>
          <div
            style={{
              marginTop: "10px",
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              fontSize: "13px",
            }}
          >
            <Tag icon={<CheckCircleOutlined />} color="success">
              Attendance: {attendancePct}% ({presentCount} Present)
            </Tag>
            {scoredExams && scoredExams.length > 0 && (
              <Tag icon={<TrophyOutlined />} color="purple">
                Latest Exam Average: {avgExamScore}%
              </Tag>
            )}
            <Tag
              icon={<DollarOutlined />}
              color={unpaidFees && unpaidFees.length === 0 ? "blue" : "error"}
            >
              Tuition Status:{" "}
              {unpaidFees && unpaidFees.length === 0
                ? "Up to Date"
                : `${unpaidFees?.length || 0} Unpaid Invoice`}
            </Tag>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default GrowthHighlightsBanner;
