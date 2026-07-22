import { Table, Button, Tag, Space, theme } from "antd";
import { CalendarOutlined, BookOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const AttendanceTable = ({
  classes,
  loading,
  onSessionsClick,
  onRegisterClick,
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
      title: "Active Dates",
      key: "active_dates",
      render: (_, record) => (
        <div style={{ fontSize: "13px" }}>
          <div>Start: {record.start_date ? dayjs(record.start_date).format("MMM DD, YYYY") : "N/A"}</div>
          <div style={{ color: themeToken.colorTextSecondary }}>End: {record.end_date ? dayjs(record.end_date).format("MMM DD, YYYY") : "N/A"}</div>
        </div>
      ),
    },

    {
      title: "Actions",
      key: "actions",
      width: 320,
      render: (_, record) => {
        return (
          <Space size="small">
            <Button
              type="primary"
              size="small"
              icon={<CalendarOutlined />}
              onClick={() => onSessionsClick(record)}
            >
              Sessions
            </Button>
            <Button
              size="small"
              icon={<BookOutlined />}
              onClick={() => onRegisterClick(record)}
            >
              Register
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
    />
  );
};

export default AttendanceTable;
