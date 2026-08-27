import { Card, Typography, Tag, theme } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const StudentWelcomeBanner = ({ user }) => {
  const { token: themeToken } = theme.useToken();

  return (
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
            Welcome back, {user?.first_name || "Student"}!
          </Title>

          <Text type="secondary" style={{ fontSize: "15px" }}>
            Here is your active learning schedule, attendance metrics, and fee summary for today.
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

export default StudentWelcomeBanner;
