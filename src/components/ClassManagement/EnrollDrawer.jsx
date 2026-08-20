import { useEffect, useState, useMemo } from "react";
import { Drawer, Table, Input, Button, Typography, message, Progress, Tag, Space } from "antd";
import { SearchOutlined, CheckCircleOutlined, UserAddOutlined } from "@ant-design/icons";
import { adminAPI } from "../../services/adminApi";
import { classAPI } from "../../services/classApi";

const { Text } = Typography;

const EnrollDrawer = ({ visible, onClose, classData, classItem, onEnrollSuccess, onSuccess }) => {
  const activeClass = classData || classItem;
  const handleSuccessCallback = onEnrollSuccess || onSuccess;

  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible && activeClass) {
      const loadStudents = async () => {
        setLoading(true);
        try {
          const res = await adminAPI.getAllUsers();
          const usersData = res.data || res || [];
          const students = Array.isArray(usersData)
            ? usersData.filter(item => item.user?.role === "student" && item.profile)
            : [];
          setAllUsers(students);
          setSelectedRowKeys([]); // Reset choices
        } catch (err) {
          console.error("Error loading students:", err);
          message.error("Failed to load student directory");
        } finally {
          setLoading(false);
        }
      };
      loadStudents();
    }
  }, [visible, activeClass]);

  const filteredStudents = useMemo(() => {
    if (!activeClass) return [];

    return allUsers.filter(item => {
      const studentProfile = item.profile || {};
      const studentUser = item.user || {};

      // Match target grade if specified on class
      const classGrade = String(activeClass.grade || "").toLowerCase();
      const studentGrade = String(studentProfile.grade || "").toLowerCase();
      const matchesGrade = !classGrade || studentGrade === classGrade;

      const fullName = `${studentUser.first_name || ""} ${studentUser.last_name || ""}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchText.toLowerCase()) ||
        String(studentProfile.student_number || "").toLowerCase().includes(searchText.toLowerCase()) ||
        String(studentUser.email || "").toLowerCase().includes(searchText.toLowerCase());

      return matchesGrade && matchesSearch;
    });
  }, [allUsers, activeClass, searchText]);

  const handleBulkEnrollmentSave = async () => {
    if (selectedRowKeys.length === 0 || !activeClass) return;

    const enrolledCount = activeClass.enrolled_count || (activeClass.enrolled_students?.length || 0);
    const potentialTotal = enrolledCount + selectedRowKeys.length;
    const maxLimit = activeClass.max_students || 30;

    if (potentialTotal > maxLimit) {
      return message.error(`Selection exceeds max seating capacity limit (${maxLimit})!`);
    }

    setSubmitting(true);
    try {
      await Promise.all(
        selectedRowKeys.map(studentId => classAPI.enrollStudent(studentId, activeClass._id || activeClass.class_id))
      );
      message.success(`Successfully enrolled ${selectedRowKeys.length} student(s) into class`);
      if (handleSuccessCallback) {
        handleSuccessCallback();
      }
      onClose();
    } catch (err) {
      console.error("Enrollment error:", err);
      message.error(err.message || "Enrollment batch transaction failed");
    } finally {
      setSubmitting(false);
    }
  };

  const isStudentEnrolled = (record) => {
    if (!activeClass || !activeClass.enrolled_students) return false;
    const studentId = record.profile?._id?.toString() || record.profile?.id?.toString();
    return activeClass.enrolled_students.some(es => {
      const esId = (es.id || es._id || es)?.toString();
      return esId === studentId;
    });
  };

  const columns = [
    {
      title: "Student No.",
      dataIndex: ["profile", "student_number"],
      key: "student_number",
      width: 140,
      render: (num) => <Tag color="blue">{num || "N/A"}</Tag>,
    },
    {
      title: "Full Name",
      key: "name",
      render: (_, record) => (
        <div>
          <Text strong>{record.user?.first_name} {record.user?.last_name}</Text>
          <div style={{ fontSize: "11px", color: "#888" }}>{record.user?.email}</div>
        </div>
      ),
    },
    {
      title: "Grade",
      dataIndex: ["profile", "grade"],
      key: "grade",
      width: 90,
      render: (g) => `Grade ${g || "N/A"}`,
    },
    {
      title: "Status",
      key: "status",
      width: 110,
      render: (_, record) => {
        const enrolled = isStudentEnrolled(record);
        return enrolled ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Enrolled
          </Tag>
        ) : (
          <Tag color="default">Available</Tag>
        );
      },
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
    getCheckboxProps: (record) => ({
      disabled: isStudentEnrolled(record),
      name: record.user?.first_name,
    }),
  };

  if (!activeClass) return null;

  const enrolledCount = activeClass.enrolled_count || (activeClass.enrolled_students?.length || 0);
  const maxStudents = activeClass.max_students || 30;
  const selectedCount = selectedRowKeys.length;
  const totalCount = enrolledCount + selectedCount;

  return (
    <Drawer
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <UserAddOutlined style={{ color: "#4F46E5" }} />
          <span>Enroll Students — {activeClass.class_name} (Grade {activeClass.grade || ""})</span>
        </div>
      }
      onClose={onClose}
      open={visible}
      width={640}
      extra={
        <Button
          type="primary"
          onClick={handleBulkEnrollmentSave}
          loading={submitting}
          disabled={selectedRowKeys.length === 0}
          style={{ background: "#4F46E5" }}
        >
          Confirm Enrollment ({selectedRowKeys.length})
        </Button>
      }
      styles={{ body: { padding: "16px" } }}
    >
      {/* Seating Allocation Progress Bar */}
      <div style={{ marginBottom: "16px", padding: "12px", background: "rgba(79, 70, 229, 0.05)", borderRadius: "8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
          <Text type="secondary">Seating Capacity Allocation:</Text>
          <Text strong style={{ color: totalCount > maxStudents ? "#EF4444" : "#4F46E5" }}>
            {totalCount} / {maxStudents} Seats {selectedCount > 0 && `(+${selectedCount} selected)`}
          </Text>
        </div>
        <Progress
          percent={Math.min(Math.round((totalCount / maxStudents) * 100), 100)}
          status={totalCount > maxStudents ? "exception" : "active"}
          strokeColor={totalCount > maxStudents ? "#EF4444" : "#4F46E5"}
        />
      </div>

      {/* Search Input */}
      <div style={{ marginBottom: "14px" }}>
        <Input
          placeholder="Search students by name, email, or student number..."
          prefix={<SearchOutlined style={{ color: "#9CA3AF" }} />}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          allowClear
          style={{ width: "100%" }}
        />
      </div>

      {/* Students Table */}
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={filteredStudents}
        rowKey={(record) => record.profile?._id}
        loading={loading}
        size="small"
        pagination={{ pageSize: 8, showSizeChanger: false }}
        style={{ width: "100%" }}
      />
    </Drawer>
  );
};

export default EnrollDrawer;