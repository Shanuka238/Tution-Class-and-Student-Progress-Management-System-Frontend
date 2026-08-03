import React from "react";
import { Card, Row, Col, theme } from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { aggregateTeacherExamPerformance } from "../../utils/chartUtils";

const TeacherExamPerformanceChart = ({ examResults = [] }) => {
  const { token: themeToken } = theme.useToken();
  const { examAverages, passFailData } = aggregateTeacherExamPerformance(examResults);

  return (
    <Row gutter={[20, 20]}>
      <Col xs={24} lg={14}>
        <Card
          title="Class Average Marks per Exam"
          bordered={false}
          style={{
            borderRadius: "14px",
            border: `1px solid ${themeToken.colorBorderSecondary}`,
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ width: "100%", height: 240 }}>
            {examAverages.length > 0 ? (
              <ResponsiveContainer>
                <BarChart data={examAverages} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={themeToken.colorBorderSecondary} />
                  <XAxis dataKey="exam" stroke={themeToken.colorTextSecondary} fontSize={12} />
                  <YAxis domain={[0, 100]} stroke={themeToken.colorTextSecondary} fontSize={12} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: themeToken.colorBgContainer,
                      borderColor: themeToken.colorBorderSecondary,
                      borderRadius: "8px",
                    }}
                    formatter={(val) => [`${val}%`, "Average Mark"]}
                  />
                  <Bar dataKey="avg" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: "center", paddingTop: "90px", color: themeToken.colorTextSecondary }}>
                No exam score records found.
              </div>
            )}
          </div>
        </Card>
      </Col>

      <Col xs={24} lg={10}>
        <Card
          title="Student Pass vs Fail Ratio"
          bordered={false}
          style={{
            borderRadius: "14px",
            border: `1px solid ${themeToken.colorBorderSecondary}`,
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={passFailData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {passFailData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: themeToken.colorBgContainer,
                    borderColor: themeToken.colorBorderSecondary,
                    borderRadius: "8px",
                  }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default TeacherExamPerformanceChart;
