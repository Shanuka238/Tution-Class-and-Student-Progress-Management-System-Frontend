import { Table, Button, Drawer, Radio, Space, Avatar, theme } from "antd";
import { UserOutlined, SaveOutlined } from "@ant-design/icons";

/**
 * Slide-out drawer for marking or editing attendance for a single class.
 *
 * Props:
 *  - visible: boolean
 *  - onClose: () => void
 *  - activeClass: class object | null
 *  - targetDate: dayjs object
 *  - isMarked: boolean (true = editing existing records)
 *  - roster: array of student user objects
 *  - attendanceMap: { studentId: status }
 *  - onStatusChange: (studentId, status) => void
 *  - onSave: () => void
 *  - loading: boolean (roster loading)
 *  - saving: boolean (save in-progress)
 */
const AttendanceMarkingDrawer = ({
  visible,
  onClose,
  activeClass,
  targetDate,
  isMarked,
  roster,
  attendanceMap,
  onStatusChange,
  onSave,
  loading,
  saving,
}) => {
  const { token: themeToken } = theme.useToken();

  const drawerColumns = [
    {
      title: "Student",
      key: "student",
      render: (_, record) => (
        <Space>
          <Avatar
            icon={<UserOutlined />}
            style={{ backgroundColor: themeToken.colorPrimary }}
          />
          <div>
            <div style={{ fontWeight: "600" }}>
              {record.user?.first_name} {record.user?.last_name}
            </div>
            <div style={{ fontSize: "11px", color: themeToken.colorTextSecondary }}>
              {record.profile?.student_number || "No ID"}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 230,
      render: (_, record) => {
        const studentId = record.profile?._id;
        return (
          <Radio.Group
            value={attendanceMap[studentId]}
            onChange={(e) => onStatusChange(studentId, e.target.value)}
            optionType="button"
            buttonStyle="solid"
            size="small"
          >
            <Radio.Button value="present">Present</Radio.Button>
            <Radio.Button value="absent">Absent</Radio.Button>
            <Radio.Button value="late">Late</Radio.Button>
          </Radio.Group>
        );
      },
    },
  ];

  return (
    <Drawer
      title={
        <div>
          <div style={{ fontSize: "16px", fontWeight: "600" }}>
            {isMarked ? "Edit" : "Mark"} Attendance — {activeClass?.class_name}
          </div>
          <div
            style={{
              fontSize: "12px",
              fontWeight: "400",
              color: themeToken.colorTextSecondary,
            }}
          >
            {targetDate?.format("DD MMMM YYYY")} | {activeClass?.venue}
          </div>
        </div>
      }
      width={580}
      onClose={onClose}
      open={visible}
      destroyOnClose
      extra={
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={saving}
          onClick={onSave}
          disabled={roster.length === 0}
        >
          Save Attendance
        </Button>
      }
    >
      <Table
        columns={drawerColumns}
        dataSource={roster}
        rowKey={(record) => record.profile?._id}
        loading={loading}
        pagination={false}
        size="middle"
        locale={{ emptyText: "No students matched to this grade" }}
      />
    </Drawer>
  );
};

export default AttendanceMarkingDrawer;
