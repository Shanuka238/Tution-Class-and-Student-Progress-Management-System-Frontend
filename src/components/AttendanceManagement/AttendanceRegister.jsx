import React from "react";
import { Table, Tag, theme } from "antd";
import dayjs from "dayjs";
import { STATUS_LABELS, STATUS_COLORS } from "../../enums/attendanceStatus";

const AttendanceRegister = ({ students, sessions, attendanceRecords }) => {
  const { token: themeToken } = theme.useToken();

  const attendanceMap = {};
  attendanceRecords.forEach((rec) => {
    const studentId = rec.student_id?._id || rec.student_id;
    const sessionId = rec.session_id?._id || rec.session_id;
    attendanceMap[`${studentId}_${sessionId}`] = rec.status;
  });

  const columns = [
    {
      title: "Student Details",
      key: "student",
      fixed: "left",
      width: 200,
      render: (_, record) => {
        const user = record.user_data || record.user || {};
        return (
          <div>
            <strong>{user.first_name} {user.last_name}</strong>
            <div style={{ fontSize: "11px", color: themeToken.colorTextSecondary }}>
              {record.student_number || "No ID"}
            </div>
          </div>
        );
      },
    },
    ...sessions.map((sess) => ({
      title: dayjs(sess.date).format("DD MMM"),
      key: sess._id,
      width: 80,
      align: "center",
      render: (_, record) => {
        const studentId = record._id;
        const status = attendanceMap[`${studentId}_${sess._id}`];
        if (!status) return <span style={{ color: themeToken.colorTextQuaternary }}>—</span>;

        return (
          <Tag color={STATUS_COLORS[status]} style={{ margin: 0 }}>
            {STATUS_LABELS[status]}
          </Tag>
        );
      },
    })),
    {
      title: "Summary",
      key: "summary",
      fixed: "right",
      width: 120,
      align: "center",
      render: (_, record) => {
        const studentId = record._id;
        let presentCount = 0;
        let totalMarked = 0;

        sessions.forEach((sess) => {
          const status = attendanceMap[`${studentId}_${sess._id}`];
          if (status) {
            totalMarked++;
            if (status === "present" || status === "late") {
              presentCount++;
            }
          }
        });

        if (totalMarked === 0) return <span style={{ color: themeToken.colorTextSecondary }}>No data</span>;
        const percentage = Math.round((presentCount / totalMarked) * 100);

        return (
          <div>
            <strong>{presentCount}/{totalMarked}</strong>
            <div style={{ fontSize: "11px" }}>
              <Tag color={percentage >= 75 ? "success" : "warning"}>{percentage}%</Tag>
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={students}
      rowKey="_id"
      pagination={false}
      scroll={{ x: "max-content" }}
      size="middle"
      bordered
    />
  );
};

export default AttendanceRegister;
