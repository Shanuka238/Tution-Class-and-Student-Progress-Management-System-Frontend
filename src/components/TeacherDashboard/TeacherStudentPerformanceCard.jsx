import React, { useState, useMemo } from "react";
import { Card, Table, Tag, Input, Typography, Row, Col, Progress, theme } from "antd";
import { SearchOutlined, UserOutlined, TrophyOutlined } from "@ant-design/icons";
import { getGradeColor } from "../../enums/gradeColors";

const { Text } = Typography;

const TeacherStudentPerformanceCard = ({ examResults = [] }) => {
  const { token: themeToken } = theme.useToken();
  const [searchText, setSearchText] = useState("");

  const studentPerformanceList = useMemo(() => {
    return examResults.map((r, index) => {
      const studentObj = r.student_id || {};
      const userObj = typeof studentObj.user_id === "object" ? studentObj.user_id : studentObj;

      const firstName = userObj.first_name || studentObj.first_name || r.first_name || "";
      const lastName = userObj.last_name || studentObj.last_name || r.last_name || "";
      const fullName = `${firstName} ${lastName}`.trim() || userObj.name || `Student #${index + 1}`;
      const indexNo = studentObj.student_number || studentObj.index_number || userObj.index_number || r.index_number || "-";

      const exam = typeof r.exam_id === "object" ? r.exam_id : {};
      const cls = typeof exam.class_id === "object" ? exam.class_id : {};
      const examTitle = exam.exam_title || exam.term || "Assessment";
      const subject = cls.subject || cls.class_name || "General";

      const marks = r.marks_obtained !== undefined && r.marks_obtained !== null ? Number(r.marks_obtained) : (r.marks || 0);
      const totalMarks = exam.total_marks || 100;
      const pct = totalMarks > 0 ? Math.round((marks / totalMarks) * 100) : marks;
      const grade = r.grade || (pct >= 75 ? "A" : pct >= 65 ? "B" : pct >= 55 ? "C" : pct >= 40 ? "S" : "F");

      return {
        key: r._id || index,
        studentName: fullName,
        indexNo,
        subject,
        examTitle,
        marks,
        totalMarks,
        pct,
        grade,
        rank: r.rank || index + 1,
      };
    });
  }, [examResults]);

  const filteredList = useMemo(() => {
    if (!searchText) return studentPerformanceList;
    const query = searchText.toLowerCase();
    return studentPerformanceList.filter(
      (s) =>
        s.studentName.toLowerCase().includes(query) ||
        s.indexNo.toLowerCase().includes(query) ||
        s.subject.toLowerCase().includes(query)
    );
  }, [studentPerformanceList, searchText]);

  const columns = [
    {
      title: "Student Name",
      dataIndex: "studentName",
      key: "studentName",
      render: (name, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: themeToken.colorPrimaryBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: themeToken.colorPrimary,
              fontWeight: 600,
            }}
          >
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <Text strong>{name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: "11px" }}>
              ID: {record.indexNo}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Subject / Exam",
      key: "subject",
      render: (_, record) => (
        <div>
          <Text style={{ fontSize: "13px" }}>{record.subject}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: "11px" }}>
            {record.examTitle}
          </Text>
        </div>
      ),
    },
    {
      title: "Marks & Score",
      key: "marks",
      sorter: (a, b) => a.pct - b.pct,
      render: (_, record) => (
        <div style={{ minWidth: "120px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
            <Text strong>{record.marks} / {record.totalMarks}</Text>
            <Text type="secondary">{record.pct}%</Text>
          </div>
          <Progress
            percent={record.pct}
            showInfo={false}
            strokeColor={record.pct >= 50 ? "#10B981" : "#EF4444"}
            size="small"
          />
        </div>
      ),
    },
    {
      title: "Grade",
      dataIndex: "grade",
      key: "grade",
      align: "center",
      render: (grade) => <Tag color={getGradeColor(grade)}>{grade}</Tag>,
    },
    {
      title: "Rank",
      dataIndex: "rank",
      key: "rank",
      align: "center",
      sorter: (a, b) => a.rank - b.rank,
      render: (rank) => {
        let color = "default";
        if (rank === 1) color = "gold";
        else if (rank === 2) color = "silver";
        else if (rank === 3) color = "bronze";
        return (
          <Tag color={color} icon={<TrophyOutlined />}>
            #{rank}
          </Tag>
        );
      },
    },
  ];

  return (
    <Card
      title={
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <UserOutlined style={{ color: themeToken.colorPrimary }} />
              <span>Student Performance & Exam Marks</span>
            </div>
          </Col>
          <Col>
            <Input
              placeholder="Search student name..."
              prefix={<SearchOutlined style={{ color: themeToken.colorTextSecondary }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 240 }}
              allowClear
            />
          </Col>
        </Row>
      }
      bordered={false}
      style={{
        borderRadius: "14px",
        border: `1px solid ${themeToken.colorBorderSecondary}`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
      }}
    >
      <Table
        dataSource={filteredList}
        columns={columns}
        pagination={{ pageSize: 5 }}
        size="small"
        locale={{ emptyText: "No student exam performance records available." }}
      />
    </Card>
  );
};

export default TeacherStudentPerformanceCard;
