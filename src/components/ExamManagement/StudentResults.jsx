import React, { useState, useEffect, useMemo } from "react";
import { Card, Table, Typography, message, Tag, Input, Select, Button, Row, Col, theme } from "antd";
import { SearchOutlined, ReloadOutlined, TrophyOutlined } from "@ant-design/icons";
import { examAPI } from "../../services/examApi";
import { getGradeColor } from "../../enums/gradeColors";

const { Title, Text } = Typography;
const { Option } = Select;

const StudentResults = ({ results: propResults, loading: propLoading }) => {
  const { token: themeToken } = theme.useToken();
  const [results, setResults] = useState(propResults || []);
  const [loading, setLoading] = useState(propLoading || false);

  // Filters
  const [searchText, setSearchText] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("all");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [passFailStatus, setPassFailStatus] = useState("all");

  useEffect(() => {
    if (propResults !== undefined) {
      setResults(propResults);
      if (propLoading !== undefined) setLoading(propLoading);
      return;
    }

    fetchMyResults();
  }, [propResults, propLoading]);

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

  const resetFilters = () => {
    setSearchText("");
    setSelectedTerm("all");
    setSelectedGrade("all");
    setPassFailStatus("all");
  };

  // Unique terms list
  const uniqueTerms = useMemo(() => {
    const set = new Set();
    results.forEach((r) => {
      const term = r.exam_id?.term;
      if (term) set.add(term);
    });
    return Array.from(set);
  }, [results]);

  const filteredResults = useMemo(() => {
    return results.filter((record) => {
      const exam = record.exam_id || {};
      const cls = exam.class_id || {};

      // 1. Term Filter
      if (selectedTerm !== "all" && exam.term !== selectedTerm) {
        return false;
      }

      // 2. Grade Filter
      if (selectedGrade !== "all" && record.grade !== selectedGrade) {
        return false;
      }

      // 3. Pass / Fail Filter
      const marks = record.marks_obtained || 0;
      const total = exam.total_marks || 100;
      const pct = total > 0 ? (marks / total) * 100 : marks;

      if (passFailStatus === "pass" && pct < 40) return false;
      if (passFailStatus === "fail" && pct >= 40) return false;

      // 4. Search Query
      if (searchText.trim()) {
        const q = searchText.toLowerCase().trim();
        const className = (cls.class_name || "").toLowerCase();
        const subject = (cls.subject || "").toLowerCase();
        const examTitle = (exam.exam_title || "").toLowerCase();

        if (!className.includes(q) && !subject.includes(q) && !examTitle.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [results, searchText, selectedTerm, selectedGrade, passFailStatus]);

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
            <Tag color="blue" style={{ marginTop: "4px" }}>
              {exam.term}
            </Tag>
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

        let color = "default";
        if (rank === 1) color = "gold";
        else if (rank === 2) color = "silver";
        else if (rank === 3) color = "bronze";

        return (
          <Tag color={color} icon={<TrophyOutlined />}>
            {rank}
            {suffix}
          </Tag>
        );
      },
    },
  ];

  const hasFilters =
    searchText || selectedTerm !== "all" || selectedGrade !== "all" || passFailStatus !== "all";

  return (
    <Card
      title={
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Title level={3} style={{ margin: 0, color: themeToken.colorText }}>
            My Exam Results
          </Title>
          <Text type="secondary" style={{ fontSize: "12px", fontWeight: "normal" }}>
            Showing: {filteredResults.length} of {results.length} exam records
          </Text>
        </div>
      }
      bordered={false}
      style={{
        borderRadius: "14px",
        border: `1px solid ${themeToken.colorBorderSecondary}`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
        background: themeToken.colorBgContainer,
      }}
    >
      {/* Search & Filter Toolbar */}
      <Card
        size="small"
        style={{
          marginBottom: "16px",
          background: themeToken.colorBgLayout,
          borderRadius: "8px",
          border: `1px solid ${themeToken.colorBorderSecondary}`,
        }}
      >
        <Row gutter={[10, 10]} align="middle">
          <Col xs={24} sm={10} md={8}>
            <Input
              prefix={<SearchOutlined style={{ color: "#9CA3AF" }} />}
              placeholder="Search by subject, class, or exam title..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={7} md={5}>
            <Select
              style={{ width: "100%" }}
              value={selectedTerm}
              onChange={(val) => setSelectedTerm(val)}
            >
              <Option value="all">All Terms</Option>
              {uniqueTerms.map((term) => (
                <Option key={term} value={term}>
                  {term}
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
              <Option value="all">All Grades</Option>
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
      </Card>

      <Table
        columns={columns}
        dataSource={filteredResults}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: "No matching exam results found" }}
      />
    </Card>
  );
};

export default StudentResults;
