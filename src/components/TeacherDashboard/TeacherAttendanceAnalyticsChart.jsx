import React from "react";
import { Card, Row, Col, theme } from "antd";
import {
  LineChart,
  Line,
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
import { aggregateMonthlyAttendanceTrend, aggregateAttendanceBreakdown } from "../../utils/chartUtils";

const TeacherAttendanceAnalyticsChart = ({ attendanceLogs = [] }) => {
  const { token: themeToken } = theme.useToken();
  const classAttendanceTrend = aggregateMonthlyAttendanceTrend(attendanceLogs);
  const attendanceBreakdown = aggregateAttendanceBreakdown(attendanceLogs);

  return (
    <Row gutter={[20, 20]}>
      <Col xs={24} lg={14}>
        <Card
          title="Class Attendance Rate Trend (%)"
          bordered={false}
          style={{
            borderRadius: "14px",
            border: `1px solid ${themeToken.colorBorderSecondary}`,
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ width: "100%", height: 250 }}>
            {classAttendanceTrend.length > 0 ? (
              <ResponsiveContainer>
                <LineChart data={classAttendanceTrend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={themeToken.colorBorderSecondary} />
                  <XAxis dataKey="month" stroke={themeToken.colorTextSecondary} fontSize={12} />
                  <YAxis domain={[0, 100]} stroke={themeToken.colorTextSecondary} fontSize={12} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: themeToken.colorBgContainer,
                      borderColor: themeToken.colorBorderSecondary,
                      borderRadius: "8px",
                    }}
                    formatter={(val) => [`${val}%`, "Attendance Rate"]}
                  />
                  <Line type="monotone" dataKey="attendance" stroke={themeToken.colorPrimary} strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: "center", paddingTop: "90px", color: themeToken.colorTextSecondary }}>
                No attendance trend records found.
              </div>
            )}
          </div>
        </Card>
      </Col>

      <Col xs={24} lg={10}>
        <Card
          title="Attendance Status Breakdown"
          bordered={false}
          style={{
            borderRadius: "14px",
            border: `1px solid ${themeToken.colorBorderSecondary}`,
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ width: "100%", height: 250 }}>
            {attendanceBreakdown.length > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={attendanceBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {attendanceBreakdown.map((entry, index) => (
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
            ) : (
              <div style={{ textAlign: "center", paddingTop: "90px", color: themeToken.colorTextSecondary }}>
                No class attendance status logs recorded yet.
              </div>
            )}
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default TeacherAttendanceAnalyticsChart;
