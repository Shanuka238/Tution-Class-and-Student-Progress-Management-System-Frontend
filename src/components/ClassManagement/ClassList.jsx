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
} from "antd";
import {
  PlusOutlined,
  CalendarOutlined,
  TeamOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
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
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [sessionListVisible, setSessionListVisible] = useState(false);
  const [selectedCourseForSessions, setSelectedCourseForSessions] = useState(null);

  // Filters
  const [searchText, setSearchText] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const user = JSON.parse(localStorage.getItem("edutracker_user") || "{}");
  const canManage = user.role === "admin";
  const canEnroll = user.role === "admin";

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await classAPI.getActiveClasses();
      setClasses(response.data || response || []);
    } catch (error) {
      console.error("Error fetching classes:", error);
      message.error(error.message || "Failed to load class timetable data");
    } finally {
      setLoading(false);
    }
  }, []);

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

  const resetFilters = () => {
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

  // Filtered dataset
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

  const columns = [
    {
      title: "Class Details",
      key: "class_details",
      render: (_, record) => (
        <div>
          <div>
            <strong>{record.class_name}</strong>
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
      render: (_, record) => (
        <div>
          <TeamOutlined /> Max: {record.max_students}
        </div>
      ),
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
              onClick={() => handleEnrollStudents(record)}
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
            Class Schedule & Timetables
          </Title>
          <Text type="secondary" style={{ fontSize: "13px" }}>
            Total Classes: {classes.length} | Showing: {filteredClasses.length} records
          </Text>
        </div>
        {canManage && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
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
          {/* Search */}
          <Col xs={24} sm={12} md={8}>
            <Input
              prefix={<SearchOutlined style={{ color: "#9CA3AF" }} />}
              placeholder="Search by Class Name, Subject, Grade..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>

          {/* Subject Filter */}
          <Col xs={12} sm={6} md={5}>
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
          <Col xs={12} sm={6} md={4}>
            <Select
              style={{ width: "100%" }}
              value={selectedGrade}
              onChange={(val) => setSelectedGrade(val)}
            >
              <Option value="all">All Grades</Option>
              {["6", "7", "8", "9", "10", "11", "12"].map((g) => (
                <Option key={g} value={g}>
                  Grade {g}
                </Option>
              ))}
            </Select>
          </Col>

          {/* Status Filter */}
          <Col xs={12} sm={6} md={4}>
            <Select
              style={{ width: "100%" }}
              value={selectedStatus}
              onChange={(val) => setSelectedStatus(val)}
            >
              <Option value="all">All Statuses</Option>
              <Option value="active">Active Only</Option>
              <Option value="archived">Archived Only</Option>
            </Select>
          </Col>

          {/* Reset Filters */}
          <Col xs={12} sm={6} md={3} style={{ textAlign: "right" }}>
            {hasActiveFilters && (
              <Button icon={<ReloadOutlined />} onClick={resetFilters} type="text" danger>
                Reset
              </Button>
            )}
          </Col>
        </Row>
      </Card>

      <Table
        columns={columns}
        dataSource={filteredClasses}
        rowKey="_id"
        loading={loading}
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
        classItem={selectedClass}
        onSuccess={fetchClasses}
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