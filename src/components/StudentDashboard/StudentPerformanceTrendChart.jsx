import React, { useState, useMemo } from "react";
import { Card, Row, Col, Select, Segmented, Space, Tag, theme, Button } from "antd";
import {
  FilterOutlined,
  ReloadOutlined,
  TrophyOutlined,
  BookOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { aggregateExamPerformanceTrend, aggregateSubjectComparison } from "../../utils/chartUtils";
import { ANALYTICS_METRICS, DEFAULT_FILTER_ALL, ACADEMIC_TERMS } from "../../enums/analyticsConfig";
import { extractUniqueSubjects, filterExamResults, calculateFilteredStats } from "../../utils/analyticsHelper";

const StudentPerformanceTrendChart = ({ examResults = [] }) => {
  const { token: themeToken } = theme.useToken();

  const [selectedSubject, setSelectedSubject] = useState(DEFAULT_FILTER_ALL);
  const [selectedTerm, setSelectedTerm] = useState(DEFAULT_FILTER_ALL);
  const [viewMetric, setViewMetric] = useState(ANALYTICS_METRICS.SCORE);

  const uniqueSubjects = useMemo(() => extractUniqueSubjects(examResults), [examResults]);

  const filteredResults = useMemo(
    () => filterExamResults(examResults, selectedSubject, selectedTerm),
    [examResults, selectedSubject, selectedTerm]
  );

  const trendData = aggregateExamPerformanceTrend(filteredResults, selectedSubject);
  const subjectData = aggregateSubjectComparison(filteredResults, selectedSubject);

  const stats = useMemo(() => calculateFilteredStats(trendData), [trendData]);

  const handleResetFilters = () => {
    setSelectedSubject(DEFAULT_FILTER_ALL);
    setSelectedTerm(DEFAULT_FILTER_ALL);
    setViewMetric(ANALYTICS_METRICS.SCORE);
  };

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      {/* Advanced Filter Toolbar Card */}
      <Card
        bordered={false}
        style={{
          borderRadius: "14px",
          border: `1px solid ${themeToken.colorBorderSecondary}`,
          boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
          padding: "8px 12px",
        }}
      >
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={16}>
            <Space wrap size="middle">
              <Space style={{ fontWeight: 600, color: themeToken.colorText }}>
                <FilterOutlined style={{ color: themeToken.colorPrimary }} /> Filters:
              </Space>

              <Select
                value={selectedSubject}
                onChange={setSelectedSubject}
                style={{ width: 170 }}
                placeholder="Filter by Subject"
              >
                <Select.Option value="ALL">All Subjects</Select.Option>
                {uniqueSubjects.map((subj) => (
                  <Select.Option key={subj} value={subj}>
                    {subj}
                  </Select.Option>
                ))}
              </Select>

              <Select
                value={selectedTerm}
                onChange={setSelectedTerm}
                style={{ width: 140 }}
                placeholder="Filter by Term"
              >
                <Select.Option value="ALL">All Terms</Select.Option>
                <Select.Option value="Term 1">Term 1</Select.Option>
                <Select.Option value="Term 2">Term 2</Select.Option>
                <Select.Option value="Term 3">Term 3</Select.Option>
              </Select>

              <Segmented
                options={[
                  { label: "Score %", value: "score", icon: <RiseOutlined /> },
                  { label: "Rank", value: "rank", icon: <TrophyOutlined /> },
                ]}
                value={viewMetric}
                onChange={setViewMetric}
              />

              {(selectedSubject !== "ALL" || selectedTerm !== "ALL" || viewMetric !== "score") && (
                <Button icon={<ReloadOutlined />} onClick={handleResetFilters} size="small" type="text">
                  Reset
                </Button>
              )}
            </Space>
          </Col>

          {/* Quick Metrics Badges */}
          <Col xs={24} md={8} style={{ textAlign: "right" }}>
            <Space size="small">
              <Tag color="blue" style={{ borderRadius: "6px", padding: "4px 8px" }}>
                Avg: {stats.avg}%
              </Tag>
              <Tag color="green" style={{ borderRadius: "6px", padding: "4px 8px" }}>
                High: {stats.highest}%
              </Tag>
              <Tag color="volcano" style={{ borderRadius: "6px", padding: "4px 8px" }}>
                Low: {stats.lowest}%
              </Tag>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Visual Charts */}
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={14}>
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <RiseOutlined style={{ color: themeToken.colorPrimary }} />
                <span>
                  Marks Over Time {selectedSubject !== "ALL" ? `(${selectedSubject})` : "per Term"}
                </span>
              </div>
            }
            bordered={false}
            style={{
              borderRadius: "14px",
              border: `1px solid ${themeToken.colorBorderSecondary}`,
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            }}
          >
            <div style={{ width: "100%", height: 260 }}>
              {trendData.length > 0 ? (
                <ResponsiveContainer>
                  <LineChart data={trendData} margin={{ top: 25, right: 30, left: 10, bottom: 15 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={themeToken.colorBorderSecondary} />
                    <XAxis
                      dataKey="term"
                      stroke={themeToken.colorTextSecondary}
                      fontSize={11}
                      padding={{ left: 50, right: 50 }}
                    />
                    <YAxis
                      domain={viewMetric === "rank" ? [1, "auto"] : [0, 110]}
                      reversed={viewMetric === "rank"}
                      stroke={themeToken.colorTextSecondary}
                      fontSize={12}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: themeToken.colorBgContainer,
                        borderColor: themeToken.colorBorderSecondary,
                        borderRadius: "8px",
                      }}
                      formatter={(val) =>
                        viewMetric === "rank" ? [`Rank #${val}`, "Class Position"] : [`${val}/100`, "Score"]
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey={viewMetric === "rank" ? "rank" : "score"}
                      stroke={viewMetric === "rank" ? "#F59E0B" : themeToken.colorPrimary}
                      strokeWidth={3}
                      dot={{ r: 5 }}
                    >
                      <LabelList
                        dataKey={viewMetric === "rank" ? "rank" : "score"}
                        position="top"
                        offset={10}
                        formatter={(val) => (viewMetric === "rank" ? `#${val}` : `${val}%`)}
                        style={{ fontSize: "12px", fontWeight: "bold", fill: themeToken.colorText }}
                      />
                    </Line>
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ textAlign: "center", paddingTop: "90px", color: themeToken.colorTextSecondary }}>
                  No matching exam score trend data found.
                </div>
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <BookOutlined style={{ color: "#3B82F6" }} />
                <span>
                  {selectedSubject !== "ALL" ? `${selectedSubject} Exam Scores` : "Subject Marks Comparison"}
                </span>
              </div>
            }
            bordered={false}
            style={{
              borderRadius: "14px",
              border: `1px solid ${themeToken.colorBorderSecondary}`,
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            }}
          >
            <div style={{ width: "100%", height: 260 }}>
              {subjectData.length > 0 ? (
                <ResponsiveContainer>
                  <BarChart data={subjectData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={themeToken.colorBorderSecondary} />
                    <XAxis dataKey="subject" stroke={themeToken.colorTextSecondary} fontSize={12} />
                    <YAxis domain={[0, 100]} stroke={themeToken.colorTextSecondary} fontSize={12} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: themeToken.colorBgContainer,
                        borderColor: themeToken.colorBorderSecondary,
                        borderRadius: "8px",
                      }}
                      formatter={(val) => [`${val}%`, "Avg Score"]}
                    />
                    <Bar dataKey="averageScore" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ textAlign: "center", paddingTop: "90px", color: themeToken.colorTextSecondary }}>
                  No subject comparison scores found.
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </Space>
  );
};

export default StudentPerformanceTrendChart;
