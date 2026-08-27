import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Drawer,
  Table,
  Button,
  Space,
  Popconfirm,
  Tag,
  message,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Card,
  Tooltip,
  theme,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
  CalendarOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { classAPI } from "../../services/classApi";
import { attendanceAPI } from "../../services/attendanceApi";
import SessionModal from "./SessionModal";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

const { Option } = Select;
const { RangePicker } = DatePicker;

const SessionList = ({ visible, onClose, course, onMarkAttendance, hideManagement }) => {
  const { token: themeToken } = theme.useToken();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionModalVisible, setSessionModalVisible] = useState(false);
  const [markedMap, setMarkedMap] = useState({});

  // --- FILTERS STATE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [markedFilter, setMarkedFilter] = useState("all");
  const [teacherFilter, setTeacherFilter] = useState("all");
  const [venueFilter, setVenueFilter] = useState("all");

  const user = JSON.parse(localStorage.getItem("edutracker_user") || "{}");
  const canManage = user.role === "admin" && !hideManagement;

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

  // Extract unique teachers and venues for filter dropdowns
  const uniqueTeachers = useMemo(() => {
    const map = new Map();
    sessions.forEach((s) => {
      const tUser = s.teacher_id?.user_id;
      if (tUser && s.teacher_id?._id) {
        map.set(String(s.teacher_id._id), `${tUser.first_name} ${tUser.last_name}`);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [sessions]);

  const uniqueVenues = useMemo(() => {
    const set = new Set();
    sessions.forEach((s) => {
      if (s.venue && s.venue.trim()) set.add(s.venue.trim());
    });
    return Array.from(set);
  }, [sessions]);

  // Compute computed status helper
  const getComputedStatus = (record) => {
    if (record.status === "cancelled") return "cancelled";
    if (record.date) {
      const sDate = dayjs(record.date).startOf("day");
      const today = dayjs().startOf("day");
      if (sDate.isBefore(today)) return "held";
      if (sDate.isAfter(today)) return "scheduled";
      if (record.end_time) {
        const [h, m] = String(record.end_time).split(":").map(Number);
        if (!isNaN(h)) {
          const endTime = dayjs().hour(h).minute(m || 0).second(0);
          return dayjs().isAfter(endTime) ? "held" : "scheduled";
        }
      }
    }
    return record.status || "scheduled";
  };

  // Filtered Sessions Memo
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const compStatus = getComputedStatus(s);
      const isMarked = markedMap[s._id] || false;
      const tUser = s.teacher_id?.user_id;
      const teacherName = tUser ? `${tUser.first_name} ${tUser.last_name}`.toLowerCase() : "";
      const venueStr = (s.venue || "").toLowerCase();
      const dateStr = s.date ? dayjs(s.date).format("YYYY-MM-DD dddd").toLowerCase() : "";

      // 1. Text Search (Teacher name, Venue, or Date)
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matches = teacherName.includes(q) || venueStr.includes(q) || dateStr.includes(q);
        if (!matches) return false;
      }

      // 2. Date Range Filter
      if (dateRange && dateRange[0] && dateRange[1]) {
        const sDate = dayjs(s.date);
        const start = dateRange[0].startOf("day");
        const end = dateRange[1].endOf("day");
        if (!sDate.isBetween(start, end, null, "[]")) {
          return false;
        }
      }

      // 3. Status Filter
      if (statusFilter !== "all" && compStatus !== statusFilter) {
        return false;
      }

      // 4. Marked Attendance Filter
      if (markedFilter === "marked" && !isMarked) return false;
      if (markedFilter === "unmarked" && isMarked) return false;

      // 5. Teacher Filter
      if (teacherFilter !== "all") {
        const tId = String(s.teacher_id?._id || s.teacher_id || "");
        if (tId !== teacherFilter) return false;
      }

      // 6. Venue Filter
      if (venueFilter !== "all" && s.venue !== venueFilter) {
        return false;
      }

      return true;
    });
  }, [sessions, searchQuery, dateRange, statusFilter, markedFilter, teacherFilter, venueFilter, markedMap]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    dateRange !== null ||
    statusFilter !== "all" ||
    markedFilter !== "all" ||
    teacherFilter !== "all" ||
    venueFilter !== "all";

  const handleResetFilters = () => {
    setSearchQuery("");
    setDateRange(null);
    setStatusFilter("all");
    setMarkedFilter("all");
    setTeacherFilter("all");
    setVenueFilter("all");
  };

  const columns = [
    {
      title: "Date & Day",
      dataIndex: "date",
      key: "date",
      width: 140,
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
      render: (date) => (
        <div>
          <div style={{ fontWeight: 600 }}>{dayjs(date).format("YYYY-MM-DD")}</div>
          <div style={{ fontSize: "11px", color: "#64748b" }}>{dayjs(date).format("dddd")}</div>
        </div>
      ),
    },
    {
      title: "Time Slot",
      key: "time",
      width: 140,
      render: (_, record) => (
        <Tag color="cyan" style={{ fontWeight: 500, margin: 0 }}>
          {record.start_time || "—"} - {record.end_time || "—"}
        </Tag>
      ),
    },
    {
      title: "Room / Venue",
      dataIndex: "venue",
      key: "venue",
      width: 120,
      render: (venue) => <Tag color="blue">{venue || "Default Hall"}</Tag>,
    },
    {
      title: "Assigned Educator",
      key: "teacher",
      width: 150,
      render: (_, record) => {
        const teacherUser = record.teacher_id?.user_id;
        return teacherUser ? (
          <span style={{ fontWeight: 500 }}>
            {teacherUser.first_name} {teacherUser.last_name}
          </span>
        ) : (
          <span style={{ color: "#94a3b8" }}>Unassigned</span>
        );
      },
    },
    {
      title: "Session Status",
      key: "session_status",
      width: 110,
      render: (_, record) => {
        const statusColors = { scheduled: "blue", held: "green", cancelled: "red" };
        const st = getComputedStatus(record);
        return <Tag color={statusColors[st] || "blue"}>{st.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Attendance",
      key: "attendance_status",
      width: 110,
      render: (_, record) => {
        const isMarked = markedMap[record._id];
        return isMarked ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Marked
          </Tag>
        ) : (
          <Tag color="default">Not Marked</Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: onMarkAttendance ? 160 : 70,
      align: "center",
      render: (_, record) => {
        const isMarked = markedMap[record._id];
        return (
          <Space size="small">
            {onMarkAttendance && (
              <Button
                type={isMarked ? "default" : "primary"}
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => onMarkAttendance(record, isMarked)}
              >
                {isMarked ? "Edit" : "Mark"}
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
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span>Sessions Directory — {course?.class_name}</span>
          <Tag color="geekblue">{course?.subject || "Course"}</Tag>
        </div>
      }
      width={1000}
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
      {/* FILTER CONTROLS BAR */}
      <Card
        size="small"
        style={{
          marginBottom: "16px",
          borderRadius: "8px",
          background: themeToken.colorBgContainer,
          border: `1px solid ${themeToken.colorBorderSecondary}`,
        }}
      >
        <Row gutter={[10, 10]} align="middle">
          {/* 1. Keyword Search */}
          <Col xs={24} sm={12} md={7}>
            <Input
              prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
              placeholder="Search by educator, venue, date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
            />
          </Col>

          {/* 2. Date Range Picker */}
          <Col xs={24} sm={12} md={7}>
            <RangePicker
              style={{ width: "100%" }}
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
              placeholder={["Start Date", "End Date"]}
            />
          </Col>

          {/* 3. Session Status Filter */}
          <Col xs={12} sm={8} md={5}>
            <Select
              style={{ width: "100%" }}
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
            >
              <Option value="all">All Statuses</Option>
              <Option value="scheduled">Scheduled</Option>
              <Option value="held">Held</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </Col>

          {/* 4. Attendance Marked Filter */}
          <Col xs={12} sm={8} md={5}>
            <Select
              style={{ width: "100%" }}
              value={markedFilter}
              onChange={(val) => setMarkedFilter(val)}
            >
              <Option value="all">All Attendance</Option>
              <Option value="marked">Marked</Option>
              <Option value="unmarked">Not Marked</Option>
            </Select>
          </Col>

          {/* 5. Teacher Filter (if course has multiple teachers) */}
          {uniqueTeachers.length > 1 && (
            <Col xs={12} sm={8} md={6}>
              <Select
                style={{ width: "100%" }}
                value={teacherFilter}
                onChange={(val) => setTeacherFilter(val)}
                placeholder="Filter by Educator"
              >
                <Option value="all">All Educators</Option>
                {uniqueTeachers.map((t) => (
                  <Option key={t.id} value={t.id}>
                    {t.name}
                  </Option>
                ))}
              </Select>
            </Col>
          )}

          {/* 6. Venue Filter */}
          {uniqueVenues.length > 1 && (
            <Col xs={12} sm={8} md={5}>
              <Select
                style={{ width: "100%" }}
                value={venueFilter}
                onChange={(val) => setVenueFilter(val)}
                placeholder="Filter by Venue"
              >
                <Option value="all">All Venues</Option>
                {uniqueVenues.map((v) => (
                  <Option key={v} value={v}>
                    {v}
                  </Option>
                ))}
              </Select>
            </Col>
          )}

          {/* Reset Filters */}
          <Col xs={24} sm={8} md={uniqueTeachers.length > 1 ? 3 : 5} style={{ textAlign: "right" }}>
            {hasActiveFilters && (
              <Button
                icon={<ReloadOutlined />}
                onClick={handleResetFilters}
                type="text"
                danger
                size="small"
              >
                Reset Filters
              </Button>
            )}
          </Col>
        </Row>
      </Card>

      {/* SUMMARY CHIPS */}
      <div style={{ marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Space size="small" wrap>
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>
            Showing <strong>{filteredSessions.length}</strong> of {sessions.length} sessions
          </span>
          {hasActiveFilters && <Tag color="orange">Filtered Results</Tag>}
        </Space>

        <Space size="small">
          <Tag color="blue">
            Scheduled: {sessions.filter((s) => getComputedStatus(s) === "scheduled").length}
          </Tag>
          <Tag color="green">
            Held: {sessions.filter((s) => getComputedStatus(s) === "held").length}
          </Tag>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredSessions}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 8, showSizeChanger: true, pageSizeOptions: ["8", "15", "30"] }}
        scroll={{ x: 860 }}
        locale={{ emptyText: "No class sessions match the selected filters" }}

      />

      <SessionModal
        visible={sessionModalVisible}
        onCancel={() => setSessionModalVisible(false)}
        onSuccess={() => {
          setSessionModalVisible(false);
          fetchSessions();
        }}
        course={course}
        courseId={course?._id}
        courseName={course?.class_name}
      />
    </Drawer>
  );
};

export default SessionList;
