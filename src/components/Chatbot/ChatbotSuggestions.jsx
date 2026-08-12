import React from "react";
import { Tag, Typography, theme } from "antd";
import { BulbOutlined } from "@ant-design/icons";

const { Text } = Typography;

const SUGGESTIONS_BY_ROLE = {
  admin: [
    "How many students haven't paid fees this month?",
    "Show overall system attendance & class overview",
    "How many active users are in the system?",
  ],
  teacher: [
    "Show students who failed the last exam in my class",
    "Summary of my assigned classes and schedule",
    "Who has attendance warnings in my subject?",
  ],
  student: [
    "What is my attendance percentage this month?",
    "What rank did I get in the last exam?",
    "Has my tuition fee been paid?",
  ],
  parent: [
    "How is my child performing in recent exams?",
    "Has my child's tuition fee been paid?",
    "Show my child's attendance summary",
  ],
};

const ChatbotSuggestions = ({ role, onSelectSuggestion }) => {
  const { token: themeToken } = theme.useToken();
  const suggestions = SUGGESTIONS_BY_ROLE[role] || SUGGESTIONS_BY_ROLE.student;

  return (
    <div
      style={{
        padding: "8px 16px",
        background: themeToken.colorBgContainer,
        borderTop: `1px solid ${themeToken.colorBorderSecondary}`,
        display: "flex",
        alignItems: "center",
        gap: "6px",
        overflowX: "auto",
        whiteSpace: "nowrap",
      }}
    >
      <Text type="secondary" style={{ fontSize: "11px", display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
        <BulbOutlined /> Ask:
      </Text>
      {suggestions.map((chip, idx) => (
        <Tag
          key={idx}
          color="purple"
          style={{
            cursor: "pointer",
            borderRadius: "12px",
            fontSize: "11px",
            padding: "2px 10px",
            marginRight: 0,
            flexShrink: 0,
          }}
          onClick={() => onSelectSuggestion(chip)}
        >
          {chip}
        </Tag>
      ))}
    </div>
  );
};

export default ChatbotSuggestions;
