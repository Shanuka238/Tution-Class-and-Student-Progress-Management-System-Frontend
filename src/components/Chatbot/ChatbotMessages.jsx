import React from "react";
import { Avatar, Space, Spin, theme } from "antd";
import { RobotOutlined, UserOutlined } from "@ant-design/icons";

const ChatbotMessages = ({ messages, loading, messagesEndRef }) => {
  const { token: themeToken } = theme.useToken();

  const formatText = (text) => {
    if (!text) return "";
    return text.split("\n").map((line, idx) => {
      let content = line;
      const parts = content.split(/(\*\*.*?\*\*)/g);
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      return (
        <div key={idx} style={{ marginBottom: line ? "4px" : "8px" }}>
          {renderedParts}
        </div>
      );
    });
  };

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "16px",
        background: themeToken.colorBgLayout,
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      {messages.map((msg, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
            alignItems: "flex-start",
            gap: "8px",
          }}
        >
          {msg.sender === "bot" && (
            <Avatar
              size="small"
              icon={<RobotOutlined />}
              style={{ background: "#4F46E5", marginTop: "2px", flexShrink: 0 }}
            />
          )}
          <div
            style={{
              maxWidth: "82%",
              padding: "10px 14px",
              borderRadius: msg.sender === "user" ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
              background:
                msg.sender === "user"
                  ? themeToken.colorPrimary
                  : themeToken.colorBgContainer,
              color: msg.sender === "user" ? "#fff" : themeToken.colorText,
              border: msg.sender === "user" ? "none" : `1px solid ${themeToken.colorBorderSecondary}`,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              fontSize: "13px",
              lineHeight: "1.45",
            }}
          >
            {formatText(msg.text)}
          </div>
          {msg.sender === "user" && (
            <Avatar
              size="small"
              icon={<UserOutlined />}
              style={{ background: "#4F46E5", marginTop: "2px", flexShrink: 0 }}
            />
          )}
        </div>
      ))}

      {loading && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Avatar size="small" icon={<RobotOutlined />} style={{ background: "#8B5CF6" }} />
          <div
            style={{
              padding: "8px 14px",
              borderRadius: "14px",
              background: themeToken.colorBgContainer,
              border: `1px solid ${themeToken.colorBorderSecondary}`,
              fontSize: "12px",
              color: themeToken.colorTextSecondary,
            }}
          >
            <Space size="small">
              <Spin size="small" />
              <span>Analyzing MongoDB records...</span>
            </Space>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatbotMessages;
