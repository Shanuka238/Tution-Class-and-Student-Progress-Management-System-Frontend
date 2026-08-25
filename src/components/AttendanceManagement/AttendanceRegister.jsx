import React, { useState, useMemo } from "react";
import {
  Table,
  Tag,
  Input,
  Select,
  Button,
  Card,
  Row,
  Col,
  Typography,
  Space,
  Tooltip,
  DatePicker,
  theme,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  LeftOutlined,
  RightOutlined,
  CalendarOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { STATUS_LABELS, STATUS_COLORS } from "../../enums/attendanceStatus";

dayjs.extend(isBetween);

const { Option } = Select;
const { Text } = Typography;
const { RangePicker } = DatePicker;

const SESSIONS_PER_PAGE = 5;

const AttendanceRegister = ({ students = [], sessions = [], attendanceRecords = [] }) => {
  const { token: themeToken } = theme.useToken();

  // Filters State
  const [searchText, setSearchText] = useState("");
  const [attendanceRateFilter, setAttendanceRateFilter] = useState("all");
  const [selectedSessionId, setSelectedSessionId] = useState("all");
  const [sessionDateRange, setSessionDateRange] = useState(null);
  const [sessionMarkStatusFilter, setSessionMarkStatusFilter] = useState("all");
  const [educatorFilter, setEducatorFilter] = useState("all");

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

  // Extract unique educators across sessions
  const uniqueEducators = useMemo(() => {
    const map = new Map();
    sessions.forEach((s) => {
      const tUser = s.teacher_id?.user_id;
      if (tUser && s.teacher_id?._id) {
        map.set(String(s.teacher_id._id), `${tUser.first_name} ${tUser.last_name}`);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [sessions]);

  // Filtered Sessions by Date Range and Educator
  const filteredSessionsPool = useMemo(() => {
    return sessions.filter((s) => {
      // 1. Date Range Filter
      if (sessionDateRange && sessionDateRange[0] && sessionDateRange[1]) {
        const sDate = dayjs(s.date);
        const start = sessionDateRange[0].startOf("day");
        const end = sessionDateRange[1].endOf("day");
        if (!sDate.isBetween(start, end, null, "[]")) {
          return false;
        }
      }

      // 2. Educator Filter
      if (educatorFilter !== "all") {
        const tId = String(s.teacher_id?._id || s.teacher_id || "");
        if (tId !== educatorFilter) return false;
      }

      return true;
    });
  }, [sessions, sessionDateRange, educatorFilter]);

  // Active Sessions (either single session or filtered pool)
  const activeSessions = useMemo(() => {
    if (selectedSessionId === "all") return filteredSessionsPool;
    return filteredSessionsPool.filter((s) => s._id === selectedSessionId);
  }, [filteredSessionsPool, selectedSessionId]);

  // Sliced 5 Days Attendance Columns per page
  const totalSessionPages = Math.ceil(activeSessions.length / SESSIONS_PER_PAGE) || 1;

  const displayedSessions = useMemo(() => {
    if (selectedSessionId !== "all") return activeSessions;
    const start = (sessionPage - 1) * SESSIONS_PER_PAGE;
    return activeSessions.slice(start, start + SESSIONS_PER_PAGE);
  }, [activeSessions, sessionPage, selectedSessionId]);

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

      // Calculate attendance rate
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

      // 3. Filter by Specific Status in Selected Session
      if (selectedSessionId !== "all" && sessionMarkStatusFilter !== "all") {
        const markStatus = attendanceMap[`${studentId}_${selectedSessionId}`];
        if (sessionMarkStatusFilter === "unmarked" && markStatus) return false;
        if (sessionMarkStatusFilter !== "unmarked" && markStatus !== sessionMarkStatusFilter) return false;
      }

      return true;
    });
  }, [
    students,
    searchText,
    attendanceRateFilter,
    selectedSessionId,
    sessionMarkStatusFilter,
    sessions,
    attendanceMap,
  ]);

  const hasFilters =
    searchText.trim() !== "" ||
    attendanceRateFilter !== "all" ||
    selectedSessionId !== "all" ||
    sessionDateRange !== null ||
    sessionMarkStatusFilter !== "all" ||
    educatorFilter !== "all";

  const resetFilters = () => {
    setSearchText("");
    setAttendanceRateFilter("all");
    setSelectedSessionId("all");
    setSessionDateRange(null);
    setSessionMarkStatusFilter("all");
    setEducatorFilter("all");
    setSessionPage(1);
  };

  const columns = [
    {
      title: "Student Details",
      key: "student",
      fixed: "left",
      width: 200,
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
        <Tooltip
          title={
            <div style={{ fontSize: "12px" }}>
              <div><strong>Date:</strong> {dayjs(sess.date).format("DD MMM YYYY (dddd)")}</div>
              <div><strong>Time:</strong> {sess.start_time || "—"} - {sess.end_time || "—"}</div>
              {sess.venue && <div><strong>Venue:</strong> {sess.venue}</div>}
              {sess.teacher_id?.user_id && (
                <div>
                  <strong>Educator:</strong> {sess.teacher_id.user_id.first_name} {sess.teacher_id.user_id.last_name}
                </div>
              )}
            </div>
          }
        >
          <div style={{ textAlign: "center", cursor: "pointer", padding: "2px 0" }}>
            <div style={{ fontWeight: 600, fontSize: "13px" }}>{dayjs(sess.date).format("DD MMM")}</div>
            <div style={{ fontSize: "11px", color: themeToken.colorTextSecondary }}>
              {dayjs(sess.date).format("ddd")}
            </div>
            {sess.start_time && sess.end_time ? (
              <Tag
                color="blue"
                style={{
                  margin: "4px 0 0 0",
                  fontSize: "10px",
                  padding: "0 4px",
                  lineHeight: "16px",
                  borderRadius: "4px",
                  fontWeight: 500,
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {sess.start_time} - {sess.end_time}
              </Tag>
            ) : sess.venue ? (
              <Tag
                color="purple"
                style={{
                  margin: "4px 0 0 0",
                  fontSize: "10px",
                  padding: "0 4px",
                  lineHeight: "16px",
                  borderRadius: "4px",
                }}
              >
                {sess.venue}
              </Tag>
            ) : null}
          </div>
        </Tooltip>
      ),
      key: sess._id,
      width: 120,
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

  // Calculate session date range strings for pagination header
  const firstSessionDate = displayedSessions[0] ? dayjs(displayedSessions[0].date).format("DD MMM YYYY") : "";
  const lastSessionDate = displayedSessions[displayedSessions.length - 1]
    ? dayjs(displayedSessions[displayedSessions.length - 1].date).format("DD MMM YYYY")
    : "";

  return (
    <div>
      {/* Search & Filter Toolbar */}
      <Card
        size="small"
        style={{
          marginBottom: "16px",
          background: themeToken.colorBgContainer,
          borderRadius: "8px",
          border: `1px solid ${themeToken.colorBorderSecondary}`,
        }}
      >
        <Row gutter={[12, 10]} align="middle">
          {/* 1. Student Name / ID Search */}
          <Col xs={24} sm={12} md={7}>
            <Input
              prefix={<SearchOutlined style={{ color: "#9CA3AF" }} />}
              placeholder="Search student by name or ID..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>

          {/* 2. Session Date Range Filter */}
          <Col xs={24} sm={12} md={7}>
            <RangePicker
              style={{ width: "100%" }}
              value={sessionDateRange}
              onChange={(dates) => {
                setSessionDateRange(dates);
                setSessionPage(1);
              }}
              placeholder={["Start Date", "End Date"]}
            />
          </Col>

          {/* 3. Session Selector */}
          <Col xs={12} sm={8} md={5}>
            <Select
              style={{ width: "100%" }}
              value={selectedSessionId}
              onChange={(val) => {
                setSelectedSessionId(val);
                setSessionPage(1);
                setSessionMarkStatusFilter("all");
              }}
              placeholder="All Sessions"
            >
              <Option value="all">All Sessions ({filteredSessionsPool.length})</Option>
              {filteredSessionsPool.map((sess) => (
                <Option key={sess._id} value={sess._id}>
                  {dayjs(sess.date).format("DD MMM")} {sess.start_time ? `(${sess.start_time}-${sess.end_time})` : ""}
                </Option>
              ))}
            </Select>
          </Col>

          {/* 4. Overall Attendance Rate Filter */}
          <Col xs={12} sm={8} md={5}>
            <Select
              style={{ width: "100%" }}
              value={attendanceRateFilter}
              onChange={(val) => setAttendanceRateFilter(val)}
            >
              <Option value="all">All Rates</Option>
              <Option value="high">High (&ge;75%)</Option>
              <Option value="low">Needs Attention (&lt;75%)</Option>
            </Select>
          </Col>

          {/* 5. Educator Filter (if multiple) */}
          {uniqueEducators.length > 1 && (
            <Col xs={12} sm={8} md={5}>
              <Select
                style={{ width: "100%" }}
                value={educatorFilter}
                onChange={(val) => {
                  setEducatorFilter(val);
                  setSessionPage(1);
                }}
                placeholder="Filter by Educator"
              >
                <Option value="all">All Educators</Option>
                {uniqueEducators.map((e) => (
                  <Option key={e.id} value={e.id}>
                    {e.name}
                  </Option>
                ))}
              </Select>
            </Col>
          )}

          {/* 6. Mark Status in Selected Session (Shown when a specific session is selected) */}
          {selectedSessionId !== "all" && (
            <Col xs={12} sm={8} md={5}>
              <Select
                style={{ width: "100%" }}
                value={sessionMarkStatusFilter}
                onChange={(val) => setSessionMarkStatusFilter(val)}
                placeholder="Mark Status"
              >
                <Option value="all">All Marks</Option>
                <Option value="present">Present Only</Option>
                <Option value="absent">Absent Only</Option>
                <Option value="late">Late Only</Option>
                <Option value="unmarked">Unmarked</Option>
              </Select>
            </Col>
          )}

          {/* Reset Filters */}
          {hasFilters && (
            <Col xs={24} sm={8} md={4} style={{ textAlign: "right", marginLeft: "auto" }}>
              <Button icon={<ReloadOutlined />} onClick={resetFilters} type="text" danger size="small">
                Reset Filters
              </Button>
            </Col>
          )}
        </Row>
      </Card>

      {/* Sleek Session Columns Window Banner */}
      {selectedSessionId === "all" && activeSessions.length > 0 && (
        <div
          style={{
            marginBottom: "14px",
            padding: "8px 14px",
            borderRadius: "8px",
            background: `${themeToken.colorPrimary}0c`,
            border: `1px solid ${themeToken.colorPrimary}22`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <CalendarOutlined style={{ color: themeToken.colorPrimary, fontSize: "14px" }} />
            <Text strong style={{ fontSize: "13px" }}>
              Session Window:
            </Text>
            <Tag color="blue" style={{ margin: 0, fontWeight: 600, fontSize: "12px" }}>
              {firstSessionDate} — {lastSessionDate}
            </Tag>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              ({activeSessions.length} {activeSessions.length === 1 ? "session" : "sessions"} matching)
            </Text>
          </div>

          {totalSessionPages > 1 ? (
            <Space size="small">
              <Button
                size="small"
                icon={<LeftOutlined />}
                disabled={sessionPage === 1}
                onClick={() => setSessionPage((prev) => Math.max(prev - 1, 1))}
              >
                Prev 5 Days
              </Button>
              <Tag color="default" style={{ margin: 0, fontWeight: 600 }}>
                Page {sessionPage} of {totalSessionPages}
              </Tag>
              <Button
                size="small"
                icon={<RightOutlined />}
                disabled={sessionPage >= totalSessionPages}
                onClick={() => setSessionPage((prev) => Math.min(prev + 1, totalSessionPages))}
              >
                Next 5 Days
              </Button>
            </Space>
          ) : (
            <Tag color="success" style={{ margin: 0, fontSize: "11px" }}>
              All {activeSessions.length} sessions displayed
            </Tag>
          )}
        </div>
      )}

      {/* Summary Chips */}
      <div style={{ marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Space size="small">
          <Text type="secondary" style={{ fontSize: "12px" }}>
            Showing <strong>{filteredStudents.length}</strong> of {students.length} students
          </Text>
          {hasFilters && <Tag color="orange">Filtered View</Tag>}
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredStudents}
        rowKey="_id"
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} students`,
        }}
        scroll={{ x: "max-content" }}
        size="middle"
        bordered
        locale={{ emptyText: "No student records match the selected filters" }}
      />
    </div>
  );
};

export default AttendanceRegister;
