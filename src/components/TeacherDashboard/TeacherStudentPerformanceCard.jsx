import React, { useState, useMemo } from "react";
import { Card, Table, Tag, Input, Select, Button, Typography, Row, Col, Progress, theme } from "antd";
import { SearchOutlined, UserOutlined, TrophyOutlined, ReloadOutlined } from "@ant-design/icons";
import { getGradeColor } from "../../enums/gradeColors";

const { Text } = Typography;
const { Option } = Select;

const TeacherStudentPerformanceCard = ({ examResults = [] }) => {
  const { token: themeToken } = theme.useToken();
  const [searchText, setSearchText] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [passFailStatus, setPassFailStatus] = useState("all");

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

  const uniqueSubjects = useMemo(() => {
    const set = new Set();
    studentPerformanceList.forEach((s) => {
      if (s.subject) set.add(s.subject);
    });
    return Array.from(set);
  }, [studentPerformanceList]);

  const filteredList = useMemo(() => {
    return studentPerformanceList.filter((s) => {
      // 1. Subject Filter
      if (selectedSubject !== "all" && s.subject !== selectedSubject) {
        return false;
      }

      // 2. Grade Filter
      if (selectedGrade !== "all" && s.grade !== selectedGrade) {
        return false;
      }

      // 3. Pass / Fail Filter
      if (passFailStatus === "pass" && s.pct < 40) return false;
      if (passFailStatus === "fail" && s.pct >= 40) return false;

      // 4. Search query
      if (searchText.trim()) {
        const q = searchText.toLowerCase().trim();
        const matches =
          s.studentName.toLowerCase().includes(q) ||
          s.indexNo.toLowerCase().includes(q) ||
          s.subject.toLowerCase().includes(q) ||
          s.examTitle.toLowerCase().includes(q);

        if (!matches) return false;
      }

      return true;
    });
  }, [studentPerformanceList, searchText, selectedSubject, selectedGrade, passFailStatus]);

  const resetFilters = () => {
    setSearchText("");
    setSelectedSubject("all");
    setSelectedGrade("all");
    setPassFailStatus("all");
  };

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
      title: "Score & Percentage",
      key: "score",
      render: (_, record) => (
        <div style={{ width: "140px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "2px" }}>
            <span>{record.marks}/{record.totalMarks}</span>
            <Text type="secondary">{record.pct}%</Text>
          </div>
          <Progress
            percent={record.pct}
            size="small"
            status={record.pct >= 40 ? "normal" : "exception"}
            showInfo={false}
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

  const hasFilters =
    searchText || selectedSubject !== "all" || selectedGrade !== "all" || passFailStatus !== "all";

  return (
    <Card
      title={
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <UserOutlined style={{ color: themeToken.colorPrimary }} />
            <span>Student Performance & Exam Marks</span>
          </div>
          <Text type="secondary" style={{ fontSize: "12px", fontWeight: "normal" }}>
            Showing: {filteredList.length} of {studentPerformanceList.length} results
          </Text>
        </div>
      }
      bordered={false}
      style={{
        borderRadius: "14px",
        border: `1px solid ${themeToken.colorBorderSecondary}`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
      }}
    >
      {/* Analytics Filter Bar */}
      <Row gutter={[10, 10]} style={{ marginBottom: "16px" }}>
        <Col xs={24} sm={10} md={8}>
          <Input
            placeholder="Search student name, ID, exam..."
            prefix={<SearchOutlined style={{ color: themeToken.colorTextSecondary }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
        </Col>
        <Col xs={12} sm={7} md={5}>
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
        <Col xs={12} sm={7} md={5}>
          <Select
            style={{ width: "100%" }}
            value={selectedGrade}
            onChange={(val) => setSelectedGrade(val)}
          >
            <Option value="all">All Letter Grades</Option>
            <Option value="A">Grade A (75-100%)</Option>
            <Option value="B">Grade B (65-74%)</Option>
            <Option value="C">Grade C (55-64%)</Option>
            <Option value="S">Grade S (40-54%)</Option>
            <Option value="F">Grade F (&lt;40%)</Option>
          </Select>
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Select
            style={{ width: "100%" }}
            value={passFailStatus}
            onChange={(val) => setPassFailStatus(val)}
          >
            <Option value="all">Pass / Fail All</Option>
            <Option value="pass">Passed (&ge;40%)</Option>
            <Option value="fail">Failed (&lt;40%)</Option>
          </Select>
        </Col>
        <Col xs={12} sm={4} md={2} style={{ textAlign: "right" }}>
          {hasFilters && (
            <Button icon={<ReloadOutlined />} onClick={resetFilters} type="text" danger>
              Reset
            </Button>
          )}
        </Col>
      </Row>

      <Table
        dataSource={filteredList}
        columns={columns}
        pagination={{ pageSize: 5 }}
        size="small"
        locale={{ emptyText: "No student exam performance records found." }}
      />
    </Card>
  );
};

export default TeacherStudentPerformanceCard;
