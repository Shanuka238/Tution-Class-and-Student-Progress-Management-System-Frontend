import { useState } from "react";
import { Button, Drawer, Typography } from "antd";
import { RobotOutlined, CloseOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

function ChatbotFAB() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="primary"
        shape="circle"
        size="large"
        icon={<RobotOutlined style={{ fontSize: 22 }} />}
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          bottom: 28,
          right: 28,
          width: 56,
          height: 56,
          zIndex: 1000,
          boxShadow: "0 8px 28px rgba(79, 70, 229, 0.35)",
          background: "linear-gradient(135deg, #4F46E5, #6366F1)",
          border: "none",
        }}
      />

      <Drawer
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <RobotOutlined style={{ fontSize: 20, color: "#4F46E5" }} />
            <span>AI Assistant</span>
          </div>
        }
        placement="right"
        width={400}
        onClose={() => setOpen(false)}
        open={open}
        closeIcon={<CloseOutlined />}
        styles={{ body: { padding: 16 } }}
      >
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <RobotOutlined style={{ fontSize: 48, color: "#4F46E5", marginBottom: 16 }} />
          <Title level={4}>EduTracker AI ChatBot</Title>
          <Text type="secondary">
            Powered by Google Gemini. Ask me anything about attendance, grades, schedules, or student progress (Coming Soon).
          </Text>
        </div>
      </Drawer>
    </>
  );
}

export default ChatbotFAB;