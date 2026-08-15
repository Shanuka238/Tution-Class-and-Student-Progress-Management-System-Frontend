import React, { useState, useEffect, useMemo } from "react";
import { Table, Tag, Card, Typography, message, Row, Col, Statistic, Input, Select, Button, theme } from "antd";
import { attendanceAPI } from "../../services/attendanceApi";
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import { formatDate } from "../../utils/dateUtils";

const { Title, Text } = Typography;
const { Option } = Select;

const StudentAttendance = ({ attendance: propAttendance, loading: propLoading }) => {
  const { token: themeToken } = theme.useToken();
  const [attendance, setAttendance] = useState(propAttendance || []);
  const [loading, setLoading] = useState(propLoading !== undefined ? propLoading : true);

  // Filters
  const [searchText, setSearchText] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

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

  // Unique subjects list
  const uniqueSubjects = useMemo(() => {
    const set = new Set();
    attendance.forEach((a) => {
      const subj = a.class_id?.subject || a.class_id?.class_name;
      if (subj) set.add(subj);
    });
    return Array.from(set);
  }, [attendance]);

  const filteredAttendance = useMemo(() => {
    return attendance.filter((item) => {
      const cls = item.class_id || {};
      const status = item.status || "";

      // 1. Status Filter
      if (selectedStatus !== "all" && status !== selectedStatus) {
        return false;
      }

      // 2. Subject Filter
      const subj = cls.subject || cls.class_name || "";
      if (selectedSubject !== "all" && subj !== selectedSubject) {
        return false;
      }

      // 3. Search Query
      if (searchText.trim()) {
        const q = searchText.toLowerCase().trim();
        const className = (cls.class_name || "").toLowerCase();

        if (!className.includes(q) && !subj.toLowerCase().includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [attendance, searchText, selectedSubject, selectedStatus]);

  const resetFilters = () => {
    setSearchText("");
    setSelectedSubject("all");
    setSelectedStatus("all");
  };

  const columns = [
    {
      title: "Class / Subject",
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
      title: "Session Date",
      key: "date",
      render: (_, record) => {
        const dateStr = record.session_id?.date || record.date;
        return formatDate(dateStr);
      },
    },
    {
      title: "Session Time",
      key: "time",
      render: (_, record) => {
        const start = record.session_id?.start_time;
        const end = record.session_id?.end_time;
        return start && end ? `${start} - ${end}` : "N/A";
      },
    },
    {
      title: "Attendance Status",
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

  // Calculate overall stats
  const total = attendance.length;
  const presentCount = attendance.filter((a) => a.status === "present").length;
  const lateCount = attendance.filter((a) => a.status === "late").length;
  const absentCount = attendance.filter((a) => a.status === "absent").length;
  const attendanceRate = total > 0 ? Math.round(((presentCount + (lateCount * 0.5)) / total) * 100) : 0;

  const hasFilters = searchText || selectedSubject !== "all" || selectedStatus !== "all";

  return (
    <div className="dashboard-content">
      <div className="welcome-section" style={{ marginBottom: "20px" }}>
        <Title level={3} style={{ margin: 0, color: themeToken.colorText }}>My Attendance History</Title>
        <Text type="secondary">Review your class attendance percentage, attendance logs, and status records.</Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: "20px" }}>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: "12px", background: "rgba(22, 163, 74, 0.1)", border: "1px solid rgba(22, 163, 74, 0.2)" }}>
            <Statistic
              title={<span style={{ color: themeToken.colorTextDescription }}>Attendance Rate</span>}
              value={attendanceRate}
              suffix="%"
              valueStyle={{ color: "#16a34a", fontWeight: "bold" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: "12px", background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
            <Statistic
              title={<span style={{ color: themeToken.colorTextDescription }}>Sessions Present</span>}
              value={presentCount}
              valueStyle={{ color: "#3b82f6", fontWeight: "bold" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: "12px", background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
            <Statistic
              title={<span style={{ color: themeToken.colorTextDescription }}>Late Arrivals</span>}
              value={lateCount}
              valueStyle={{ color: "#f59e0b", fontWeight: "bold" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: "12px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
            <Statistic
              title={<span style={{ color: themeToken.colorTextDescription }}>Absences</span>}
              value={absentCount}
              valueStyle={{ color: "#ef4444", fontWeight: "bold" }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        bordered={false}
        style={{
          borderRadius: "12px",
          border: `1px solid ${themeToken.colorBorderSecondary}`,
          background: themeToken.colorBgContainer,
        }}
      >
        {/* Attendance Filter Toolbar */}
        <Card
          size="small"
          style={{
            marginBottom: "16px",
            background: themeToken.colorBgLayout,
            borderRadius: "8px",
            border: `1px solid ${themeToken.colorBorderSecondary}`,
          }}
        >
          <Row gutter={[10, 10]} align="middle">
            <Col xs={24} sm={10} md={10}>
              <Input
                prefix={<SearchOutlined style={{ color: "#9CA3AF" }} />}
                placeholder="Search class or subject..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={12} sm={7} md={6}>
              <Select
                style={{ width: "100%" }}
                value={selectedSubject}
                onChange={(val) => setSelectedSubject(val)}
              >
                <Option value="all">All Subjects</Option>
                {uniqueSubjects.map((subj) => (
                  <Option key={subj} value={subj}>
                    {subj}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={12} sm={7} md={5}>
              <Select
                style={{ width: "100%" }}
                value={selectedStatus}
                onChange={(val) => setSelectedStatus(val)}
              >
                <Option value="all">All Statuses</Option>
                <Option value="present">Present Only</Option>
                <Option value="absent">Absent Only</Option>
                <Option value="late">Late Only</Option>
              </Select>
            </Col>
            <Col xs={24} sm={24} md={3} style={{ textAlign: "right" }}>
              {hasFilters && (
                <Button icon={<ReloadOutlined />} onClick={resetFilters} type="text" danger>
                  Reset
                </Button>
              )}
            </Col>
          </Row>
        </Card>

        <Table
          columns={columns}
          dataSource={filteredAttendance}
          rowKey={(record) => record._id || record.id}
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: "No matching attendance records found" }}
        />
      </Card>
    </div>
  );
};

export default StudentAttendance;
