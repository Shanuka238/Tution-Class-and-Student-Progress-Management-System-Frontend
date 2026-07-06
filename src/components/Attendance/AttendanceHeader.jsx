import { Space, Typography, DatePicker } from "antd";

const { Title, Text } = Typography;

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
        Select a class to view its sessions and manage attendance.
      </Text>
    </div>
  </div>
);

export default AttendanceHeader;
