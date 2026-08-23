import React, { useEffect, useState, useCallback } from "react";
import { Drawer, Spin, message, Typography, Space } from "antd";
import { BookOutlined } from "@ant-design/icons";
import { attendanceAPI } from "../../services/attendanceApi";
import AttendanceRegister from "./AttendanceRegister";

const { Text } = Typography;

const AttendanceRegisterDrawer = ({ visible, onClose, course }) => {
  const [data, setData] = useState({ sessions: [], attendance: [] });
  const [loading, setLoading] = useState(false);

  const fetchRegisterData = useCallback(async () => {
    if (!course) return;
    setLoading(true);
    try {
      const res = await attendanceAPI.getAttendanceRegister(course._id);
      setData(res.data || res || { sessions: [], attendance: [] });
    } catch (error) {
      console.error("Error fetching register:", error);
      message.error("Failed to load attendance register data");
    } finally {
      setLoading(false);
    }
  }, [course]);

  useEffect(() => {
    if (visible && course) {
      fetchRegisterData();
    }
  }, [visible, course, fetchRegisterData]);

  const studentsList = (course?.enrolled_students || []).map((student) => {
    const parts = (student.name || "").split(" ");
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || "";
    return {
      _id: student.id || student._id,
      student_number: student.student_number,
      user_data: {
        first_name: firstName,
        last_name: lastName,
        email: student.email,
      },
    };
  });

  return (
    <Drawer
      title={
        <div>
          <Space>
            <BookOutlined />
            <span style={{ fontSize: "16px", fontWeight: "600" }}>
              Attendance Register: {course?.class_name}
            </span>
          </Space>
          <div style={{ fontSize: "12px", fontWeight: "400", color: "#8c8c8c", marginTop: "4px" }}>
            Subject: {course?.subject} • Grade {course?.grade} • Educator: {course?.teacher_id?.user_id?.first_name} {course?.teacher_id?.user_id?.last_name}
          </div>
        </div>
      }
      width={950}
      onClose={onClose}
      open={visible}
      destroyOnClose
    >
      {loading ? (
        <div style={{ padding: "64px", textAlign: "center" }}>
          <Spin size="large" tip="Compiling register grid..." />
        </div>
      ) : studentsList.length === 0 ? (
        <div style={{ padding: "48px", textAlign: "center" }}>
          <Text type="secondary">No students are currently enrolled in this course.</Text>
        </div>
      ) : (
        <AttendanceRegister
          students={studentsList}
          sessions={data.sessions || []}
          attendanceRecords={data.attendance || []}
        />
      )}
    </Drawer>
  );
};

export default AttendanceRegisterDrawer;
