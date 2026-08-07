import React, { useState, useEffect, useCallback } from "react";
import {
  Popover,
  Badge,
  Button,
  List,
  Typography,
  Tag,
  message,
  Space,
  Empty,
  Spin,
  theme,
} from "antd";
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  DollarOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  NotificationOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import { notificationAPI } from "../../services/notificationApi";
import { useAuth } from "../../context/AuthContext";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Text } = Typography;

const NotificationDropdown = () => {
  const { user } = useAuth();
  const { token: themeToken } = theme.useToken();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await notificationAPI.getMyNotifications();
      const list = res.data || res || [];
      setNotifications(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await notificationAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      message.error("Failed to update notification");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      message.success("All marked as read");
    } catch (err) {
      message.error("Failed to mark all as read");
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await notificationAPI.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      message.error("Failed to delete notification");
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "fee":
        return <DollarOutlined style={{ color: "#F59E0B", fontSize: "16px" }} />;
      case "result":
        return <TrophyOutlined style={{ color: "#8B5CF6", fontSize: "16px" }} />;
      case "attendance":
        return <CheckCircleOutlined style={{ color: "#10B981", fontSize: "16px" }} />;
      default:
        return <NotificationOutlined style={{ color: themeToken.colorPrimary, fontSize: "16px" }} />;
    }
  };

  const content = (
    <div style={{ width: 380, maxHeight: 440, display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          borderBottom: `1px solid ${themeToken.colorBorderSecondary}`,
        }}
      >
        <Space size="small">
          <Text strong style={{ fontSize: "14px" }}>Notifications</Text>
          {unreadCount > 0 && <Tag color="blue">{unreadCount} new</Tag>}
        </Space>
        {unreadCount > 0 && (
          <Button
            type="text"
            size="small"
            icon={<ClearOutlined />}
            onClick={handleMarkAllAsRead}
            style={{ fontSize: "12px" }}
          >
            Mark all read
          </Button>
        )}
      </div>

      {/* Notification List */}
      <div style={{ overflowY: "auto", flex: 1, padding: "8px" }}>
        {loading && notifications.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px 0" }}>
            <Spin size="small" />
          </div>
        ) : notifications.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No notifications yet"
            style={{ margin: "20px 0" }}
          />
        ) : (
          <List
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item
                style={{
                  padding: "10px 12px",
                  borderRadius: "8px",
                  marginBottom: "6px",
                  background: item.is_read ? "transparent" : themeToken.colorPrimaryBg,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  alignItems: "flex-start",
                }}
                onClick={() => !item.is_read && handleMarkAsRead(item._id)}
                actions={[
                  !item.is_read && (
                    <Button
                      key="read"
                      type="text"
                      size="small"
                      icon={<CheckOutlined />}
                      title="Mark as read"
                      onClick={(e) => handleMarkAsRead(item._id, e)}
                    />
                  ),
                  <Button
                    key="del"
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    title="Delete"
                    onClick={(e) => handleDelete(item._id, e)}
                  />,
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  avatar={<div style={{ marginTop: "2px" }}>{getTypeIcon(item.notification_type)}</div>}
                  title={
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "8px",
                      }}
                    >
                      <Text
                        strong
                        style={{
                          fontSize: "13px",
                          lineHeight: "1.3",
                          wordBreak: "break-word",
                          flex: 1,
                        }}
                      >
                        {item.notification_title}
                      </Text>
                      <Text
                        type="secondary"
                        style={{
                          fontSize: "10px",
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                          marginTop: "1px",
                        }}
                      >
                        {dayjs(item.created_at).fromNow()}
                      </Text>
                    </div>
                  }
                  description={
                    <Text
                      type="secondary"
                      style={{
                        fontSize: "12px",
                        display: "block",
                        marginTop: "4px",
                        lineHeight: "1.4",
                        wordBreak: "break-word",
                      }}
                    >
                      {item.notification_message}
                    </Text>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      placement="bottomRight"
      open={visible}
      onOpenChange={(open) => {
        setVisible(open);
        if (open) fetchNotifications();
      }}
      overlayInnerStyle={{ padding: 0 }}
    >
      <Badge count={unreadCount} overflowCount={99} size="small">
        <Button type="text" icon={<BellOutlined />} style={{ fontSize: 18 }} />
      </Badge>
    </Popover>
  );
};

export default NotificationDropdown;
