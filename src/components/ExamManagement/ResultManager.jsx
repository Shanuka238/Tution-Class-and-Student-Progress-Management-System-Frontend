import React, { useState, useEffect } from "react";
import { Card, Table, Button, InputNumber, Space, Typography, message, Tag } from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { classAPI } from "../../services/classApi";
import { examAPI } from "../../services/examApi";

const { Title, Text } = Typography;

const ResultManager = ({ exam, onBack, isDrawer = false, enrolledStudents = [] }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [marks, setMarks] = useState({});
  const [resultsMap, setResultsMap] = useState({});

  const enrolledStudentsLength = enrolledStudents ? enrolledStudents.length : 0;

  useEffect(() => {
    fetchStudentsAndResults();
  }, [exam.exam_id, enrolledStudentsLength]);

  const fetchStudentsAndResults = async () => {
    setLoading(true);
    try {
      if (enrolledStudents && enrolledStudents.length > 0) {
        setStudents(enrolledStudents);
      } else {
        // Fallback to fetch if not provided as prop
        const classRes = await classAPI.getEnrolledStudents(exam.class_id);
        let enrolled = classRes.data || classRes;
        
        if (enrolled.length > 0 && enrolled[0].student_id) {
          enrolled = enrolled.map(e => e.student_id);
        }
        setStudents(enrolled);
      }

      // Fetch existing results for this exam
      const resultsRes = await examAPI.getResultsByExam(exam.exam_id);
      const existingResults = resultsRes.data || resultsRes;
      
      const initialMarks = {};
      const initialResults = {};
      existingResults.forEach(r => {
        const sId = r.student_id?.student_id || r.student_id?._id || r.student_id;
        initialMarks[sId] = r.marks_obtained;
        initialResults[sId] = r;
      });
      setMarks(initialMarks);
      setResultsMap(initialResults);
    } catch (error) {
      message.error("Failed to load students or results");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkChange = (studentId, val) => {
    setMarks(prev => ({ ...prev, [studentId]: val }));
  };

  const handleSave = async () => {
    const resultsData = students
      .filter(s => {
        const sId = s.student_id || s.id || s._id;
        return marks[sId] !== undefined && marks[sId] !== null;
      })
      .map(s => {
        const sId = s.student_id || s.id || s._id;
        return {
          student_id: sId,
          marks_obtained: marks[sId],
        };
      });

    if (resultsData.length === 0) {
      message.warning("No marks entered to save");
      return;
    }

    setSaving(true);
    try {
      await examAPI.submitBulkResults(exam.exam_id, resultsData);
      message.success("Results saved successfully! Grades and ranks auto-calculated.");
      await fetchStudentsAndResults();
    } catch (error) {
      message.error("Failed to save results");
    } finally {
      setSaving(false);
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case "A": return "green";
      case "B": return "blue";
      case "C": return "orange";
      case "S": return "warning";
      case "F": return "red";
      default: return "default";
    }
  };

  const columns = [
    {
      title: "Student Name",
      key: "name",
      render: (_, record) => {
        if (record.name) return <Text strong>{record.name}</Text>;
        const user = record.user_id || {};
        return <Text strong>{user.first_name} {user.last_name}</Text>;
      },
    },
    {
      title: "Student Number",
      dataIndex: "student_number",
      key: "student_number",
    },
    {
      title: "Marks Obtained",
      key: "marks",
      render: (_, record) => {
        const sId = record.student_id || record.id || record._id;
        return (
          <InputNumber 
            min={0} 
            max={exam.total_marks}
            value={marks[sId]}
            onChange={(val) => handleMarkChange(sId, val)}
            style={{ width: "120px" }}
            placeholder={`out of ${exam.total_marks}`}
          />
        );
      },
    },
    {
      title: "Grade",
      key: "grade",
      render: (_, record) => {
        const sId = record.student_id || record.id || record._id;
        const res = resultsMap[sId];
        return res ? <Tag color={getGradeColor(res.grade)}>{res.grade}</Tag> : "—";
      },
    },
    {
      title: "Class Rank",
      key: "rank",
      render: (_, record) => {
        const sId = record.student_id || record.id || record._id;
        const res = resultsMap[sId];
        if (!res) return "—";
        let suffix = "th";
        if (res.rank === 1) suffix = "st";
        else if (res.rank === 2) suffix = "nd";
        else if (res.rank === 3) suffix = "rd";
        return <Text strong>{res.rank}{suffix}</Text>;
      },
    },
  ];

  const content = (
    <>
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Space>
          <Tag color="blue">Term: {exam.term}</Tag>
          <Tag color="purple">Total Marks: {exam.total_marks}</Tag>
        </Space>
        
        <Button 
          type="primary" 
          icon={<SaveOutlined />} 
          onClick={handleSave}
          loading={saving}
        >
          Save Marks & Auto-Calculate
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={students} 
        rowKey={(record) => record.student_id || record.id || record._id} 
        loading={loading}
        pagination={false}
      />
    </>
  );

  if (isDrawer) {
    return <div style={{ padding: "8px 0" }}>{content}</div>;
  }

  return (
    <div style={{ padding: "24px" }}>
      <Space style={{ marginBottom: 24, width: "100%", justifyContent: "space-between" }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={onBack}>Back</Button>
          <Title level={3} style={{ margin: 0 }}>
            Manage Results: {exam.exam_title}
          </Title>
        </Space>
      </Space>

      <Card>
        {content}
      </Card>
    </div>
  );
};

export default ResultManager;
