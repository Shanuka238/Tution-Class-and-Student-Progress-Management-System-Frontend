import { useEffect, useState, useCallback } from "react";
import { Card, Table, Button, Space, Typography, Popconfirm, message, Tag } from "antd";
import { ArrowLeftOutlined, UserAddOutlined, DeleteOutlined, CalendarOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { adminAPI } from "../../services/adminApi";
import { classAPI } from "../../services/classApi";
import EnrollDrawer from "./EnrollDrawer";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const ClassDetails = ({ classId, onBack }) => {
  const [classInfo, setClassInfo] = useState(null);
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const fetchClassRosterDetails = useCallback(async () => {
    setLoading(true);
    try {
      const classRes = await classAPI.getActiveClasses();
      const list = classRes.data || classRes;
      const match = list.find(item => item._id === classId || item.class_id === classId);
      setClassInfo(match);

      const rosterRes = await classAPI.getClassEnrollments(classId);
      setRoster(rosterRes.data || rosterRes);
    } catch (err) {
      console.error("Error fetching class roster:", err);
      message.error("Failed to fetch class roster details");
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    fetchClassRosterDetails();
  }, [fetchClassRosterDetails]);

  const handleDropStudent = async (studentId) => {
    try {
      await classAPI.dropStudent(studentId, classId);
      message.success("Student dropped from class successfully!");
      fetchClassRosterDetails();
    } catch (err) {
      message.error(err.message || "Failed to drop student");
    }
  };

  const columns = [
    {
      title: "Student Number",
      dataIndex: ["student_id", "student_number"],
      key: "student_number",
      render: (num) => <Text strong>{num || "N/A"}</Text>,
    },
    {
      title: "Name",
      key: "name",
      render: (_, record) => {
        const userObj = record.student_id?.user_id || {};
        return `${userObj.first_name || ""} ${userObj.last_name || ""}`;
      },
    },
    {
      title: "Email",
      dataIndex: ["student_id", "user_id", "email"],
      key: "email",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Popconfirm
          title="Drop Student"
          description="Are you sure you want to drop this student from the class roster?"
          okText="Yes, Drop"
          okType="danger"
          onOk={() => handleDropStudent(record.student_id?._id || record.student_id?.id || record.profile?._id)}
        >
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  if (!classInfo) return <Card loading={true} />;

  const teacherUser = classInfo.teacher_id?.user_id;

  return (
    <Space size="large" style={{ width: "100%" }}>
      <Button icon={<ArrowLeftOutlined />} onClick={onBack} type="link">Back to Timetables</Button>

      {/* Class Profile Meta Information Data Card Box */}
      <Card style={{ borderRadius: "8px", border: "1px solid var(--color-border)", width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <Tag color="purple">GRADE {classInfo.grade}</Tag>
            <Title level={2} style={{ margin: "8px 0 4px 0" }}>{classInfo.class_name}</Title>
            <Text type="secondary" style={{ fontSize: "16px" }}>Subject Domain: {classInfo.subject}</Text>
            
            <div style={{ marginTop: "16px", display: "flex", gap: "24px", color: "var(--color-text)" }}>
              <span><CalendarOutlined /> Dates: <Text strong>{classInfo.start_date ? dayjs(classInfo.start_date).format("MMM DD, YYYY") : "N/A"} - {classInfo.end_date ? dayjs(classInfo.end_date).format("MMM DD, YYYY") : "N/A"}</Text></span>
            </div>
          </div>
          
          <div style={{ textAlign: "right", minWidth: "150px" }}>
            <Text type="secondary">Primary Instructor</Text>
            <Title level={4} style={{ margin: "4px 0 16px 0" }}>
              {teacherUser ? `${teacherUser.first_name} ${teacherUser.last_name}` : "Unassigned"}
            </Title>
            <Button 
              type="primary" 
              icon={<UserAddOutlined />} 
              onClick={() => setDrawerVisible(true)}
            >
              Enroll Students
            </Button>
          </div>
        </div>
      </Card>

      {/* Roster Listing Grid Table Component Layer Frame Box */}
      <Card title={`Active Student Roster Grid (${roster.length} / ${classInfo.max_students})`} style={{ borderRadius: "8px", width: "100%" }}>
        <Table 
          columns={columns} 
          dataSource={roster} 
          rowKey={(record) => record.profile?._id} 
          loading={loading}
        />
      </Card>

      <EnrollDrawer 
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        classData={classInfo}
        currentlyEnrolledIds={roster.map(r => r.profile?._id)}
        onEnrollSuccess={() => { setDrawerVisible(false); loadRosterDetails(); }}
      />
    </Space>
  );
};

export default ClassDetails;