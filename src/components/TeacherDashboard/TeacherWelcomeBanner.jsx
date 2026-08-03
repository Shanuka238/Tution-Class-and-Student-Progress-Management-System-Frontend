import { Card, Typography, Tag, theme } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const TeacherWelcomeBanner = ({ user }) => {
  const { token: themeToken } = theme.useToken();

  return (
    <Card
      bordered={false}
      style={{
        borderRadius: "16px",
        background: `linear-gradient(135deg, ${themeToken.colorPrimary}15 0%, ${themeToken.colorPrimary}05 100%)`,
        border: `1px solid ${themeToken.colorPrimary}30`,
        boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <Title level={2} style={{ margin: "0 0 4px 0" }}>
            Welcome back, {user?.first_name || "Educator"}! 👨‍🏫
          </Title>
          <Text type="secondary" style={{ fontSize: "15px" }}>
            Here is your active teaching schedule, class student counts, and session metrics.
          </Text>
        </div>
        <Tag
          color="blue"
          icon={<CalendarOutlined />}
          style={{ padding: "6px 14px", fontSize: "14px", borderRadius: "8px" }}
        >
          {dayjs().format("dddd, MMMM D, YYYY")}
        </Tag>
      </div>
    </Card>
  );
};

export default TeacherWelcomeBanner;
