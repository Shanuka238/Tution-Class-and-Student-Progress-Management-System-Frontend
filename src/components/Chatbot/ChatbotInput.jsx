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
          background: "#4F46E5",
          border: "none",
          flexShrink: 0,
        }}
      />
    </div>
  );
};

export default ChatbotInput;
