import React, { useState, useMemo } from "react";
import { Table, Button, Tag, Space, Input, Select, Card, Row, Col, theme } from "antd";
import { CalendarOutlined, BookOutlined, SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Option } = Select;

const AttendanceTable = ({
  classes = [],
  loading,
  onSessionsClick,
  onRegisterClick,
}) => {
  const { token: themeToken } = theme.useToken();
  const [searchText, setSearchText] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedGrade, setSelectedGrade] = useState("all");

  const uniqueSubjects = useMemo(() => {
    const set = new Set();
    classes.forEach((c) => {
      if (c.subject) set.add(c.subject);
    });
    return Array.from(set);
  }, [classes]);

  const filteredClasses = useMemo(() => {
    return classes.filter((item) => {
      // 1. Subject Filter
      if (selectedSubject !== "all" && item.subject !== selectedSubject) {
        return false;
      }

      // 2. Grade Filter
      if (selectedGrade !== "all" && String(item.grade) !== String(selectedGrade)) {
        return false;
      }

      // 3. Search Query
      if (searchText.trim()) {
        const q = searchText.toLowerCase().trim();
        const className = (item.class_name || "").toLowerCase();
        const subject = (item.subject || "").toLowerCase();
        const grade = String(item.grade || "").toLowerCase();

        if (!className.includes(q) && !subject.includes(q) && !grade.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [classes, searchText, selectedSubject, selectedGrade]);

  const resetFilters = () => {
    setSearchText("");
    setSelectedSubject("all");
    setSelectedGrade("all");
  };

  const columns = [
    {
      title: "Class Title",
      key: "name",
      render: (_, record) => (
        <div>
          <div>
            <strong>{record.class_name}</strong>
          </div>
          <div style={{ fontSize: "12px", color: themeToken.colorTextSecondary }}>
            {record.subject} • Grade {record.grade}
          </div>
        </div>
      ),
    },
    {
      title: "Active Dates",
      key: "active_dates",
      render: (_, record) => (
        <div style={{ fontSize: "13px" }}>
          <div>Start: {record.start_date ? dayjs(record.start_date).format("MMM DD, YYYY") : "N/A"}</div>
          <div style={{ color: themeToken.colorTextSecondary }}>
            End: {record.end_date ? dayjs(record.end_date).format("MMM DD, YYYY") : "N/A"}
          </div>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 320,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<CalendarOutlined />}
            onClick={() => onSessionsClick(record)}
          >
            Sessions
          </Button>
          <Button
            size="small"
            icon={<BookOutlined />}
            onClick={() => onRegisterClick(record)}
          >
            Register
          </Button>
        </Space>
      ),
    },
  ];

  const hasFilters = searchText || selectedSubject !== "all" || selectedGrade !== "all";

  return (
    <div>
      {/* Attendance Filter Toolbar */}
      <Card
        size="small"
        style={{
          marginBottom: "16px",
          background: themeToken.colorBgLayout,
          borderRadius: "8px",
          border: `1px solid ${themeToken.colorBorderSecondary}`,
        }}
      >
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={10}>
            <Input
              prefix={<SearchOutlined style={{ color: "#9CA3AF" }} />}
              placeholder="Search class by title, subject, or grade..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>

          <Col xs={12} sm={6} md={6}>
            <Select
              style={{ width: "100%" }}
              value={selectedSubject}
              onChange={(val) => setSelectedSubject(val)}
            >
              <Option value="all">All Subjects</Option>
              {uniqueSubjects.map((s) => (
                <Option key={s} value={s}>
                  {s}
                </Option>
              ))}
            </Select>
          </Col>

          <Col xs={12} sm={6} md={5}>
            <Select
              style={{ width: "100%" }}
              value={selectedGrade}
              onChange={(val) => setSelectedGrade(val)}
            >
              <Option value="all">All Grades</Option>
              {["6", "7", "8", "9", "10", "11", "12"].map((g) => (
                <Option key={g} value={g}>
                  Grade {g}
                </Option>
              ))}
            </Select>
          </Col>

          <Col xs={24} sm={24} md={3} style={{ textAlign: "right" }}>
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
        dataSource={filteredClasses}
        rowKey="_id"
        loading={loading}
        locale={{ emptyText: "No matching classes found" }}
      />
    </div>
  );
};

export default AttendanceTable;
