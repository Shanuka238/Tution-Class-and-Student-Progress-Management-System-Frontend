import React, { useEffect, useState, useCallback } from "react";
import { Drawer, Table, Button, Space, Popconfirm, Tag, message } from "antd";
import { CalendarOutlined, PlusOutlined, DeleteOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { classAPI } from "../../services/classApi";
import { attendanceAPI } from "../../services/attendanceApi";
import SessionModal from "./SessionModal";
import dayjs from "dayjs";

const SessionList = ({ visible, onClose, course, onMarkAttendance, hideManagement }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionModalVisible, setSessionModalVisible] = useState(false);
  const [markedMap, setMarkedMap] = useState({});

  const user = JSON.parse(localStorage.getItem("edutracker_user") || "{}");
  const canManage = ["admin", "teacher"].includes(user.role) && !hideManagement;

  const fetchSessions = useCallback(async () => {
    if (!course) return;
    setLoading(true);
    try {
      const res = await classAPI.getCourseSessions(course._id);
      const data = res.data || res;
      setSessions(data);

      // Check marked status for each session
      const newMarkedMap = {};
      const checks = data.map(async (sess) => {
        try {
          const checkRes = await attendanceAPI.checkSessionAttendanceExists(sess._id);
          newMarkedMap[sess._id] = checkRes?.data?.marked ?? checkRes?.marked ?? false;
        } catch {
          newMarkedMap[sess._id] = false;
        }
      });
      await Promise.all(checks);
      setMarkedMap(newMarkedMap);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      message.error("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  }, [course]);

  useEffect(() => {
    if (visible && course) {
      fetchSessions();
    }
  }, [visible, course, fetchSessions]);

  const handleDeleteSession = async (sessionId) => {
    try {
      await classAPI.deleteSession(sessionId);
      message.success("Session deleted successfully");
      fetchSessions();
    } catch (error) {
      console.error("Error deleting session:", error);
      message.error(error.message || "Failed to delete session");
    }
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => dayjs(date).format("YYYY-MM-DD (dddd)"),
    },
    {
      title: "Time",
      key: "time",
      render: (_, record) => `${record.start_time || "N/A"} - ${record.end_time || "N/A"}`,
    },
    {
      title: "Teacher",
      key: "teacher",
      render: (_, record) => {
        const teacherUser = record.teacher_id?.user_id;
        return teacherUser ? `${teacherUser.first_name} ${teacherUser.last_name}` : "Unassigned";
      },
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        const isMarked = markedMap[record._id];
        return (
          <Space>
            <Tag color={record.status === "held" ? "green" : "red"}>
              {record.status.toUpperCase()}
            </Tag>
            {isMarked ? (
              <Tag color="success">Marked ✓</Tag>
            ) : (
              <Tag color="default">Not Marked</Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        const isMarked = markedMap[record._id];
        return (
          <Space>
            {onMarkAttendance && (
              <Button
                type={isMarked ? "default" : "primary"}
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => onMarkAttendance(record, isMarked)}
              >
                {isMarked ? "Edit Attendance" : "Mark Attendance"}
              </Button>
            )}
            {canManage && (
              <Popconfirm
                title="Delete Session"
                description="Are you sure you want to delete this session? This will permanently delete its attendance records."
                onConfirm={() => handleDeleteSession(record._id)}
                okText="Yes, Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                />
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <Drawer
      title={`Sessions Directory — ${course?.class_name}`}
      width={700}
      onClose={onClose}
      open={visible}
      destroyOnClose
      extra={
        canManage && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setSessionModalVisible(true)}
          >
            New Session
          </Button>
        )
      }
    >
      <Table
        columns={columns}
        dataSource={sessions}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 8 }}
      />

      <SessionModal
        visible={sessionModalVisible}
        onCancel={() => setSessionModalVisible(false)}
        onSuccess={() => {
          setSessionModalVisible(false);
          fetchSessions();
        }}
        courseId={course?._id}
        courseName={course?.class_name}
      />
    </Drawer>
  );
};

export default SessionList;
