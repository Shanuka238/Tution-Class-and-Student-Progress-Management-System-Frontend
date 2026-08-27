import { Card, Typography, Tag, Select, Spin, theme } from "antd";
import { UserOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

const ParentHeaderBanner = ({
  user,
  selectedChild,
  children,
  selectedStudentId,
  setSelectedStudentId,
  loadingChildren,
  growthBadge,
}) => {
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
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Title level={2} style={{ margin: 0 }}>
              Welcome, {user?.first_name || "Parent"}!
            </Title>

            {selectedChild && growthBadge && (
              <Tag
                color={growthBadge.color}
                style={{ fontSize: "13px", padding: "4px 10px", borderRadius: "6px" }}
              >
                {growthBadge.label}
              </Tag>
            )}
          </div>
          <Text
            type="secondary"
            style={{ fontSize: "15px", display: "block", marginTop: "4px" }}
          >
            Real-time child academic growth scorecard, subject performance, attendance analytics, and fee standing.
          </Text>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            background: themeToken.colorBgContainer,
            padding: "8px 16px",
            borderRadius: "12px",
            border: `1px solid ${themeToken.colorBorderSecondary}`,
          }}
        >
          <UserOutlined style={{ color: themeToken.colorPrimary, fontSize: "16px" }} />
          <span style={{ fontSize: "14px", fontWeight: "600" }}>Viewing Child:</span>
          {loadingChildren ? (
            <Spin size="small" />
          ) : children && children.length > 0 ? (
            <Select
              value={selectedStudentId}
              onChange={setSelectedStudentId}
              style={{ minWidth: "200px" }}
              variant="borderless"
            >
              {children.map((c) => {
                const sId = c.student_id || c._id;
                const u = c.user_id || {};
                return (
                  <Option key={sId} value={sId}>
                    {u.first_name} {u.last_name} (Grade {c.grade})
                  </Option>
                );
              })}
            </Select>
          ) : (
            <Tag color="orange">No Linked Children Found</Tag>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ParentHeaderBanner;
