import { Card, Row, Col, Tag, Empty, theme } from "antd";
import { BookOutlined } from "@ant-design/icons";
import { getGradeColor } from "../../enums/gradeColors";

const SubjectCompetencyCards = ({
  enrolledClasses = [],
  attendanceLogs = [],
  examResults = [],
}) => {
  const { token: themeToken } = theme.useToken();

  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <BookOutlined style={{ color: "#3B82F6" }} />
          <span>Subject-by-Subject Performance Cards ({enrolledClasses.length})</span>
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
        <Row gutter={[16, 16]}>
          {enrolledClasses.map((cls) => {
            const subjectLogs = attendanceLogs.filter(
              (a) => String(a.class_id?._id || a.class_id) === String(cls._id)
            );
            const subjPresent = subjectLogs.filter((a) => a.status === "present").length;
            const subjPct =
              subjectLogs.length > 0
                ? Math.round((subjPresent / subjectLogs.length) * 100)
                : 100;

            const subjExams = examResults.filter(
              (r) => String(r.exam_id?.class_id?._id || r.exam_id?.class_id) === String(cls._id)
            );
            const latestExam = subjExams[0];

            return (
              <Col xs={24} sm={12} key={cls._id}>
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    background: themeToken.colorBgLayout,
                    border: `1px solid ${themeToken.colorBorderSecondary}`,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Tag color="blue">Grade {cls.grade}</Tag>
                      <Tag color={subjPct >= 80 ? "green" : "orange"}>
                        Attendance {subjPct}%
                      </Tag>
                    </div>
                    <div
                      style={{
                        fontWeight: "700",
                        fontSize: "16px",
                        marginTop: "8px",
                        color: themeToken.colorText,
                      }}
                    >
                      {cls.class_name}
                    </div>
                    <div style={{ fontSize: "12px", color: themeToken.colorTextSecondary }}>
                      Subject: {cls.subject}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      background: themeToken.colorBgContainer,
                      border: `1px solid ${themeToken.colorBorderSecondary}`,
                    }}
                  >
                    {latestExam ? (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: "11px", color: themeToken.colorTextSecondary }}>
                            Latest Exam Assessment
                          </div>
                          <div style={{ fontWeight: "600", fontSize: "13px" }}>
                            {latestExam.exam_id?.title || "Class Test"}
                          </div>
                        </div>
                        <Tag color={getGradeColor(latestExam.grade)} style={{ fontWeight: "bold" }}>
                          {latestExam.marks}/100 ({latestExam.grade})
                        </Tag>
                      </div>
                    ) : (
                      <div style={{ fontSize: "12px", color: themeToken.colorTextSecondary }}>
                        No exam marks published yet for this subject.
                      </div>
                    )}
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Child is not enrolled in any tuition classes yet."
        />
      )}
    </Card>
  );
};

export default SubjectCompetencyCards;
