import { useEffect, useState, useCallback } from "react";
import { Table, Button, Tag, message, Typography, theme, Popconfirm, Space } from "antd";
import { PlusOutlined, CalendarOutlined, TeamOutlined, DeleteOutlined } from "@ant-design/icons";
import { classAPI } from "../../services/classApi";
import ClassModal from "./ClassModal";
import EnrollDrawer from "./EnrollDrawer";
import SessionList from "./SessionList";
import dayjs from "dayjs";

const { Title } = Typography;

const ClassList = () => {
  const { token: themeToken } = theme.useToken();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [sessionListVisible, setSessionListVisible] = useState(false);
  const [selectedCourseForSessions, setSelectedCourseForSessions] = useState(null);

  const user = JSON.parse(localStorage.getItem("edutracker_user") || "{}");
  const canManage = user.role === "admin";
  const canEnroll = ["admin", "teacher"].includes(user.role);

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await classAPI.getActiveClasses();
      setClasses(response.data || response);
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

  const handleDropStudent = async (studentId, classId, studentName) => {
    try {
      await classAPI.dropStudent(studentId, classId);
      message.success(`${studentName} has been removed from the class`);
      fetchClasses();
    } catch (error) {
      console.error("Error removing student:", error);
      message.error(error.message || "Failed to remove student from class");
    }
  };

  const toggleEnrolledStudents = (classId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(classId)) {
      newExpanded.delete(classId);
    } else {
      newExpanded.add(classId);
    }
    setExpandedRows(newExpanded);
  };

  const columns = [
    {
      title: "Class Details",
      key: "class_details",
      render: (_, record) => (
        <div>
          <div><strong>{record.class_name}</strong></div>
          <div style={{ fontSize: "12px", color: themeToken.colorTextSecondary }}>{record.subject} • Grade {record.grade}</div>
        </div>
      ),
    },
    {
      title: "Active Dates",
      key: "active_dates",
      render: (_, record) => (
        <div style={{ fontSize: "13px" }}>
          <div>Start: {record.start_date ? dayjs(record.start_date).format("MMM DD, YYYY") : "N/A"}</div>
          <div style={{ color: themeToken.colorTextSecondary }}>End: {record.end_date ? dayjs(record.end_date).format("MMM DD, YYYY") : "N/A"}</div>
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
              description={`Are you sure you want to delete "${record.class_name}"? This will also remove all student enrollments for this class.`}
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

  return (
    <div style={{
      padding: "24px",
      background: themeToken.colorBgContainer,
      borderRadius: "8px",
      border: `1px solid ${themeToken.colorBorderSecondary}`
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
        <Title level={3} style={{ margin: 0, color: themeToken.colorText }}>Class Schedule & Timetables</Title>
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

      <Table
        columns={columns}
        dataSource={classes}
        rowKey="_id"
        loading={loading}
        expandable={{
          expandedRowRender: (record) => (
            <div>
              {record.enrolled_count > 0 ? (
                <Table
                  columns={[
                    { title: "Student Number", dataIndex: "student_number" },
                    { title: "Name", dataIndex: "name" },
                    { title: "Email", dataIndex: "email" },
                    {
                      title: "Action",
                      key: "action",
                      render: (_, student) => (
                        canEnroll && (
                          <Popconfirm
                            title="Remove Student"
                            description={`Are you sure you want to remove ${student.name} from this class?`}
                            onConfirm={() => handleDropStudent(student.id, record._id, student.name)}
                            okText="Yes, Remove"
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
                        )
                      ),
                    },
                  ]}
                  dataSource={record.enrolled_students || []}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              ) : (
                <p style={{ color: themeToken.colorTextSecondary }}>No students enrolled yet</p>
              )}
            </div>
          ),
          expandedRowKeys: Array.from(expandedRows),
          onExpand: (expanded, record) => toggleEnrolledStudents(record._id)
        }}
      />

      <ClassModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSuccess={() => { setModalVisible(false); fetchClasses(); }}
      />

      {selectedClass && (
        <EnrollDrawer
          visible={drawerVisible}
          onClose={() => {
            setDrawerVisible(false);
            setSelectedClass(null);
          }}
          classData={selectedClass}
          onEnrollSuccess={() => { setDrawerVisible(false); fetchClasses(); }}
        />
      )}

      <SessionList
        visible={sessionListVisible}
        onClose={() => setSessionListVisible(false)}
        course={selectedCourseForSessions}
      />
    </div>
  );
};

export default ClassList;