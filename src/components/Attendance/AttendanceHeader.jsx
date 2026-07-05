import { Space, Typography, DatePicker } from "antd";

const { Title, Text } = Typography;

/**
 * Header bar for the Attendance page.
 * Shows title + date picker used to select which day's attendance to view/mark.
 */
const AttendanceHeader = ({ targetDate, onDateChange }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "24px",
      flexWrap: "wrap",
      gap: "16px",
    }}
  >
    <div>
      <Title level={3} style={{ margin: 0 }}>
        Student Attendance Verification
      </Title>
      <Text type="secondary">
        Select a date to view or mark attendance for each class.
      </Text>
    </div>
    <Space>
      <Text strong>Date:</Text>
      <DatePicker
        value={targetDate}
        onChange={(date) => date && onDateChange(date)}
        allowClear={false}
      />
    </Space>
  </div>
);

export default AttendanceHeader;
