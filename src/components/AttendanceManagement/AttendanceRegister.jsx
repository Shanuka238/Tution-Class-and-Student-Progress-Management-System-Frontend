import React, { useState, useMemo } from "react";
import { Table, Tag, Input, Select, Button, Card, Row, Col, Typography, Pagination, Space, theme } from "antd";
import { SearchOutlined, ReloadOutlined, LeftOutlined, RightOutlined, CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { STATUS_LABELS, STATUS_COLORS } from "../../enums/attendanceStatus";

const { Option } = Select;
const { Text } = Typography;

const SESSIONS_PER_PAGE = 5;

const AttendanceRegister = ({ students = [], sessions = [], attendanceRecords = [] }) => {
  const { token: themeToken } = theme.useToken();

  // Filters
  const [searchText, setSearchText] = useState("");
  const [attendanceRateFilter, setAttendanceRateFilter] = useState("all");
  const [selectedSessionDate, setSelectedSessionDate] = useState("all");

  // Date Column Pagination state
  const [sessionPage, setSessionPage] = useState(1);

  const attendanceMap = useMemo(() => {
    const map = {};
    attendanceRecords.forEach((rec) => {
      const studentId = rec.student_id?._id || rec.student_id;
      const sessionId = rec.session_id?._id || rec.session_id;
      map[`${studentId}_${sessionId}`] = rec.status;
    });
    return map;
  }, [attendanceRecords]);

  // Filtered Sessions if single date filter selected
  const activeSessions = useMemo(() => {
    if (selectedSessionDate === "all") return sessions;
    return sessions.filter((s) => s.date === selectedSessionDate);
  }, [sessions, selectedSessionDate]);

  // Sliced 5 Days Attendance Columns per page
  const totalSessionPages = Math.ceil(activeSessions.length / SESSIONS_PER_PAGE) || 1;

  const displayedSessions = useMemo(() => {
    if (selectedSessionDate !== "all") return activeSessions;
    const start = (sessionPage - 1) * SESSIONS_PER_PAGE;
    return activeSessions.slice(start, start + SESSIONS_PER_PAGE);
  }, [activeSessions, sessionPage, selectedSessionDate]);

  // Filtered Students list
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const user = student.user_data || student.user || {};
      const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim().toLowerCase();
      const studentNum = (student.student_number || "").toLowerCase();
      const email = (user.email || "").toLowerCase();

      // 1. Search text filter
      if (searchText.trim()) {
        const q = searchText.trim().toLowerCase();
        if (!fullName.includes(q) && !studentNum.includes(q) && !email.includes(q)) {
          return false;
        }
      }

      // Calculate attendance rate for rate filter
      const studentId = student._id;
      let presentCount = 0;
      let totalMarked = 0;

      sessions.forEach((sess) => {
        const status = attendanceMap[`${studentId}_${sess._id}`];
        if (status) {
          totalMarked++;
          if (status === "present" || status === "late") {
            presentCount++;
          }
        }
      });

      const percentage = totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : 0;

      // 2. Attendance Rate Filter
      if (attendanceRateFilter === "high" && percentage < 75) {
        return false;
      }
      if (attendanceRateFilter === "low" && percentage >= 75) {
        return false;
      }

      return true;
    });
  }, [students, searchText, attendanceRateFilter, sessions, attendanceMap]);

  const resetFilters = () => {
    setSearchText("");
    setAttendanceRateFilter("all");
    setSelectedSessionDate("all");
    setSessionPage(1);
  };

  const columns = [
    {
      title: "Student Details",
      key: "student",
      fixed: "left",
      width: 190,
      render: (_, record) => {
        const user = record.user_data || record.user || {};
        return (
          <div>
            <strong style={{ color: themeToken.colorText }}>
              {user.first_name} {user.last_name}
            </strong>
            <div style={{ fontSize: "11px", color: themeToken.colorTextSecondary }}>
              {record.student_number || "No ID"}
            </div>
          </div>
        );
      },
    },
    ...displayedSessions.map((sess) => ({
      title: (
        <div style={{ textAlign: "center" }}>
          <div>{dayjs(sess.date).format("DD MMM")}</div>
          <div style={{ fontSize: "10px", fontWeight: "normal", color: themeToken.colorTextSecondary }}>
            {dayjs(sess.date).format("ddd")}
          </div>
        </div>
      ),
      key: sess._id,
      width: 100,
      align: "center",
      render: (_, record) => {
        const studentId = record._id;
        const status = attendanceMap[`${studentId}_${sess._id}`];
        if (!status) return <span style={{ color: themeToken.colorTextQuaternary }}>—</span>;

        return (
          <Tag color={STATUS_COLORS[status]} style={{ margin: 0 }}>
            {STATUS_LABELS[status]}
          </Tag>
        );
      },
    })),
    {
      title: "Overall Summary",
      key: "summary",
      fixed: "right",
      width: 130,
      align: "center",
      render: (_, record) => {
        const studentId = record._id;
        let presentCount = 0;
        let totalMarked = 0;

        sessions.forEach((sess) => {
          const status = attendanceMap[`${studentId}_${sess._id}`];
          if (status) {
            totalMarked++;
            if (status === "present" || status === "late") {
              presentCount++;
            }
          }
        });

        if (totalMarked === 0) return <span style={{ color: themeToken.colorTextSecondary }}>No data</span>;
        const percentage = Math.round((presentCount / totalMarked) * 100);

        return (
          <div>
            <strong>{presentCount}/{totalMarked}</strong>
            <div style={{ fontSize: "11px", marginTop: "2px" }}>
              <Tag color={percentage >= 75 ? "success" : "warning"}>{percentage}%</Tag>
            </div>
          </div>
        );
      },
    },
  ];

  const hasFilters = searchText || attendanceRateFilter !== "all" || selectedSessionDate !== "all";

  // Calculate session date range strings for pagination header
  const firstSessionDate = displayedSessions[0] ? dayjs(displayedSessions[0].date).format("DD MMM") : "";
  const lastSessionDate = displayedSessions[displayedSessions.length - 1]
    ? dayjs(displayedSessions[displayedSessions.length - 1].date).format("DD MMM")
    : "";

  return (
    <div>
      {/* Search & Filter Toolbar */}
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
          <Col xs={24} sm={10} md={9}>
            <Input
              prefix={<SearchOutlined style={{ color: "#9CA3AF" }} />}
              placeholder="Search student by name or ID..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={7} md={7}>
            <Select
              style={{ width: "100%" }}
              value={attendanceRateFilter}
              onChange={(val) => setAttendanceRateFilter(val)}
            >
              <Option value="all">All Attendance Rates</Option>
              <Option value="high">High Attendance (&ge;75%)</Option>
              <Option value="low">Needs Attention (&lt;75%)</Option>
            </Select>
          </Col>
          <Col xs={12} sm={7} md={5}>
            <Select
              style={{ width: "100%" }}
              value={selectedSessionDate}
              onChange={(val) => {
                setSelectedSessionDate(val);
                setSessionPage(1);
              }}
            >
              <Option value="all">All Session Dates</Option>
              {sessions.map((sess) => (
                <Option key={sess._id} value={sess.date}>
                  {dayjs(sess.date).format("DD MMM YYYY")}
                </Option>
              ))}
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

      {/* 5 Days Attendance Column Slicing Bar */}
      {selectedSessionDate === "all" && activeSessions.length > 0 && (
        <Card
          size="small"
          style={{
            marginBottom: "12px",
            borderRadius: "8px",
            background: `${themeToken.colorPrimary}08`,
            border: `1px solid ${themeToken.colorPrimary}25`,
          }}
        >
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <CalendarOutlined style={{ color: themeToken.colorPrimary }} />
                <Text strong style={{ fontSize: "13px" }}>
                  Session Dates (5 Days / Page):
                </Text>
                <Tag color="blue" style={{ margin: 0, fontWeight: 600 }}>
                  {firstSessionDate} — {lastSessionDate}
                </Tag>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  ({activeSessions.length} total sessions recorded)
                </Text>
              </Space>
            </Col>
            <Col>
              <Space>
                <Button
                  size="small"
                  icon={<LeftOutlined />}
                  disabled={sessionPage === 1}
                  onClick={() => setSessionPage((prev) => Math.max(prev - 1, 1))}
                >
                  Prev 5 Days
                </Button>
                <Text style={{ fontSize: "12px", fontWeight: 600 }}>
                  Page {sessionPage} of {totalSessionPages}
                </Text>
                <Button
                  size="small"
                  icon={<RightOutlined />}
                  disabled={sessionPage >= totalSessionPages}
                  onClick={() => setSessionPage((prev) => Math.min(prev + 1, totalSessionPages))}
                >
                  Next 5 Days
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>
      )}

      <Table
        columns={columns}
        dataSource={filteredStudents}
        rowKey="_id"
        pagination={{
          pageSize: 20,
          showSizeChanger: false,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} students`,
        }}
        scroll={{ x: "max-content" }}
        size="middle"
        bordered
        locale={{ emptyText: "No matching student attendance records found" }}
      />
    </div>
  );
};

export default AttendanceRegister;
