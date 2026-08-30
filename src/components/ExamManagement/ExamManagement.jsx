import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  Select,
  Button,
  Space,
  Typography,
  Table,
  Tag,
  message,
  theme,
  Drawer,
  Input,
  Row,
  Col,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  FileTextOutlined,
  SearchOutlined,
  ReloadOutlined,
  BookOutlined,
  CalendarOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { classAPI } from "../../services/classApi";
import { examAPI } from "../../services/examApi";
import CreateExamModal from "./CreateExamModal";
import EditExamModal from "./EditExamModal";
import ResultManager from "./ResultManager";
import { formatDate } from "../../utils/dateUtils";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

const ExamManagement = () => {
  const { token: themeToken } = theme.useToken();
  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [managingExam, setManagingExam] = useState(null);

  // Filters
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedTerm, setSelectedTerm] = useState("all");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchText, setSearchText] = useState("");

  const user = JSON.parse(localStorage.getItem("edutracker_user") || "{}");
  const canCreate = user.role === "admin" || user.role === "teacher";

  const handleDeleteExam = async (examId) => {
    try {
      await examAPI.deleteExam(examId);
      message.success("Exam and associated results deleted successfully");
      fetchAllExams();
    } catch (error) {
      message.error(error.message || "Failed to delete exam");
    }
  };


  const fetchClasses = useCallback(async () => {
    try {
      const res = await classAPI.getActiveClasses();
      const data = res.data || res;
      setClasses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
    }
  }, []);

  const fetchAllExams = useCallback(async () => {
    setLoading(true);
    try {
      const res = await examAPI.getAllExams();
      const data = res.data || res;
      setExams(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch exams:", error);
      message.error("Failed to load exam directory");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
    fetchAllExams();
  }, [fetchClasses, fetchAllExams]);

  const handleCreateSuccess = () => {
    setIsModalVisible(false);
    fetchAllExams();
  };

  const resetFilters = () => {
    setSelectedClass("all");
    setSelectedTerm("all");
    setSelectedGrade("all");
    setSelectedStatus("all");
    setSearchText("");
  };

  // Filtered exams dataset
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const classId = exam.class_id?._id || exam.class_id?.id || exam.class_id;
      const classObj = classes.find((c) => (c._id || c.class_id) === classId) || (exam.class_id && typeof exam.class_id === "object" ? exam.class_id : {}) || {};

      // 1. Class Filter
      if (selectedClass !== "all" && classId !== selectedClass) {
        return false;
      }

      // 2. Term Filter
      if (selectedTerm !== "all" && exam.term !== selectedTerm) {
        return false;
      }

      // 3. Grade Filter
      const grade = classObj.grade;
      if (selectedGrade !== "all") {
        if (!grade || String(grade) !== String(selectedGrade)) {
          return false;
        }
      }

      // 4. Status Filter (Upcoming vs Conducted)
      if (selectedStatus !== "all") {
        let isUpcoming = true;
        if (exam.exam_date) {
          const examDateStr = dayjs(exam.exam_date).format("YYYY-MM-DD");
          const endTimeStr = exam.end_time || "23:59";
          const examEndDateTime = dayjs(`${examDateStr} ${endTimeStr}`);
          isUpcoming = examEndDateTime.isValid() ? examEndDateTime.isAfter(dayjs()) : dayjs(exam.exam_date).isAfter(dayjs());
        }
        if (selectedStatus === "upcoming" && !isUpcoming) return false;
        if (selectedStatus === "conducted" && isUpcoming) return false;
      }

      // 5. Search text (Title, Subject, Class Name)
      if (searchText.trim()) {
        const q = searchText.toLowerCase().trim();
        const title = (exam.exam_title || "").toLowerCase();
        const className = (classObj.class_name || "").toLowerCase();
        const subject = (classObj.subject || "").toLowerCase();

        if (!title.includes(q) && !className.includes(q) && !subject.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [exams, classes, selectedClass, selectedTerm, selectedGrade, selectedStatus, searchText]);

  const columns = [
    {
      title: "Exam Details",
      key: "exam_title",
      render: (_, record) => {
        let isUpcoming = true;
        if (record.exam_date) {
          const examDateStr = dayjs(record.exam_date).format("YYYY-MM-DD");
          const endTimeStr = record.end_time || "23:59";
          const examEndDateTime = dayjs(`${examDateStr} ${endTimeStr}`);
          isUpcoming = examEndDateTime.isValid() ? examEndDateTime.isAfter(dayjs()) : dayjs(record.exam_date).isAfter(dayjs());
        }
        return (
          <div>
            <div style={{ fontWeight: 600, fontSize: "14px" }}>
              {record.exam_title || "Untitled Exam"}
            </div>
            <div style={{ fontSize: "12px", color: themeToken.colorTextSecondary }}>
              Term: <Tag color="blue">{record.term || "General"}</Tag>
              {isUpcoming ? (
                <Tag color="cyan">Upcoming</Tag>
              ) : (
                <Tag color="green">Conducted</Tag>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: "Class / Course Batch",
      key: "class",
      render: (_, record) => {
        const classId = record.class_id?._id || record.class_id?.id || record.class_id;
        const classObj = classes.find((c) => (c._id || c.class_id) === classId) || (record.class_id && typeof record.class_id === "object" ? record.class_id : null);

        if (!classObj) return <Text type="secondary">N/A</Text>;

        return (
          <div>
            <div style={{ fontWeight: 500 }}>
              <BookOutlined style={{ marginRight: 6, color: "#4F46E5" }} />
              {classObj.class_name || "Untitled Course"}
            </div>
            <div style={{ fontSize: "12px", color: themeToken.colorTextSecondary }}>
              {classObj.subject || "General"} {classObj.grade ? `• Grade ${classObj.grade}` : ""}
            </div>
          </div>
        );
      },
    },
    {
      title: "Exam Date & Time",
      dataIndex: "exam_date",
      key: "exam_date",
      render: (date, record) => (
        <div>
          <Space size="small">
            <CalendarOutlined style={{ color: "#4F46E5" }} />
            <span style={{ fontWeight: 500 }}>{formatDate(date)}</span>
          </Space>
          {(record.start_time || record.end_time) && (
            <div style={{ fontSize: "12px", color: themeToken.colorTextSecondary, marginTop: "2px" }}>
              <ClockCircleOutlined style={{ marginRight: "4px" }} />
              {record.start_time || "09:00"} - {record.end_time || "11:00"}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Total Marks",
      dataIndex: "total_marks",
      key: "total_marks",
      render: (marks) => <Tag color="purple">{marks || 100} Marks</Tag>,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => {
        const classId = record.class_id?._id || record.class_id?.id || record.class_id;
        const classObj = classes.find((c) => (c._id || c.class_id) === classId) || (record.class_id && typeof record.class_id === "object" ? record.class_id : null);
        const examId = record.exam_id || record._id;

        return (
          <Space size="small">
            <Button
              type="primary"
              size="small"
              icon={<FileTextOutlined />}
              style={{ background: "#4F46E5" }}
              onClick={() => {
                if (!classObj?.enrolled_students || classObj.enrolled_students.length === 0) {
                  message.warning("No enrolled students found in this class yet. Enroll students to record exam marks.");
                  return;
                }
                setManagingExam(record);
              }}
            >
              Results
            </Button>

            {canCreate && (
              <>
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => setEditingExam(record)}
                  title="Edit Exam Schedule (Name, Date, Time)"
                />

                <Popconfirm
                  title="Delete Examination"
                  description="Are you sure you want to delete this exam? All student marks for this exam will also be permanently deleted."
                  onConfirm={() => handleDeleteExam(examId)}
                  okText="Yes, Delete"
                  cancelText="Cancel"
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    size="small"
                    danger
                    type="text"
                    icon={<DeleteOutlined />}
                    title="Delete Exam"
                  />
                </Popconfirm>
              </>
            )}
          </Space>
        );
      },
    },

  ];

  const hasActiveFilters =
    selectedClass !== "all" ||
    selectedTerm !== "all" ||
    selectedGrade !== "all" ||
    selectedStatus !== "all" ||
    searchText;

  const managingExamClassObj = useMemo(() => {
    if (!managingExam) return null;
    const classId = managingExam.class_id?._id || managingExam.class_id?.id || managingExam.class_id;
    return classes.find((c) => (c._id || c.class_id) === classId) || (managingExam.class_id && typeof managingExam.class_id === "object" ? managingExam.class_id : null);
  }, [managingExam, classes]);

  return (
    <div
      style={{
        padding: "24px",
        background: themeToken.colorBgContainer,
        borderRadius: "8px",
        border: `1px solid ${themeToken.colorBorderSecondary}`,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Exam & Assessment Management
          </Title>
          <Text type="secondary" style={{ fontSize: "13px" }}>
            Total Assessments: {exams.length} | Showing: {filteredExams.length} records
          </Text>
        </div>

        {canCreate && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
            style={{ background: "#4F46E5" }}
          >
            Create New Exam
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
          <Col xs={24} sm={12} md={7}>
            <Input
              prefix={<SearchOutlined style={{ color: "#9CA3AF" }} />}
              placeholder="Search by Exam Title, Class, Subject..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>

          {/* Class Filter */}
          <Col xs={12} sm={6} md={5}>
            <Select
              style={{ width: "100%" }}
              value={selectedClass}
              onChange={(val) => setSelectedClass(val)}
            >
              <Option value="all">All Classes</Option>
              {classes.map((cls) => (
                <Option key={cls.class_id || cls._id} value={cls.class_id || cls._id}>
                  {cls.class_name} (Grade {cls.grade})
                </Option>
              ))}
            </Select>
          </Col>

          {/* Term Filter */}
          <Col xs={12} sm={6} md={3}>
            <Select
              style={{ width: "100%" }}
              value={selectedTerm}
              onChange={(val) => setSelectedTerm(val)}
            >
              <Option value="all">All Terms</Option>
              <Option value="Term 1">Term 1</Option>
              <Option value="Term 2">Term 2</Option>
              <Option value="Term 3">Term 3</Option>
            </Select>
          </Col>

          {/* Grade Filter */}
          <Col xs={12} sm={6} md={3}>
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
          <Col xs={12} sm={6} md={3}>
            <Select
              style={{ width: "100%" }}
              value={selectedStatus}
              onChange={(val) => setSelectedStatus(val)}
            >
              <Option value="all">All Status</Option>
              <Option value="upcoming">Upcoming</Option>
              <Option value="conducted">Conducted</Option>
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

      {/* Main Exams Table */}
      <Table
        columns={columns}
        dataSource={filteredExams}
        rowKey={(record) => record.exam_id || record._id}
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true }}
      />

      {/* Modal for Creating New Exam */}
      <CreateExamModal
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSuccess={handleCreateSuccess}
        classId={selectedClass}
        classes={classes}
      />

      {/* Modal for Editing Exam Schedule (Name, Date, Time) */}
      <EditExamModal
        visible={!!editingExam}
        exam={editingExam}
        onCancel={() => setEditingExam(null)}
        onSuccess={() => {
          setEditingExam(null);
          fetchAllExams();
        }}
      />


      {/* Drawer for Managing Results */}
      <Drawer
        title={`Manage Results: ${managingExam?.exam_title || "Untitled Exam"}`}
        width={740}
        onClose={() => setManagingExam(null)}
        open={!!managingExam}
      >
        {managingExam && (
          <ResultManager
            exam={managingExam}
            onBack={() => setManagingExam(null)}
            isDrawer={true}
            enrolledStudents={managingExamClassObj?.enrolled_students || []}
          />
        )}
      </Drawer>
    </div>
  );
};

export default ExamManagement;
