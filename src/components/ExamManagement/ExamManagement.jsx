import React, { useState, useEffect } from "react";
import { Card, Select, Button, Space, Typography, Table, Tag, message, theme, Drawer } from "antd";
import { PlusOutlined, FileTextOutlined } from "@ant-design/icons";
import { classAPI } from "../../services/classApi";
import { examAPI } from "../../services/examApi";
import CreateExamModal from "./CreateExamModal";
import ResultManager from "./ResultManager";

const { Title, Text } = Typography;
const { Option } = Select;

const ExamManagement = () => {
  const { token: themeToken } = theme.useToken();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // For managing results
  const [managingExam, setManagingExam] = useState(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchExams(selectedClass);
    } else {
      setExams([]);
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const res = await classAPI.getActiveClasses();
      const data = res.data || res;
      setClasses(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error("Failed to fetch classes");
    }
  };

  const fetchExams = async (classId) => {
    setLoading(true);
    try {
      const res = await examAPI.getExamsByClass(classId);
      const data = res.data || res;
      setExams(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error("Failed to fetch exams");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    setIsModalVisible(false);
    if (selectedClass) {
      fetchExams(selectedClass);
    }
  };

  const columns = [
    {
      title: "Exam Title",
      dataIndex: "exam_title",
      key: "exam_title",
      render: (text) => <span>{text || "Untitled Exam"}</span>,
    },
    {
      title: "Term",
      dataIndex: "term",
      key: "term",
      render: (term) => <Tag color="blue">{term}</Tag>,
    },
    {
      title: "Date",
      dataIndex: "exam_date",
      key: "exam_date",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Total Marks",
      dataIndex: "total_marks",
      key: "total_marks",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<FileTextOutlined />}
          onClick={() => {
            const classObj = classes.find(c => c.class_id === selectedClass || c._id === selectedClass);
            if (!classObj?.enrolled_students || classObj.enrolled_students.length === 0) {
              message.warning("No students enrolled in this class. Enroll students first to manage results.");
              return;
            }
            setManagingExam(record);
          }}
        >
          Manage Results
        </Button>
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Exam Management</Title>
      </div>

      <Space style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", width: "100%" }}>
        <Space>
          <Text strong>Select Class:</Text>
          <Select
            style={{ width: 300 }}
            placeholder="Select a class to view exams"
            onChange={(val) => setSelectedClass(val)}
            value={selectedClass}
          >
            {classes.map((cls) => (
              <Option key={cls.class_id} value={cls.class_id}>
                {cls.class_name} - {cls.subject} (Grade {cls.grade})
              </Option>
            ))}
          </Select>
        </Space>
        
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
          disabled={!selectedClass}
        >
          Create New Exam
        </Button>
      </Space>

      {selectedClass ? (
        <Table 
          columns={columns} 
          dataSource={exams} 
          rowKey="exam_id" 
          loading={loading}
          pagination={false}
        />
      ) : (
        <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
          Please select a class to manage exams
        </div>
      )}

      <CreateExamModal 
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSuccess={handleCreateSuccess}
        classId={selectedClass}
      />

      <Drawer
        title={`Manage Results: ${managingExam?.exam_title || "Untitled Exam"}`}
        width={720}
        onClose={() => setManagingExam(null)}
        open={!!managingExam}
      >
        {managingExam && (
          <ResultManager 
            exam={managingExam} 
            onBack={() => setManagingExam(null)} 
            isDrawer={true}
            enrolledStudents={
              classes.find(c => c.class_id === selectedClass || c._id === selectedClass)?.enrolled_students || []
            }
          />
        )}
      </Drawer>
    </div>
  );
};

export default ExamManagement;
