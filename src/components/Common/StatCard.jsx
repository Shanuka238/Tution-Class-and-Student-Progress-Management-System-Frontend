import { Typography } from "antd";

const { Text, Title } = Typography;

function StatCard({ stat }) {
  return (
    <div className="stat-card">
      <div
        className="stat-icon"
        style={{ color: stat.color, background: stat.color + "14" }}
      >
        {stat.icon}
      </div>
      <div className="stat-info">
        <Text type="secondary" className="stat-title">
          {stat.title}
        </Text>
        <Title level={3} style={{ margin: 0 }}>
          {stat.value}
        </Title>
      </div>
    </div>
  );
}

export default StatCard;
