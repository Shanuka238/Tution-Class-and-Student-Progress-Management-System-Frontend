import React, { useState, useEffect, useRef } from "react";
import { Drawer, Segmented, theme } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import { chatbotAPI } from "../../services/chatbotApi";
import ChatbotHeader from "./ChatbotHeader";
import ChatbotMessages from "./ChatbotMessages";
import ChatbotSuggestions from "./ChatbotSuggestions";
import ChatbotInput from "./ChatbotInput";
import ChatbotHistoryList from "./ChatbotHistoryList";

const ChatbotDrawer = ({ open, onClose }) => {
  const { user } = useAuth();
  const { token: themeToken } = theme.useToken();
  const [activeTab, setActiveTab] = useState("chat");
  const [messages, setMessages] = useState([]);
  const [rawHistoryLogs, setRawHistoryLogs] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const role = user?.role ? String(user.role).toLowerCase() : "student";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const userId = user?._id || user?.id;
    if (userId) {
      loadHistory();
    }
  }, [open, user?._id, user?.id]);

  useEffect(() => {
    if (open && activeTab === "chat") {
      scrollToBottom();
    }
  }, [messages, open, activeTab, loading]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await chatbotAPI.getHistory();
      const rawLogs = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
      if (rawLogs.length > 0) {
        setRawHistoryLogs(rawLogs);
        const formatted = [];
        rawLogs.forEach((log) => {
          formatted.push({ sender: "user", text: log.question });
          formatted.push({ sender: "bot", text: log.response });
        });
        setMessages(formatted);
      } else {
        setRawHistoryLogs([]);
        setMessages([
          {
            sender: "bot",
            text: `👋 Hello **${user?.first_name || "there"}**! I am your **EduManage 360 AI Assistant**.\n\nAsk me any natural language question about students, attendance, exam results, or tuition fees!`,
          },
        ]);
      }
    } catch (err) {
      console.error("Error loading chat history:", err);
      setMessages([
        {
          sender: "bot",
          text: `👋 Hello **${user?.first_name || "there"}**! I am your **EduManage 360 AI Assistant**.\n\nAsk me any question about your data!`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (textToSend) => {
    const questionText = textToSend || inputValue;
    if (!questionText || !questionText.trim() || loading) return;

    const userMsg = { sender: "user", text: questionText.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setLoading(true);
    setActiveTab("chat");

    try {
      const res = await chatbotAPI.askQuestion(questionText.trim());
      const botResponse = res.data?.response || res.response || "No response generated.";
      setMessages((prev) => [...prev, { sender: "bot", text: botResponse }]);

      const updatedHistory = await chatbotAPI.getHistory();
      if (Array.isArray(updatedHistory.data || updatedHistory)) {
        setRawHistoryLogs(updatedHistory.data || updatedHistory);
      }
    } catch (err) {
      console.error("Error asking AI chatbot:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "⚠️ Sorry, I encountered an issue retrieving data. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await chatbotAPI.clearHistory();
      setRawHistoryLogs([]);
      setMessages([
        {
          sender: "bot",
          text: `Conversation cleared. Ask me a new question!`,
        },
      ]);
    } catch (err) {
      console.error("Error clearing history:", err);
    }
  };

  if (!user) return null;

  return (
    <Drawer
      title={
        <ChatbotHeader
          role={role}
          onReloadHistory={loadHistory}
          onClearHistory={handleClearHistory}
        />
      }
      placement="right"
      width={430}
      onClose={onClose}
      open={open}
      closeIcon={<CloseOutlined />}
      styles={{ body: { padding: 0, display: "flex", flexDirection: "column" } }}
    >
      {/* View Mode Switcher */}
      <div
        style={{
          padding: "10px 16px",
          background: themeToken.colorBgContainer,
          borderBottom: `1px solid ${themeToken.colorBorderSecondary}`,
        }}
      >
        <Segmented
          block
          value={activeTab}
          onChange={(val) => setActiveTab(val)}
          options={[
            { label: "💬 Active Chat", value: "chat" },
            { label: `📜 History Logs (${rawHistoryLogs.length})`, value: "history" },
          ]}
        />
      </div>

      {/* Tab 1: Active Chat */}
      {activeTab === "chat" && (
        <>
          <ChatbotMessages
            messages={messages}
            loading={loading}
            messagesEndRef={messagesEndRef}
          />
          <ChatbotSuggestions
            role={role}
            onSelectSuggestion={(chipText) => handleSend(chipText)}
          />
          <ChatbotInput
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSend}
            loading={loading}
          />
        </>
      )}

      {/* Tab 2: History Logs */}
      {activeTab === "history" && (
        <ChatbotHistoryList
          historyLogs={rawHistoryLogs}
          onSelectLog={() => setActiveTab("chat")}
        />
      )}
    </Drawer>
  );
};

export default ChatbotDrawer;
