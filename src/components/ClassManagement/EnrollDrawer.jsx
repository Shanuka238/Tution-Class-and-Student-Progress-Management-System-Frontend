import { useEffect, useState, useMemo } from "react";
import { Drawer, Table, Input, Button, Typography, message, Progress, Tag } from "antd";
import { SearchOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { adminAPI } from "../../services/adminApi";
import { classAPI } from "../../services/classApi";

const { Text } = Typography;

const EnrollDrawer = ({ visible, onClose, classData, currentlyEnrolledIds = [], onEnrollSuccess }) => {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible && classData) {
      const loadStudents = async () => {
        setLoading(true);
        try {
          const res = await adminAPI.getAllUsers();
          const usersData = res.data || res;
          const students = usersData.filter(item => item.user?.role === "student");
          setAllUsers(students);
          setSelectedRowKeys([]); // Reset choices
        } catch (err) {
          console.error("Error loading students:", err);
          message.error("Failed to load global student registry directory");
        } finally {
          setLoading(false);
        }
      };
      loadStudents();
    }
  }, [visible, classData]);

  const filteredStudents = useMemo(() => {
    if (!classData) return [];

    return allUsers.filter(item => {
      const studentProfile = item.profile || {};
      const studentUser = item.user || {};

      const matchesGrade = String(studentProfile.grade || "").toLowerCase() === String(classData.grade || "").toLowerCase();

      const fullName = `${studentUser.first_name || ""} ${studentUser.last_name || ""}`.toLowerCase();
      const matchesSearch = fullName.includes(searchText.toLowerCase()) ||
        String(studentProfile.student_number || "").toLowerCase().includes(searchText.toLowerCase());

      return matchesGrade && matchesSearch;
    });
  }, [allUsers, classData, searchText]);

  const handleBulkEnrollmentSave = async () => {
    if (selectedRowKeys.length === 0 || !classData) return;

    const enrolledCount = classData.enrolled_count || 0;
    const potentialTotal = enrolledCount + selectedRowKeys.length;

    if (potentialTotal > classData.max_students) {
      return message.error(`Selection exceeds max seating capacity limit (${classData.max_students})!`);
    }

    setSubmitting(true);
    try {
      await Promise.all(
        selectedRowKeys.map(studentId => classAPI.enrollStudent(studentId, classData._id))
      );
      message.success(`Successfully enrolled ${selectedRowKeys.length} students into roster`);
      onEnrollSuccess();
    } catch (err) {
      message.error(err.message || "Enrollment batch transaction failed");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: "Student Number",
      dataIndex: ["profile", "student_number"],
      key: "student_number",
      width: 120,
    },
    {
      title: "Name",
      key: "name",
      render: (_, record) => `${record.user?.first_name} ${record.user?.last_name}`,
    },
    {
      title: "Status",
      key: "status",
      width: 100,
      render: (_, record) => {
        const studentId = record.profile?._id?.toString();

        const isAlreadyEnrolled = classData.enrolled_students?.some(es => {
          return es.id === studentId;
        });

        return isAlreadyEnrolled ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Enrolled
          </Tag>
        ) : null;
      },
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
    getCheckboxProps: (record) => {
      const studentId = record.profile?._id?.toString();
      const isAlreadyEnrolled = classData.enrolled_students?.some(es => es.id === studentId);
      return {
        disabled: isAlreadyEnrolled,
        name: record.user?.first_name,
      };
    },
  };

  if (!classData) return null;

  const enrolledCount = classData.enrolled_count || 0;
  const maxStudents = classData.max_students || 30;
  const selectedCount = selectedRowKeys.length;
  const totalCount = enrolledCount + selectedCount;

  return (
    <Drawer
      title={`Enroll Students — Grade ${classData.grade || ""}`}
      onClose={onClose}
      open={visible}
      width={600}
      extra={
        <Button
          type="primary"
          onClick={handleBulkEnrollmentSave}
          loading={submitting}
          disabled={selectedRowKeys.length === 0}
        >
          Save Enrollment
        </Button>
      }
      styles={{ body: { padding: "16px" } }}
    >
      {/* Dynamic occupancy layout banner inside drawer header space */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <Text type="secondary">Seating Allocation:</Text>
          <Text strong>{totalCount} / {maxStudents}</Text>
        </div>
        <Progress
          percent={Math.min((totalCount / maxStudents) * 100, 100)}
          status={totalCount > maxStudents ? "exception" : "active"}
          showInfo={false}
        />
      </div>

      {/* 🔍 Search Input Handler Bar */}
      <div style={{ marginBottom: "16px" }}>
        <Input
          placeholder="Search students by name or number..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          allowClear
          style={{ width: "100%" }}
        />
      </div>

      {/* Table */}
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={filteredStudents}
        rowKey={(record) => record.profile?._id}
        loading={loading}
        size="small"
        pagination={{ pageSize: 8 }}
        style={{ width: "100%" }}
      />
    </Drawer>
  );
};

export default EnrollDrawer;