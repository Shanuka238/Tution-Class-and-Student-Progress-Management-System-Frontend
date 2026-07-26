import { useState } from "react";
import { Tabs, theme } from "antd";
import { BookOutlined, CalendarOutlined } from "@ant-design/icons";
import ClassList from "./ClassList";
import WeeklyTimetable from "./WeeklyTimetable";

const ClassSection = () => {
  const { token: themeToken } = theme.useToken();
  const user = JSON.parse(localStorage.getItem("edutracker_user") || "{}");
  const isTeacher = user.role === "teacher";

  const [activeTab, setActiveTab] = useState(isTeacher ? "timetable" : "manage");

  const items = isTeacher
    ? [
        {
          key: "timetable",
          label: "Weekly Timetable",
          icon: <CalendarOutlined />,
          children: <WeeklyTimetable />,
        },
        {
          key: "manage",
          label: "My Classes & Rosters",
          icon: <BookOutlined />,
          children: <ClassList />,
        },
      ]
    : [
        {
          key: "manage",
          label: "Manage Classes",
          icon: <BookOutlined />,
          children: <ClassList />,
        },
        {
          key: "timetable",
          label: "Weekly Timetable",
          icon: <CalendarOutlined />,
          children: <WeeklyTimetable />,
        },
      ];

  return (
    <div style={{
      padding: "24px",
      background: themeToken.colorBgContainer,
      borderRadius: "8px",
      border: `1px solid ${themeToken.colorBorderSecondary}`
    }}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={items}
        style={{ marginTop: "16px" }}
      />
    </div>
  );
};

export default ClassSection;
