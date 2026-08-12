import React, { useState } from "react";
import { Input, List, Card, Tag, Typography, Button, theme } from "antd";
import { SearchOutlined, HistoryOutlined, MessageOutlined, RightOutlined } from "@ant-design/icons";

const { Text, Paragraph } = Typography;

const ChatbotHistoryList = ({ historyLogs, onSelectLog }) => {
  const { token: themeToken } = theme.useToken();
  const [historySearch, setHistorySearch] = useState("");

  const filteredHistory = historyLogs.filter(
    (log) =>
      log.question?.toLowerCase().includes(historySearch.toLowerCase()) ||
      log.response?.toLowerCase().includes(historySearch.toLowerCase())
  );

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
      <Input
        prefix={<SearchOutlined style={{ color: "#9CA3AF" }} />}
        placeholder="Search past questions & answers..."
        value={historySearch}
        onChange={(e) => setHistorySearch(e.target.value)}
        allowClear
        style={{ borderRadius: "8px", marginBottom: "8px" }}
      />

      {filteredHistory.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 16px" }}>
          <HistoryOutlined style={{ fontSize: 36, color: "#9CA3AF", marginBottom: 12 }} />
          <Paragraph type="secondary">
            {historySearch ? "No matching chat logs found." : "No saved chat history yet. Ask a question in Active Chat!"}
          </Paragraph>
        </div>
      ) : (
        <List
          dataSource={filteredHistory}
          renderItem={(log) => (
            <Card
              hoverable
              size="small"
              style={{
                marginBottom: 10,
                borderRadius: 10,
                cursor: "pointer",
                border: `1px solid ${themeToken.colorBorderSecondary}`,
              }}
              onClick={() => onSelectLog(log)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <Text strong style={{ fontSize: "13px", color: themeToken.colorPrimary }}>
                  <MessageOutlined style={{ marginRight: 6 }} />
                  {log.question}
                </Text>
                <RightOutlined style={{ fontSize: 11, color: "#9CA3AF" }} />
              </div>

              <Paragraph
                ellipsis={{ rows: 2 }}
                type="secondary"
                style={{ fontSize: "12px", marginBottom: 6, lineHeight: "1.4" }}
              >
                {log.response}
              </Paragraph>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Tag color="default" style={{ fontSize: "10px", margin: 0 }}>
                  {new Date(log.created_at || Date.now()).toLocaleString()}
                </Tag>
                <Button type="link" size="small" style={{ padding: 0, fontSize: "11px" }}>
                  View in Chat →
                </Button>
              </div>
            </Card>
          )}
        />
      )}
    </div>
  );
};

export default ChatbotHistoryList;
