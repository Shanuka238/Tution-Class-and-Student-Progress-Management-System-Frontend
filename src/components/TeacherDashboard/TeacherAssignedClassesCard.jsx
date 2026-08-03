import { Card, Tag, Empty, theme } from "antd";
import { BookOutlined, TeamOutlined, CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const TeacherAssignedClassesCard = ({ assignedClasses = [] }) => {
  const { token: themeToken } = theme.useToken();

  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <BookOutlined style={{ color: "#10B981" }} />
          <span>My Assigned Classes ({assignedClasses.length})</span>
        </div>
      }
      bordered={false}
      style={{
        borderRadius: "14px",
        border: `1px solid ${themeToken.colorBorderSecondary}`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
      }}
    >
      {assignedClasses.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {assignedClasses.map((item) => {
            const enrolled = item.enrolled_count || (item.enrolled_students ? item.enrolled_students.length : 0);
            return (
              <div
                key={item._id || item.class_id}
                style={{
                  padding: "14px 16px",
                  borderRadius: "10px",
                  background: themeToken.colorBgLayout,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div>
                  <div style={{ fontWeight: "600", fontSize: "15px" }}>
                    {item.class_name}
                  </div>
                  <div style={{ fontSize: "12px", color: themeToken.colorTextSecondary, marginTop: "2px" }}>
                    {item.subject} • Grade {item.grade}
                  </div>
                  <div style={{ fontSize: "12px", color: themeToken.colorTextSecondary, marginTop: "4px" }}>
                    <CalendarOutlined /> Dates: {item.start_date ? dayjs(item.start_date).format("MMM D, YYYY") : "N/A"} - {item.end_date ? dayjs(item.end_date).format("MMM D, YYYY") : "N/A"}
                  </div>
                </div>
                <Tag color="blue" icon={<TeamOutlined />} style={{ padding: "4px 10px", borderRadius: "6px" }}>
                  {enrolled} / {item.max_students} Students Enrolled
                </Tag>
              </div>
            );
          })}
        </div>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No active classes assigned to your profile." />
      )}
    </Card>
  );
};

export default TeacherAssignedClassesCard;
