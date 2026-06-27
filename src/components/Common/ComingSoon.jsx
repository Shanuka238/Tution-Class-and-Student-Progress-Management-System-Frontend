import { Typography } from "antd";

const { Text, Title } = Typography;

function ComingSoon({ label }) {
  return (
    <div className="placeholder-card" style={{ textAlign: "center", padding: 80 }}>
      <Title level={3}>{label}</Title>
      <Text type="secondary">This module is coming soon.</Text>
    </div>
  );
}

export default ComingSoon;
