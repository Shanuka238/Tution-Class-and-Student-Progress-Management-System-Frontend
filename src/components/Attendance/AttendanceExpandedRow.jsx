import { Table, Tag, Spin, theme } from "antd";
import { STATUS_COLORS } from "../../enums/attendanceStatus";

const AttendanceExpandedRow = ({ logs }) => {
  const { token: themeToken } = theme.useToken();

  if (!logs) {
    return (
      <div style={{ padding: "16px", textAlign: "center" }}>
        <Spin size="small" /> &nbsp;Loading attendance records…
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <p style={{ color: themeToken.colorTextSecondary, padding: "8px 16px" }}>
        No attendance records found for this date.
      </p>
    );
  }

  const columns = [
    {
      title: "Student ID",
      key: "student_id",
      render: (_, log) =>
        log.student_id?.student_number ||
        String(log.student_id?._id || log.student_id).slice(-6),
    },
    {
      title: "Status",
      key: "status",
      render: (_, log) => (
        <Tag color={STATUS_COLORS[log.status] || "default"}>
          {log.status?.charAt(0).toUpperCase() + log.status?.slice(1)}
        </Tag>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={logs}
      rowKey={(log) =>
        String(log._id || log.student_id?._id || log.student_id)
      }
      pagination={false}
      size="small"
      style={{ margin: "0 16px 16px" }}
    />
  );
};

export default AttendanceExpandedRow;
