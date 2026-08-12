import React from "react";
import { Space, Avatar, Typography, Tooltip, Button } from "antd";
import {
  RobotOutlined,
  ThunderboltOutlined,
  HistoryOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const ChatbotHeader = ({ role, onReloadHistory, onClearHistory }) => {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
      <Space size="middle">
        <Avatar
          icon={<RobotOutlined />}
          style={{ backgroundColor: "#8B5CF6", color: "#fff" }}
        />
        <div>
          <Text strong style={{ fontSize: "15px", display: "block" }}>
            EduManage 360 AI <ThunderboltOutlined style={{ color: "#F59E0B" }} />
          </Text>
          <Text type="secondary" style={{ fontSize: "11px" }}>
            Online • Gemini 2.5 Powered ({role.toUpperCase()})
          </Text>
        </div>
      </Space>
      <Space size="small">
        <Tooltip title="Reload Chat History">
          <Button
            type="text"
            icon={<HistoryOutlined style={{ fontSize: 16 }} />}
            onClick={onReloadHistory}
          />
        </Tooltip>
        <Tooltip title="Clear chat history">
          <Button
            type="text"
            danger
            icon={<DeleteOutlined style={{ fontSize: 16 }} />}
            onClick={onClearHistory}
          />
        </Tooltip>
      </Space>
    </div>
  );
};

export default ChatbotHeader;
