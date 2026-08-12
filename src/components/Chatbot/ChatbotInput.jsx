import React from "react";
import { Input, Button, theme } from "antd";
import { SendOutlined } from "@ant-design/icons";

const ChatbotInput = ({ value, onChange, onSend, loading }) => {
  const { token: themeToken } = theme.useToken();

  return (
    <div
      style={{
        padding: "12px 16px",
        background: themeToken.colorBgContainer,
        borderTop: `1px dashed ${themeToken.colorBorderSecondary}`,
        display: "flex",
        gap: "8px",
      }}
    >
      <Input
        placeholder="Ask AI about students, marks, fees..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPressEnter={() => onSend()}
        disabled={loading}
        style={{ borderRadius: "20px" }}
      />
      <Button
        type="primary"
        shape="circle"
        icon={<SendOutlined />}
        onClick={() => onSend()}
        loading={loading}
        style={{
          background: "linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)",
          border: "none",
          flexShrink: 0,
        }}
      />
    </div>
  );
};

export default ChatbotInput;
