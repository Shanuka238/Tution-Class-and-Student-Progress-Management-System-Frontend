import { useEffect, useState, useCallback } from "react";
import { Card, Table, Button, Space, Typography, Popconfirm, message, Tag } from "antd";
import { ArrowLeftOutlined, UserAddOutlined, DeleteOutlined, CalendarOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { adminAPI } from "../../services/adminApi";
import { classAPI } from "../../services/classApi";
import EnrollDrawer from "./EnrollDrawer";

const { Title, Text } = Typography;

const ClassDetails = ({ classId, onBack }) => {
  const [classInfo, setClassInfo] = useState(null);
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const loadRosterDetails = useCallback(async () => {
    setLoading(true);
    try {
      const classesResponse = await classAPI.getActiveClasses();
      const classesData = classesResponse.data || classesResponse;
      const match = classesData.find(c => c._id === classId);
      setClassInfo(match);

      const usersResponse = await adminAPI.getAllUsers();
      const usersData = usersResponse.data || usersResponse;
      
      const studentsInClass = usersData.filter(item => {
        return item.user?.role === "student" && 
               Array.isArray(item.profile?.classes) && 
               item.profile.classes.includes(classId);
      });

      setRoster(studentsInClass);
    } catch (err) {
      console.error("Error loading roster:", err);
      message.error("Failed to compile roster listings");
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    if (classId) loadRosterDetails();
  }, [classId, loadRosterDetails]);

  const handleDropStudent = async (studentId) => {
    try {
      await classAPI.dropStudent(studentId, classId);
      message.success("Student dropped from class listing roster successfully");
      loadRosterDetails(); // Trigger re-sync
    } catch (err) {
      message.error(err.message || "Failed to drop student");
    }
  };

  const columns = [
    {
      title: "Student Reg ID",
      dataIndex: ["profile", "student_number"],
      key: "student_number",
    },
    {
      title: "Student Name",
      key: "name",
      render: (_, record) => `${record.user?.first_name || ""} ${record.user?.last_name || ""}`,
    },
    {
      title: "Contact Number",
      dataIndex: ["user", "phone"],
      key: "phone",
      render: (phone) => phone || <Text type="secondary">—</Text>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Popconfirm
          title="Remove Student from Roster?"
          description="Are you sure you want to drop this student from this class layout partition?"
          okText="Yes, Drop"
          okType="danger"
          onOk={() => handleDropStudent(record.profile?._id)}
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
              <span><CalendarOutlined /> {classInfo.schedule_days} ({classInfo.schedule_start_time} - {classInfo.schedule_end_time})</span>
              <span><EnvironmentOutlined /> Venue: <Text strong>{classInfo.venue}</Text></span>
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