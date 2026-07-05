import { Table, Button, Tag, Space, theme } from "antd";
import { CalendarOutlined, CheckCircleOutlined, EditOutlined } from "@ant-design/icons";
import AttendanceExpandedRow from "./AttendanceExpandedRow";

/**
 * Main class listing table with:
 * - Class title, schedule, attendance status columns
 * - Mark / Edit Attendance action button per row
 * - Expandable rows showing the per-student attendance summary (only for marked classes)
 *
 * Props:
 *  - classes: array of class objects
 *  - loading: boolean
 *  - markedMap: { classId: boolean }
 *  - savedAttendanceMap: { classId: log[] | undefined }
 *  - expandedRows: Set of classIds
 *  - onMarkClick: (classRecord) => void
 *  - onToggleExpand: (classRecord) => void
 */
const AttendanceTable = ({
  classes,
  loading,
  markedMap,
  savedAttendanceMap,
  expandedRows,
  onMarkClick,
  onToggleExpand,
}) => {
  const { token: themeToken } = theme.useToken();

  const columns = [
    {
      title: "Class Title",
      key: "name",
      render: (_, record) => (
        <div>
          <div>
            <strong>{record.class_name}</strong>
          </div>
          <div style={{ fontSize: "12px", color: themeToken.colorTextSecondary }}>
            {record.subject} • Grade {record.grade}
          </div>
        </div>
      ),
    },
    {
      title: "Schedule & Room",
      key: "schedule",
      render: (_, record) => (
        <div>
          <div>
            <CalendarOutlined /> {record.schedule_days}
          </div>
          <div style={{ fontSize: "12px", color: themeToken.colorTextSecondary }}>
            {record.schedule_start_time} – {record.schedule_end_time} |{" "}
            <strong>{record.venue}</strong>
          </div>
        </div>
      ),
    },
    {
      title: "Attendance Status",
      key: "status",
      width: 160,
      render: (_, record) =>
        markedMap[record._id] ? (
          <Tag color="success">Marked ✓</Tag>
        ) : (
          <Tag color="default">Not Marked</Tag>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_, record) => {
        const isMarked = markedMap[record._id];
        return (
          <Space>
            <Button
              type={isMarked ? "default" : "primary"}
              icon={isMarked ? <EditOutlined /> : <CheckCircleOutlined />}
              onClick={() => onMarkClick(record)}
            >
              {isMarked ? "Edit Attendance" : "Mark Attendance"}
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={classes}
      rowKey="_id"
      loading={loading}
      locale={{ emptyText: "No assigned classes found" }}
      expandable={{
        expandedRowRender: (record) => (
          <AttendanceExpandedRow logs={savedAttendanceMap[record._id]} />
        ),
        expandedRowKeys: Array.from(expandedRows),
        onExpand: (_, record) => onToggleExpand(record),
        rowExpandable: (record) => !!markedMap[record._id],
      }}
    />
  );
};

export default AttendanceTable;
