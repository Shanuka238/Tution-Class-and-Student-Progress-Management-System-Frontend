import { useState } from "react";
import { Tabs, theme } from "antd";
import { BookOutlined, CalendarOutlined } from "@ant-design/icons";
import ClassList from "./ClassList";
import WeeklyTimetable from "./WeeklyTimetable";

const ClassSection = () => {
  const { token: themeToken } = theme.useToken();
  const [activeTab, setActiveTab] = useState("manage");

  const user = JSON.parse(localStorage.getItem("edutracker_user") || "{}");
  const canManage = user.role === "admin";

  const items = [
    {
      key: "manage",
      label: (
        <span>
          <BookOutlined />
          Manage Classes
        </span>
      ),
      children: <ClassList />,
    },
    {
      key: "timetable",
      label: (
        <span>
          <CalendarOutlined />
          Weekly Timetable
        </span>
      ),
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
