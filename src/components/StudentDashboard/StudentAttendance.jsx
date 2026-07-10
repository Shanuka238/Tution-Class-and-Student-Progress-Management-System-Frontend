import React, { useState, useEffect } from "react";
import { Table, Tag, Card, Typography, Spin, message, Row, Col, Statistic } from "antd";
import { attendanceAPI } from "../../services/attendanceApi";
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const StudentAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await attendanceAPI.getMyAttendance();
        const data = res.data || res;
        setAttendance(data);
      } catch (error) {
        console.error("Error fetching attendance:", error);
        message.error("Failed to load attendance records.");
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  const columns = [
    {
      title: "Class",
      key: "class",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{record.class_id?.class_name || "Unknown Class"}</div>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.class_id?.subject || "No Subject"}
          </Text>
        </div>
      ),
    },
    {
      title: "Date",
      key: "date",
      render: (_, record) => {
        const dateStr = record.session_id?.date || record.date;
        return dateStr ? dayjs(dateStr).format("MMM D, YYYY") : "N/A";
      },
    },
    {
      title: "Time",
      key: "time",
      render: (_, record) => {
        const start = record.session_id?.start_time;
        const end = record.session_id?.end_time;
        return start && end ? `${start} - ${end}` : "N/A";
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        if (status === "present") return <Tag icon={<CheckCircleOutlined />} color="success">Present</Tag>;
        if (status === "absent") return <Tag icon={<CloseCircleOutlined />} color="error">Absent</Tag>;
        if (status === "late") return <Tag icon={<ClockCircleOutlined />} color="warning">Late</Tag>;
        return <Tag color="default">{status}</Tag>;
      },
    },
  ];

  // Calculate stats
  const total = attendance.length;
  const presentCount = attendance.filter((a) => a.status === "present").length;
  const lateCount = attendance.filter((a) => a.status === "late").length;
  const attendanceRate = total > 0 ? Math.round(((presentCount + (lateCount * 0.5)) / total) * 100) : 0;

  return (
    <div className="dashboard-content">
      <div className="welcome-section">
        <Title level={3} style={{ margin: 0 }}>My Attendance</Title>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: "12px", background: "#f0fdf4" }}>
            <Statistic
              title="Attendance Rate"
              value={attendanceRate}
              suffix="%"
              valueStyle={{ color: "#16a34a", fontWeight: "bold" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card bordered={false} style={{ borderRadius: "12px", background: "#eff6ff" }}>
            <Statistic
              title="Classes Attended"
              value={presentCount}
              suffix={`/ ${total}`}
              valueStyle={{ color: "#2563eb", fontWeight: "bold" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card bordered={false} style={{ borderRadius: "12px", background: "#fef2f2" }}>
            <Statistic
              title="Missed Classes"
              value={total - presentCount - lateCount}
              valueStyle={{ color: "#dc2626", fontWeight: "bold" }}
            />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} style={{ borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
        <Table
          dataSource={attendance}
          columns={columns}
          rowKey={(record) => record._id || Math.random().toString()}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default StudentAttendance;
