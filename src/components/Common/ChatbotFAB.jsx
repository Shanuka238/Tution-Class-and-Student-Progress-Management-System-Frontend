import React, { useState } from "react";
import { Button } from "antd";
import { RobotOutlined } from "@ant-design/icons";
import ChatbotDrawer from "../Chatbot/ChatbotDrawer";

function ChatbotFAB() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Trigger FAB Button */}
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
          boxShadow: "0 6px 20px rgba(79, 70, 229, 0.35)",
          background: "#4F46E5",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      />

      {/* Modular Side Drawer AI Chatbot */}
      <ChatbotDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export default ChatbotFAB;