import {
  DashboardOutlined,
  TeamOutlined,
  BookOutlined,
  CheckSquareOutlined,
  FileTextOutlined,
  DollarOutlined,
  BarChartOutlined,
  RobotOutlined,
  EyeOutlined,
  HistoryOutlined,
  TrophyOutlined,
  CreditCardOutlined,
  RiseOutlined,
} from "@ant-design/icons";

export const NAV_CONFIG = {
  admin: [
    { key: "overview",   icon: <DashboardOutlined />,    label: "Dashboard Overview" },
    { key: "users",      icon: <TeamOutlined />,          label: "User Management" },
    { key: "classes",    icon: <BookOutlined />,          label: "Class & Timetable" },
    { key: "attendance", icon: <CheckSquareOutlined />,   label: "Attendance" },
    { key: "exams",      icon: <FileTextOutlined />,      label: "Exams & Results" },
    { key: "analytics",  icon: <BarChartOutlined />,      label: "Performance Analytics" },
    { key: "payments",   icon: <DollarOutlined />,        label: "Payment Management" },
  ],

  teacher: [
    { key: "overview",   icon: <DashboardOutlined />,    label: "Dashboard Overview" },
    { key: "classes",    icon: <BookOutlined />,          label: "Class & Timetable" },
    { key: "attendance", icon: <CheckSquareOutlined />,   label: "Attendance" },
    { key: "exams",      icon: <FileTextOutlined />,      label: "Exams & Results" },
    { key: "analytics",  icon: <BarChartOutlined />,      label: "Performance Analytics" },
  ],

  student: [
    { key: "overview",   icon: <DashboardOutlined />,    label: "Dashboard Overview" },
    { key: "classes",    icon: <EyeOutlined />,           label: "View Timetable" },
    { key: "attendance", icon: <HistoryOutlined />,       label: "View Attendance" },
    { key: "exams",      icon: <TrophyOutlined />,        label: "View Exams & Results" },
    { key: "analytics",  icon: <RiseOutlined />,          label: "My Performance" },
    { key: "payments",   icon: <CreditCardOutlined />,    label: "Payments" },
  ],

  parent: [
    { key: "overview",   icon: <DashboardOutlined />,    label: "Dashboard Overview" },
    { key: "progress",   icon: <RiseOutlined />,          label: "Child Progress" },
    { key: "attendance", icon: <HistoryOutlined />,       label: "Attendance" },
    { key: "exams",      icon: <TrophyOutlined />,        label: "Exams & Results" },
    { key: "analytics",  icon: <BarChartOutlined />,      label: "Performance Analytics" },
    { key: "payments",   icon: <CreditCardOutlined />,    label: "Payment Management" },
  ],
};

export const ROLE_LABELS = {
  admin:   "Administrator",
  teacher: "Teacher",
  student: "Student",
  parent:  "Parent",
};
