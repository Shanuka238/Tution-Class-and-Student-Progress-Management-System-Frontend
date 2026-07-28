import React, { useState, useEffect } from "react";
import { Table, Tag, Card, Typography, Spin, message, Row, Col, Statistic, theme } from "antd";
import { attendanceAPI } from "../../services/attendanceApi";
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { formatDate } from "../../utils/dateUtils";

const { Title, Text } = Typography;

const StudentAttendance = ({ attendance: propAttendance, loading: propLoading }) => {
  const { token: themeToken } = theme.useToken();
  const [attendance, setAttendance] = useState(propAttendance || []);
  const [loading, setLoading] = useState(propLoading !== undefined ? propLoading : true);

  useEffect(() => {
    if (propAttendance !== undefined) {
      setAttendance(propAttendance);
      if (propLoading !== undefined) setLoading(propLoading);
      return;
    }

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
  }, [propAttendance, propLoading]);

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
        return formatDate(dateStr);
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
          <Card bordered={false} style={{ borderRadius: "12px", background: "rgba(22, 163, 74, 0.1)", border: "1px solid rgba(22, 163, 74, 0.2)" }}>
            <Statistic
              title={<span style={{ color: themeToken.colorTextDescription }}>Attendance Rate</span>}
              value={attendanceRate}
              suffix="%"
              valueStyle={{ color: "#16a34a", fontWeight: "bold" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card bordered={false} style={{ borderRadius: "12px", background: "rgba(37, 99, 235, 0.1)", border: "1px solid rgba(37, 99, 235, 0.2)" }}>
            <Statistic
              title={<span style={{ color: themeToken.colorTextDescription }}>Classes Attended</span>}
              value={presentCount}
              suffix={`/ ${total}`}
              valueStyle={{ color: "#2563eb", fontWeight: "bold" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card bordered={false} style={{ borderRadius: "12px", background: "rgba(220, 38, 38, 0.1)", border: "1px solid rgba(220, 38, 38, 0.2)" }}>
            <Statistic
              title={<span style={{ color: themeToken.colorTextDescription }}>Missed Classes</span>}
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
