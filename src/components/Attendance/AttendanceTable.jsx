import { Table, Button, Tag, Space, theme } from "antd";
import { CalendarOutlined,BookOutlined } from "@ant-design/icons";

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
      title: "Room/Venue",
      key: "schedule",
      render: (_, record) => (
        <div>
          <Tag color="blue">{record.venue}</Tag>
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
