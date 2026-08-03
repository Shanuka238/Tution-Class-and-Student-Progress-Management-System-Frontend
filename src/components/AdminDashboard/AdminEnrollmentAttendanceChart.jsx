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
  LineChart,
  Line,
} from "recharts";
import { aggregateEnrollmentByGrade, aggregateMonthlyAttendanceTrend } from "../../utils/chartUtils";

const AdminEnrollmentAttendanceChart = ({ classList = [], attendanceLogs = [] }) => {
  const { token: themeToken } = theme.useToken();
  const enrollmentData = aggregateEnrollmentByGrade(classList);
  const attendanceTrendData = aggregateMonthlyAttendanceTrend(attendanceLogs);

  return (
    <Row gutter={[20, 20]}>
      <Col xs={24} lg={12}>
        <Card
          title="Student Capacity per Grade"
          bordered={false}
          style={{
            borderRadius: "14px",
            border: `1px solid ${themeToken.colorBorderSecondary}`,
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ width: "100%", height: 240 }}>
            {enrollmentData.length > 0 ? (
              <ResponsiveContainer>
                <BarChart data={enrollmentData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={themeToken.colorBorderSecondary} />
                  <XAxis dataKey="grade" stroke={themeToken.colorTextSecondary} fontSize={12} />
                  <YAxis stroke={themeToken.colorTextSecondary} fontSize={12} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: themeToken.colorBgContainer,
                      borderColor: themeToken.colorBorderSecondary,
                      borderRadius: "8px",
                    }}
                    formatter={(val) => [`${val} Students`, "Capacity"]}
                  />
                  <Bar dataKey="students" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: "center", paddingTop: "90px", color: themeToken.colorTextSecondary }}>
                No active grade capacity data recorded.
              </div>
            )}
          </div>
        </Card>
      </Col>

      <Col xs={24} lg={12}>
        <Card
          title="Attendance Rate Overview Trend (%)"
          bordered={false}
          style={{
            borderRadius: "14px",
            border: `1px solid ${themeToken.colorBorderSecondary}`,
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ width: "100%", height: 240 }}>
            {attendanceTrendData.length > 0 ? (
              <ResponsiveContainer>
                <LineChart data={attendanceTrendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
                  <Line type="monotone" dataKey="rate" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
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
    </Row>
  );
};

export default AdminEnrollmentAttendanceChart;
