import { Card, Tag, Empty, theme } from "antd";
import { TrophyOutlined } from "@ant-design/icons";
import { getGradeColor } from "../../enums/gradeColors";

const StudentRecentResultsCard = ({ examResults = [] }) => {
  const { token: themeToken } = theme.useToken();

  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <TrophyOutlined style={{ color: "#8B5CF6" }} />
          <span>Recent Exam Results</span>
        </div>
      }
      bordered={false}
      style={{
        borderRadius: "14px",
        border: `1px solid ${themeToken.colorBorderSecondary}`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
      }}
    >
      {examResults.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {examResults.slice(0, 4).map((item) => {
            const exam = item.exam_id || {};
            const cls = exam.class_id || {};
            return (
              <div
                key={item._id}
                style={{
                  padding: "12px 16px",
                  borderRadius: "8px",
                  background: themeToken.colorBgLayout,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: "600", fontSize: "14px" }}>
                    {exam.title || exam.exam_title || cls.class_name || "Class Exam"}
                  </div>
                  <div style={{ fontSize: "12px", color: themeToken.colorTextSecondary }}>
                    {cls.subject || "Subject"} • Score: {item.marks_obtained ?? item.marks ?? item.score ?? "N/A"}/100
                  </div>
                </div>
                <Tag color={getGradeColor(item.grade)} style={{ fontWeight: "bold", padding: "4px 10px", margin: 0 }}>
                  Grade {item.grade || "N/A"}
                </Tag>
              </div>
            );
          })}
        </div>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No exam results published yet." />
      )}
    </Card>
  );
};

export default StudentRecentResultsCard;
