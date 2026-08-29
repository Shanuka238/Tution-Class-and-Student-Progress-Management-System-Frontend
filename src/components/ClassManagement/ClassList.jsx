import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Table,
  Button,
  Tag,
  Input,
  Select,
  Row,
  Col,
  Card,
  message,
  Typography,
  theme,
  Popconfirm,
  Space,
  Progress,
  Empty,
} from "antd";
import {
  PlusOutlined,
  CalendarOutlined,
  TeamOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
} from "@ant-design/icons";
import { classAPI } from "../../services/classApi";
import ClassModal from "./ClassModal";
import EnrollDrawer from "./EnrollDrawer";
import SessionList from "./SessionList";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

const ClassList = () => {
  const { token: themeToken } = theme.useToken();
  const [classes, setClasses] = useState([]);
  const [teacherSessions, setTeacherSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [sessionListVisible, setSessionListVisible] = useState(false);
  const [selectedCourseForSessions, setSelectedCourseForSessions] = useState(null);
  const [droppingStudentId, setDroppingStudentId] = useState(null);

  // Filters
  const [selectedCourseId, setSelectedCourseId] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const user = JSON.parse(localStorage.getItem("edutracker_user") || "{}");
  const isTeacher = user.role === "teacher";
  const canManage = user.role === "admin";
  const canEnroll = user.role === "admin";

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await classAPI.getActiveClasses();
      const loadedClasses = response.data || response || [];
      setClasses(loadedClasses);

      if (isTeacher) {
        // Fetch all timetable sessions for the teacher across their assigned courses
        const allSessions = [];
        for (const cls of loadedClasses) {
          try {
            const sessRes = await classAPI.getCourseSessions(cls._id);
            const sessList = sessRes.data || sessRes || [];
            if (Array.isArray(sessList)) {
              sessList.forEach((s) => {
                allSessions.push({
                  ...s,
                  course_name: cls.class_name || cls.subject || "Class",
                  course_subject: cls.subject,
                  course_grade: cls.grade,
                  course_data: cls,
                });
              });
            }
          } catch {
            // Non-blocking
          }
        }
        allSessions.sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix());
        setTeacherSessions(allSessions);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      message.error(error.message || "Failed to load class timetable data");
    } finally {
      setLoading(false);
    }
  }, [isTeacher]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handleEnrollStudents = (classRecord) => {
    setSelectedClass(classRecord);
    setDrawerVisible(true);
  };

  const handleDeleteClass = async (classId, className) => {
    try {
      await classAPI.deleteClass(classId);
      message.success(`Class "${className}" deleted successfully`);
      fetchClasses();
    } catch (error) {
      console.error("Error deleting class:", error);
      message.error(error.message || "Failed to delete class");
    }
  };

  const handleDropStudent = async (studentId, classId) => {
    setDroppingStudentId(studentId);
    try {
      await classAPI.dropStudent(studentId, classId);
      message.success("Student removed from class successfully");
      await fetchClasses();
    } catch (error) {
      console.error("Error dropping student:", error);
      message.error(error.message || "Failed to drop student from class");
    } finally {
      setDroppingStudentId(null);
    }
  };

  const resetFilters = () => {
    setSelectedCourseId("all");
    setSearchText("");
    setSelectedSubject("all");
    setSelectedGrade("all");
    setSelectedStatus("all");
  };

  // Unique subjects list for filter dropdown
  const uniqueSubjects = useMemo(() => {
    const set = new Set();
    classes.forEach((c) => {
      if (c.subject) set.add(c.subject);
    });
    return Array.from(set);
  }, [classes]);

  // Filtered dataset for Teachers (Sessions Table)
  const filteredTeacherSessions = useMemo(() => {
    if (!isTeacher) return [];
    return teacherSessions.filter((s) => {
      if (selectedCourseId !== "all") {
        const cId = String(s.course_id?._id || s.course_id || s.course_data?._id || "");
        if (cId !== String(selectedCourseId)) return false;
      }
      if (selectedSubject !== "all" && s.course_subject !== selectedSubject) {
        return false;
      }
      if (selectedGrade !== "all" && String(s.course_grade) !== String(selectedGrade)) {
        return false;
      }
      if (selectedStatus !== "all") {
        const sStatus = s.status || "scheduled";
        if (sStatus !== selectedStatus) return false;
      }
      if (searchText.trim()) {
        const q = searchText.toLowerCase().trim();
        const courseName = (s.course_name || "").toLowerCase();
        const subject = (s.course_subject || "").toLowerCase();
        const venue = (s.venue || "").toLowerCase();
        if (!courseName.includes(q) && !subject.includes(q) && !venue.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [isTeacher, teacherSessions, selectedCourseId, selectedSubject, selectedGrade, selectedStatus, searchText]);

  // Filtered dataset for Admins (Classes Table)
  const filteredClasses = useMemo(() => {
    return classes.filter((item) => {
      // 1. Subject Filter
      if (selectedSubject !== "all" && item.subject !== selectedSubject) {
        return false;
      }

      // 2. Grade Filter
      if (selectedGrade !== "all" && String(item.grade) !== String(selectedGrade)) {
        return false;
      }

      // 3. Status Filter
      if (selectedStatus !== "all") {
        const isActiveStr = item.is_active ? "active" : "archived";
        if (isActiveStr !== selectedStatus) return false;
      }

      // 4. Search text (Class name, Subject, Grade)
      if (searchText.trim()) {
        const q = searchText.toLowerCase().trim();
        const className = (item.class_name || "").toLowerCase();
        const subject = (item.subject || "").toLowerCase();
        const grade = String(item.grade || "").toLowerCase();

        if (!className.includes(q) && !subject.includes(q) && !grade.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [classes, searchText, selectedSubject, selectedGrade, selectedStatus]);

  // Columns for Teacher Sessions Table
  const teacherSessionColumns = [
    {
      title: "Course / Class Name",
      key: "course_name",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: "14px", color: themeToken.colorText }}>
            {record.course_name}
          </div>
          <div style={{ fontSize: "12px", color: themeToken.colorTextSecondary }}>
            {record.course_subject} • Grade {record.course_grade}
          </div>
        </div>
      ),
    },
    {
      title: "Session Date & Day",
      dataIndex: "date",
      key: "date",
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
      render: (date) => (
        <div>
          <div style={{ fontWeight: 600 }}>{dayjs(date).format("MMM DD, YYYY")}</div>
          <div style={{ fontSize: "12px", color: themeToken.colorTextSecondary }}>
            {dayjs(date).format("dddd")}
          </div>
        </div>
      ),
    },
    {
      title: "Time Window",
      key: "time",
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
      render: (venue) => <Tag color="blue">{venue || "Default Hall"}</Tag>,
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        let isPast = false;
        if (record.date) {
          const dateStr = dayjs(record.date).format("YYYY-MM-DD");
          const endTime = record.end_time || "23:59";
          const sessionEnd = dayjs(`${dateStr} ${endTime}`);
          isPast = sessionEnd.isValid() ? sessionEnd.isBefore(dayjs()) : dayjs(record.date).isBefore(dayjs());
        }
        return (
          <Tag color={isPast ? "green" : "blue"}>
            {isPast ? "HELD" : "SCHEDULED"}
          </Tag>
        );
      },
    },
  ];

  const columns = [
    {
      title: "Class Details",
      key: "class_details",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: "14px" }}>
            {record.class_name}
          </div>
          <div style={{ fontSize: "12px", color: themeToken.colorTextSecondary }}>
            {record.subject} • Grade {record.grade}
          </div>
        </div>
      ),
    },
    {
      title: "Active Dates",
      key: "active_dates",
      render: (_, record) => (
        <div style={{ fontSize: "13px" }}>
          <div>Start: {record.start_date ? dayjs(record.start_date).format("MMM DD, YYYY") : "N/A"}</div>
          <div style={{ color: themeToken.colorTextSecondary }}>
            End: {record.end_date ? dayjs(record.end_date).format("MMM DD, YYYY") : "N/A"}
          </div>
        </div>
      ),
    },
    {
      title: "Enrollment Capacity",
      key: "capacity",
      render: (_, record) => {
        const enrolled = record.enrolled_count ?? (record.enrolled_students?.length || 0);
        const max = record.max_students || 30;
        const pct = Math.min(Math.round((enrolled / max) * 100), 100);
        const isFull = enrolled >= max;

        return (
          <div style={{ minWidth: 140 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: "13px", fontWeight: 600 }}>
                <TeamOutlined style={{ marginRight: 6, color: "#4F46E5" }} />
                {enrolled} / {max}
              </span>
              <Tag color={isFull ? "error" : pct >= 80 ? "warning" : "success"} style={{ marginRight: 0 }}>
                {isFull ? "Full" : `${max - enrolled} left`}
              </Tag>
            </div>
            <Progress percent={pct} size="small" showInfo={false} strokeColor={isFull ? "#EF4444" : "#4F46E5"} />
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "status",
      render: (isActive) => (
        <Tag color={isActive ? "success" : "error"}>
          {isActive ? "Active" : "Archived"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          {canEnroll && (
            <Button
              type="primary"
              size="small"
              icon={<UserAddOutlined />}
              onClick={() => handleEnrollStudents(record)}
              style={{ background: "#4F46E5" }}
            >
              Enroll Students
            </Button>
          )}
          <Button
            size="small"
            icon={<CalendarOutlined />}
            onClick={() => {
              setSelectedCourseForSessions(record);
              setSessionListVisible(true);
            }}
          >
            Sessions
          </Button>
          {canManage && (
            <Popconfirm
              title="Delete Class"
              description={`Are you sure you want to delete "${record.class_name}"?`}
              onConfirm={() => handleDeleteClass(record._id, record.class_name)}
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
      ),
    },
  ];

  // Expandable row rendering enrolled students list
  const expandedRowRender = (record) => {
    const students = record.enrolled_students || [];

    const studentColumns = [
      {
        title: "Student No.",
        dataIndex: "student_number",
        key: "student_number",
        width: 140,
        render: (num) => <Tag color="blue">{num || "N/A"}</Tag>,
      },
      {
        title: "Student Full Name",
        dataIndex: "name",
        key: "name",
        render: (text) => <Text strong>{text || "Student"}</Text>,
      },
      {
        title: "Email Address",
        dataIndex: "email",
        key: "email",
        render: (text) => <Text type="secondary">{text || "N/A"}</Text>,
      },
      ...(canManage
        ? [
            {
              title: "Action",
              key: "action",
              width: 100,
              render: (_, studentRecord) => (
                <Popconfirm
                  title="Remove Student"
                  description={`Are you sure you want to remove ${studentRecord.name || "this student"} from "${record.class_name}"?`}
                  onConfirm={() =>
                    handleDropStudent(
                      studentRecord.id || studentRecord._id,
                      record._id || record.class_id
                    )
                  }
                  okText="Yes, Remove"
                  okType="danger"
                >
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<UserDeleteOutlined />}
                    loading={droppingStudentId === (studentRecord.id || studentRecord._id)}
                  >
                    Drop
                  </Button>
                </Popconfirm>
              ),
            },
          ]
        : []),
    ];

    return (
      <div
        style={{
          padding: "16px 20px",
          background: themeToken.colorBgLayout,
          borderRadius: "8px",
          border: `1px solid ${themeToken.colorBorderSecondary}`,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          <div>
            <Text strong style={{ fontSize: "14px", color: themeToken.colorText }}>
              <TeamOutlined style={{ marginRight: "6px" }} />
              Enrolled Students Roster ({students.length} / {record.max_students || 30})
            </Text>

            <div style={{ fontSize: "12px", color: themeToken.colorTextSecondary }}>
              Class: {record.class_name} • Grade {record.grade}
            </div>
          </div>

          {canEnroll && (
            <Button
              type="primary"
              size="small"
              icon={<UserAddOutlined />}
              onClick={() => handleEnrollStudents(record)}
              style={{ background: "#4F46E5" }}
            >
              + Enroll Students
            </Button>
          )}
        </div>

        {students.length > 0 ? (
          <Table
            columns={studentColumns}
            dataSource={students}
            rowKey={(s) => s.id || s._id || s.student_number}
            pagination={false}
            size="small"
            bordered
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                No students currently enrolled in this class.{" "}
                {canEnroll && (
                  <Button
                    type="link"
                    size="small"
                    onClick={() => handleEnrollStudents(record)}
                  >
                    Enroll Students Now
                  </Button>
                )}
              </span>
            }
          />
        )}
      </div>
    );
  };

  const hasActiveFilters =
    searchText || selectedSubject !== "all" || selectedGrade !== "all" || selectedStatus !== "all";

  return (
    <div
      style={{
        padding: "24px",
        background: themeToken.colorBgContainer,
        borderRadius: "8px",
        border: `1px solid ${themeToken.colorBorderSecondary}`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <Title level={3} style={{ margin: 0, color: themeToken.colorText }}>
            {isTeacher ? "Scheduled Class Sessions" : "Class Schedule & Timetables"}
          </Title>
          <Text type="secondary" style={{ fontSize: "13px" }}>
            {isTeacher
              ? `Total Sessions: ${teacherSessions.length} | Showing: ${filteredTeacherSessions.length} records`
              : `Total Classes: ${classes.length} | Showing: ${filteredClasses.length} records`}
          </Text>
        </div>
        {canManage && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
            style={{ background: "#4F46E5" }}
          >
            Schedule New Class
          </Button>
        )}
      </div>

      {/* Filter Toolbar */}
      <Card
        size="small"
        style={{
          marginBottom: "20px",
          background: themeToken.colorBgLayout,
          borderRadius: "8px",
          border: `1px solid ${themeToken.colorBorderSecondary}`,
        }}
      >
        <Row gutter={[12, 12]} align="middle">
          {/* Course Selector for Teachers */}
          {isTeacher && (
            <Col xs={24} sm={12} md={7}>
              <Select
                style={{ width: "100%" }}
                value={selectedCourseId}
                onChange={(val) => setSelectedCourseId(val)}
                placeholder="Filter by Assigned Course..."
              >
                <Option value="all">All Assigned Courses ({classes.length})</Option>
                {classes.map((cls) => {
                  const enrolled = cls.enrolled_count ?? (cls.enrolled_students?.length || 0);
                  const max = cls.max_students || 30;
                  return (
                    <Option key={cls._id} value={cls._id}>
                      {cls.class_name} • {enrolled}/{max} Enrolled
                    </Option>
                  );
                })}
              </Select>
            </Col>
          )}

          {/* Search */}
          <Col xs={24} sm={12} md={isTeacher ? 5 : 8}>
            <Input
              prefix={<SearchOutlined style={{ color: "#9CA3AF" }} />}
              placeholder="Search by Class, Subject, Venue..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>

          {/* Subject Filter */}
          <Col xs={12} sm={6} md={isTeacher ? 4 : 5}>
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

          {/* Grade Filter */}
          <Col xs={12} sm={6} md={isTeacher ? 3 : 4}>
            <Select
              style={{ width: "100%" }}
              value={selectedGrade}
              onChange={(val) => setSelectedGrade(val)}
            >
              <Option value="all">All Grades</Option>
              {["6", "7", "8", "9", "10", "11", "12", "13"].map((g) => (
                <Option key={g} value={g}>
                  Grade {g}
                </Option>
              ))}
            </Select>
          </Col>

          {/* Status Filter */}
          <Col xs={12} sm={6} md={isTeacher ? 3 : 4}>
            <Select
              style={{ width: "100%" }}
              value={selectedStatus}
              onChange={(val) => setSelectedStatus(val)}
            >
              <Option value="all">All Statuses</Option>
              <Option value={isTeacher ? "scheduled" : "active"}>
                {isTeacher ? "Scheduled" : "Active"}
              </Option>
              <Option value={isTeacher ? "held" : "archived"}>
                {isTeacher ? "Held" : "Archived"}
              </Option>
            </Select>
          </Col>

          {/* Reset Filters */}
          <Col xs={12} sm={6} md={2} style={{ textAlign: "right" }}>
            {hasActiveFilters && (
              <Button icon={<ReloadOutlined />} onClick={resetFilters} type="text" danger>
                Reset
              </Button>
            )}
          </Col>
        </Row>
      </Card>

      <Table
        columns={isTeacher ? teacherSessionColumns : columns}
        dataSource={isTeacher ? filteredTeacherSessions : filteredClasses}
        rowKey={isTeacher ? (s) => s._id || `${s.date}_${s.start_time}` : "_id"}
        loading={loading}
        expandable={
          !isTeacher
            ? {
                expandedRowRender,
                rowExpandable: () => true,
              }
            : undefined
        }
      />

      <ClassModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSuccess={() => {
          setModalVisible(false);
          fetchClasses();
        }}
      />

      <EnrollDrawer
        visible={drawerVisible}
        onClose={() => {
          setDrawerVisible(false);
          setSelectedClass(null);
        }}
        classData={selectedClass}
        onEnrollSuccess={fetchClasses}
      />

      {sessionListVisible && (
        <SessionList
          visible={sessionListVisible}
          onClose={() => {
            setSessionListVisible(false);
            setSelectedCourseForSessions(null);
          }}
          course={selectedCourseForSessions}
        />
      )}
    </div>
  );
};

export default ClassList;