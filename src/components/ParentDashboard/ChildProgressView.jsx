import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Tag,
  Progress,
  Typography,
  Space,
  Empty,
  Tooltip,
  theme,
  Spin,
} from "antd";
import {
  TrophyOutlined,
  BookOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  BulbOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { ATTENDANCE_STATUS } from "../../enums/attendanceStatus";
import { getGradeColor } from "../../enums/gradeColors";
import { GRADE_TO_MARKS_MAP, calculateGrowthMetrics, getGrowthBadge } from "../../utils/academicUtils";
import { parentAPI } from "../../services/parentApi";

const { Title, Text } = Typography;

const ChildProgressView = ({
  childUser: propChildUser,
  growthBadge: propGrowthBadge,
  growthIndex: propGrowthIndex,
  attendancePct: propAttendancePct,
  avgExamScore: propAvgExamScore,
  enrolledClasses: propEnrolledClasses,
  attendanceLogs: propAttendanceLogs,
  examResults: propExamResults,
}) => {
  const { token: themeToken } = theme.useToken();
  const [internalData, setInternalData] = useState(null);
  const [loading, setLoading] = useState(!propExamResults);

  const fetchInternalData = useCallback(async () => {
    try {
      const childrenRes = await parentAPI.getMyChildren();
      const childrenArr = Array.isArray(childrenRes.data || childrenRes) ? (childrenRes.data || childrenRes) : [];
      if (childrenArr.length > 0) {
        const studentId = childrenArr[0].student_id || childrenArr[0]._id;
        const progressRes = await parentAPI.getChildProgress(studentId);
        const data = progressRes.data || progressRes;
        setInternalData({
          childUser: childrenArr[0]?.user_id || {},
          data,
        });
      }
    } catch (err) {
      console.error("Error fetching child progress internally:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!propExamResults && !propAttendanceLogs) {
      fetchInternalData();
    }
  }, [propExamResults, propAttendanceLogs, fetchInternalData]);

  const attendanceLogs = propAttendanceLogs || internalData?.data?.attendance || [];
  const enrolledClasses = propEnrolledClasses || internalData?.data?.classes || [];
  const examResults = propExamResults || internalData?.data?.results || [];
  const feeInvoices = internalData?.data?.fees || [];
  const childUser = propChildUser || internalData?.childUser || {};

  const metrics = calculateGrowthMetrics(attendanceLogs, examResults, feeInvoices);
  const growthIndex = propGrowthIndex !== undefined ? propGrowthIndex : metrics.growthIndex;
  const attendancePct = propAttendancePct !== undefined ? propAttendancePct : metrics.attendancePct;
  const avgExamScore = propAvgExamScore !== undefined ? propAvgExamScore : metrics.avgExamScore;
  const growthBadge = propGrowthBadge || getGrowthBadge(growthIndex);

  const gradeCounts = { A: 0, B: 0, C: 0, S: 0, F: 0 };
  examResults.forEach((r) => {
    if (r.grade && gradeCounts[r.grade] !== undefined) {
      gradeCounts[r.grade]++;
    }
  });

  const totalAttendanceLogs = attendanceLogs.length;

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      {/* Executive Growth Scorecard Card */}
      <Card
        bordered={false}
        style={{
          borderRadius: "16px",
          background: `linear-gradient(135deg, ${growthBadge?.color || themeToken.colorPrimary}15 0%, ${themeToken.colorBgContainer} 100%)`,
          border: `1px solid ${growthBadge?.color || themeToken.colorPrimary}30`,
          boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
        }}
      >
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} sm={8} style={{ textAlign: "center" }}>
            <Progress
              type="dashboard"
              percent={growthIndex}
              strokeColor={growthBadge?.color || "#10B981"}
              format={(percent) => `${percent}%`}
              size={160}
            />
            <div style={{ marginTop: "8px" }}>
              <Tag
                color={growthBadge?.color}
                style={{ fontSize: "14px", padding: "6px 14px", borderRadius: "8px", fontWeight: "bold" }}
              >
                {growthBadge?.label || "Overall Growth Index"}
              </Tag>
            </div>
          </Col>

          <Col xs={24} sm={16}>
            <Title level={3} style={{ margin: "0 0 8px 0", color: themeToken.colorText }}>
              Academic Growth Analysis for {childUser?.first_name || "Child"} {childUser?.last_name || ""}
            </Title>
            <Text type="secondary" style={{ fontSize: "14px", display: "block", marginBottom: "16px" }}>
              Comprehensive performance evaluation combining attendance consistency, exam marks, and tuition activity.
            </Text>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div
                  style={{
                    padding: "14px 16px",
                    borderRadius: "10px",
                    background: themeToken.colorBgLayout,
                    border: `1px solid ${themeToken.colorBorderSecondary}`,
                  }}
                >
                  <div style={{ fontSize: "12px", color: themeToken.colorTextSecondary }}>
                    Overall Attendance Rate
                  </div>
                  <div style={{ fontSize: "22px", fontWeight: "bold", color: totalAttendanceLogs > 0 ? (attendancePct >= 80 ? "#10B981" : "#F59E0B") : themeToken.colorTextSecondary, marginTop: "2px" }}>
                    {totalAttendanceLogs > 0 ? `${attendancePct}%` : "No Sessions Held Yet"}
                  </div>
                  <Text type="secondary" style={{ fontSize: "11px" }}>
                    {totalAttendanceLogs > 0 ? `${totalAttendanceLogs} total logged sessions` : "Awaiting class session logs"}
                  </Text>
                </div>
              </Col>

              <Col span={12}>
                <div
                  style={{
                    padding: "14px 16px",
                    borderRadius: "10px",
                    background: themeToken.colorBgLayout,
                    border: `1px solid ${themeToken.colorBorderSecondary}`,
                  }}
                >
                  <div style={{ fontSize: "12px", color: themeToken.colorTextSecondary }}>
                    Exam Marks Average
                  </div>
                  <div style={{ fontSize: "22px", fontWeight: "bold", color: "#8B5CF6", marginTop: "2px" }}>
                    {examResults.length > 0 ? `${avgExamScore}%` : "No Exams Yet"}
                  </div>
                  <Text type="secondary" style={{ fontSize: "11px" }}>
                    {examResults.length > 0 ? `Across ${examResults.length} published exams` : "Awaiting exam assessments"}
                  </Text>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      <Row gutter={[20, 20]}>
        <Col xs={24} lg={15}>
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <BookOutlined style={{ color: "#3B82F6" }} />
                <span>Subject Progress & Competency Breakdown ({enrolledClasses.length})</span>
              </div>
            }
            bordered={false}
            style={{
              borderRadius: "14px",
              border: `1px solid ${themeToken.colorBorderSecondary}`,
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            }}
          >
            {enrolledClasses.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {enrolledClasses.map((cls) => {
                  // Subject attendance calculation
                  const subjectLogs = attendanceLogs.filter(
                    (a) => String(a.class_id?._id || a.class_id) === String(cls._id)
                  );
                  const subjPresent = subjectLogs.filter((a) => a.status === ATTENDANCE_STATUS.PRESENT).length;
                  const hasSubjLogs = subjectLogs.length > 0;
                  const subjAttendance = hasSubjLogs
                    ? Math.round((subjPresent / subjectLogs.length) * 100)
                    : 100;

                  // Subject exam results
                  const subjExams = examResults.filter(
                    (r) => String(r.exam_id?.class_id?._id || r.exam_id?.class_id) === String(cls._id)
                  );

                  let subjMarksSum = 0;
                  subjExams.forEach((r) => {
                    let m = r.marks;
                    if ((m === undefined || m === null || m === 0) && r.grade && GRADE_TO_MARKS_MAP[r.grade]) {
                      m = GRADE_TO_MARKS_MAP[r.grade];
                    }
                    subjMarksSum += m || 0;
                  });

                  const subjMarksAvg =
                    subjExams.length > 0 ? Math.round(subjMarksSum / subjExams.length) : null;

                  const teacherUser = cls.teacher_id?.user_id;

                  return (
                    <div
                      key={cls._id}
                      style={{
                        padding: "18px",
                        borderRadius: "12px",
                        background: themeToken.colorBgLayout,
                        border: `1px solid ${themeToken.colorBorderSecondary}`,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
                        <div>
                          <span style={{ fontWeight: "700", fontSize: "16px", color: themeToken.colorText }}>
                            {cls.class_name}
                          </span>
                          <Tag color="blue" style={{ marginLeft: "8px" }}>Grade {cls.grade}</Tag>
                        </div>
                        <Tag color="purple" style={{ padding: "2px 10px", fontSize: "12px" }}>{cls.subject}</Tag>
                      </div>

                      {teacherUser && (
                        <div style={{ fontSize: "12px", color: themeToken.colorTextSecondary, marginBottom: "12px" }}>
                          <UserOutlined /> Instructor: <strong>{teacherUser.first_name} {teacherUser.last_name}</strong>
                        </div>
                      )}

                      <Row gutter={[16, 12]}>
                        <Col span={12}>
                          <div style={{ fontSize: "12px", color: themeToken.colorTextSecondary, marginBottom: "4px" }}>
                            Attendance ({hasSubjLogs ? `${subjAttendance}%` : "No sessions held yet"})
                          </div>
                          <Progress
                            percent={hasSubjLogs ? subjAttendance : 100}
                            strokeColor={hasSubjLogs ? (subjAttendance >= 80 ? "#10B981" : "#F59E0B") : "#3B82F6"}
                            size="small"
                            format={() => (hasSubjLogs ? `${subjPresent}/${subjectLogs.length} Sessions` : "0 Sessions")}
                          />
                        </Col>

                        <Col span={12}>
                          <div style={{ fontSize: "12px", color: themeToken.colorTextSecondary, marginBottom: "4px" }}>
                            Exam Performance Avg ({subjMarksAvg !== null ? `${subjMarksAvg}%` : "No exams"})
                          </div>
                          <Progress
                            percent={subjMarksAvg !== null ? subjMarksAvg : 0}
                            strokeColor="#8B5CF6"
                            size="small"
                            format={() => (subjMarksAvg !== null ? `${subjMarksAvg}%` : "N/A")}
                          />
                        </Col>
                      </Row>

                      {subjExams.length > 0 && (
                        <div style={{ marginTop: "14px", borderTop: `1px dashed ${themeToken.colorBorderSecondary}`, paddingTop: "12px" }}>
                          <div style={{ fontSize: "12px", fontWeight: "600", color: themeToken.colorText, marginBottom: "8px" }}>
                            Published Assessments ({subjExams.length})
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            {subjExams.map((e) => {
                              let scoreDisp = e.marks !== undefined && e.marks !== null && e.marks > 0 ? `${e.marks}/100` : `Grade ${e.grade}`;
                              return (
                                <div
                                  key={e._id}
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    background: themeToken.colorBgContainer,
                                    padding: "6px 10px",
                                    borderRadius: "6px",
                                    fontSize: "12px",
                                  }}
                                >
                                  <span>{e.exam_id?.title || "Class Exam"}</span>
                                  <Tag color={getGradeColor(e.grade)}>
                                    {scoreDisp} ({e.grade || "N/A"})
                                  </Tag>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No subjects enrolled for this child." />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={9}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Card
              title={
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <TrophyOutlined style={{ color: "#8B5CF6" }} />
                  <span>Exam Grade Distribution</span>
                </div>
              }
              bordered={false}
              style={{
                borderRadius: "14px",
                border: `1px solid ${themeToken.colorBorderSecondary}`,
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              }}
            >
              <Row gutter={[8, 8]} style={{ textAlign: "center" }}>
                {Object.keys(gradeCounts).map((grade) => (
                  <Col span={4} key={grade} style={{ flexGrow: 1 }}>
                    <div
                      style={{
                        padding: "10px 4px",
                        borderRadius: "8px",
                        background: themeToken.colorBgLayout,
                        border: `1px solid ${themeToken.colorBorderSecondary}`,
                      }}
                    >
                      <Tag color={getGradeColor(grade)} style={{ margin: 0, fontWeight: "bold" }}>
                        Grade {grade}
                      </Tag>
                      <div style={{ fontWeight: "bold", fontSize: "16px", marginTop: "4px", color: themeToken.colorText }}>
                        {gradeCounts[grade]}
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>

            <Card
              title={
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <BulbOutlined style={{ color: "#F59E0B" }} />
                  <span>Parent Insights & Recommendations</span>
                </div>
              }
              bordered={false}
              style={{
                borderRadius: "14px",
                border: `1px solid ${themeToken.colorBorderSecondary}`,
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {totalAttendanceLogs > 0 ? (
                  attendancePct >= 80 ? (
                    <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                      <CheckCircleOutlined style={{ color: "#10B981", fontSize: "16px", marginTop: "3px" }} />
                      <div style={{ fontSize: "13px", color: themeToken.colorText }}>
                        <strong>Excellent Attendance Record:</strong> {childUser?.first_name || "Your child"} has maintained {attendancePct}% attendance consistency. Consistent presence strongly correlates with exam success!
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                      <WarningOutlined style={{ color: "#F59E0B", fontSize: "16px", marginTop: "3px" }} />
                      <div style={{ fontSize: "13px", color: themeToken.colorText }}>
                        <strong>Attendance Alert:</strong> Attendance rate is currently {attendancePct}%. Attending scheduled classes regularly helps prevent falling behind in coursework.
                      </div>
                    </div>
                  )
                ) : (
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <CheckCircleOutlined style={{ color: "#3B82F6", fontSize: "16px", marginTop: "3px" }} />
                    <div style={{ fontSize: "13px", color: themeToken.colorText }}>
                      <strong>Class Registration Active:</strong> Enrolled in {enrolledClasses.length} active tuition classes. Attendance records will appear here as teachers log class sessions.
                    </div>
                  </div>
                )}

                {examResults.length > 0 && (
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <TrophyOutlined style={{ color: "#8B5CF6", fontSize: "16px", marginTop: "3px" }} />
                    <div style={{ fontSize: "13px", color: themeToken.colorText }}>
                      <strong>Assessment History:</strong> Completed {examResults.length} exams with an overall performance average of {avgExamScore}%.
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </Space>
        </Col>
      </Row>
    </Space>
  );
};

export default ChildProgressView;
