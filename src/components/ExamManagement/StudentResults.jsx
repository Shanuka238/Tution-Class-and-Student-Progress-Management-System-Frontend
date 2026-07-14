import React, { useState, useEffect } from "react";
import { Card, Table, Typography, message, Tag, theme } from "antd";
import { examAPI } from "../../services/examApi";

const { Title, Text } = Typography;

const StudentResults = () => {
  const { token: themeToken } = theme.useToken();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMyResults();
  }, []);

  const fetchMyResults = async () => {
    setLoading(true);
    try {
      const res = await examAPI.getMyResults();
      const data = res.data || res;
      setResults(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error("Failed to fetch results");
    } finally {
      setLoading(false);
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
      title: "Class / Subject",
      key: "class",
      render: (_, record) => {
        const cls = record.exam_id?.class_id || {};
        return (
          <div>
            <Text strong>{cls.class_name || "Unknown Class"}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {cls.subject}
            </Text>
          </div>
        );
      },
    },
    {
      title: "Exam",
      key: "exam",
      render: (_, record) => {
        const exam = record.exam_id || {};
        return (
          <div>
            <Text>{exam.exam_title || "Unknown Exam"}</Text>
            <br />
            <Tag color="blue" style={{ marginTop: "4px" }}>{exam.term}</Tag>
          </div>
        );
      },
    },
    {
      title: "Marks",
      key: "marks",
      render: (_, record) => {
        const total = record.exam_id?.total_marks || "-";
        return (
          <Text strong>
            {record.marks_obtained} / {total}
          </Text>
        );
      },
    },
    {
      title: "Grade",
      dataIndex: "grade",
      key: "grade",
      render: (grade) => <Tag color={getGradeColor(grade)}>{grade}</Tag>,
    },
    {
      title: "Rank",
      dataIndex: "rank",
      key: "rank",
      render: (rank) => {
        let suffix = "th";
        if (rank === 1) suffix = "st";
        else if (rank === 2) suffix = "nd";
        else if (rank === 3) suffix = "rd";
        
        return <Text strong>{rank}{suffix}</Text>;
      },
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
        <Title level={3} style={{ margin: 0 }}>My Exam Results</Title>
      </div>

      <Table 
        columns={columns} 
        dataSource={results} 
        rowKey="result_id" 
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default StudentResults;
