import { useEffect, useState, useCallback } from "react";
import { Card, Tag, Empty, message, theme, Spin, Row, Col, Button, Space, Segmented } from "antd";
import { ClockCircleOutlined, UserOutlined, EnvironmentOutlined, BookOutlined, LeftOutlined, RightOutlined, ReloadOutlined } from "@ant-design/icons";
import { classAPI } from "../../services/classApi";

const WeeklyTimetable = () => {
  const { token: themeToken } = theme.useToken();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [viewMode, setViewMode] = useState("current");

  const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await classAPI.getTimetable();

      let classesData = [];
      if (response && typeof response === 'object') {
        if (Array.isArray(response)) {
          classesData = response;
        } else if (response.data && Array.isArray(response.data)) {
          classesData = response.data;
        } else if (response.success && response.data) {
          classesData = Array.isArray(response.data) ? response.data : [];
        }
      }

      setClasses(classesData);
    } catch (error) {
      message.error(error.message || "Failed to load timetable data");
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();

    const interval = setInterval(fetchClasses, 5000);
    return () => clearInterval(interval);
  }, [fetchClasses]);

  const getWeekDates = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));

    const weekStart = new Date(monday);
    weekStart.setDate(weekStart.getDate() + weekOffset * 7);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return { weekStart, weekEnd };
  };

  const isClassInWeek = (classDate) => {
    if (!classDate) return false;
    const { weekStart, weekEnd } = getWeekDates();
    const classDateObj = new Date(classDate);
    classDateObj.setHours(0, 0, 0, 0);
    return classDateObj >= weekStart && classDateObj <= weekEnd;
  };

  const getWeekLabel = () => {
    const { weekStart, weekEnd } = getWeekDates();
    const options = { month: "short", day: "numeric" };
    const startStr = weekStart.toLocaleDateString("en-US", options);
    const endStr = weekEnd.toLocaleDateString("en-US", options);

    if (weekOffset === 0) {
      return `This Week (${startStr} - ${endStr})`;
    } else if (weekOffset === -1) {
      return `Last Week (${startStr} - ${endStr})`;
    } else if (weekOffset === 1) {
      return `Next Week (${startStr} - ${endStr})`;
    } else {
      return `Week of ${startStr} - ${endStr}`;
    }
  };

  const getDayWithDate = (dayIndex) => {
    const { weekStart } = getWeekDates();
    const date = new Date(weekStart);
    date.setDate(date.getDate() + dayIndex);
    return {
      day: DAYS_OF_WEEK[dayIndex],
      date: date.toLocaleDateString("en-US", { month: "numeric", day: "numeric" }),
      fullDate: date
    };
  };

  const getClassesForDay = (dayIndex) => {
    const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    return classes
      .filter(cls => {
        if (cls.schedule_date) {
          if (!isClassInWeek(cls.schedule_date)) return false;
          const classDate = new Date(cls.schedule_date);
          const dayOfWeek = classDate.getDay();
          const classDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; 
          return classDay === dayIndex;
        }

        return cls.schedule_days === DAYS_OF_WEEK[dayIndex];
      })
      .sort((a, b) => {
        return a.schedule_start_time.localeCompare(b.schedule_start_time);
      });
  };

  // Get color based on grade
  const getClassColor = (grade) => {
    const colors = {
      "9": "#1890ff",
      "10": "#722ed1",
      "11": "#fa8c16",
      "12": "#f5222d",
      "A": "#52c41a",
      "B": "#13c2c2",
      "C": "#1890ff",
    };
    return colors[grade] || "#1890ff";
  };

  const handlePreviousWeek = () => {
    setWeekOffset(prev => prev - 1);
  };

  const handleNextWeek = () => {
    setWeekOffset(prev => prev + 1);
  };

  const handleToday = () => {
    setWeekOffset(0);
  };

  if (loading && classes.length === 0) {
    return (
      <Card style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (!classes || classes.length === 0) {
    return (
      <Card style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <Empty
          description="No classes scheduled"
          style={{ padding: "60px 20px" }}
        />
      </Card>
    );
  }

  const hasClassesThisWeek = DAYS_OF_WEEK.some((_, idx) => getClassesForDay(idx).length > 0);

  return (
    <div style={{ width: "100%" }}>
      {/* Header */}
      <div style={{
        marginBottom: "24px",
        paddingBottom: "16px",
        borderBottom: `2px solid ${themeToken.colorBorderSecondary}`
      }}>
        <h2 style={{
          margin: "0 0 16px 0",
          fontSize: "24px",
          fontWeight: 700,
          color: themeToken.colorText
        }}>
          Weekly Timetable
        </h2>

        {/* Controls */}
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          {/* Week Navigation */}
          <Space size="large" wrap>
            <Button
              icon={<LeftOutlined />}
              onClick={handlePreviousWeek}
              style={{ borderRadius: "6px" }}
            >
              Previous Week
            </Button>

            <Button
              onClick={handleToday}
              type={weekOffset === 0 ? "primary" : "default"}
              style={{ borderRadius: "6px" }}
            >
              This Week
            </Button>

            <Button
              icon={<RightOutlined />}
              onClick={handleNextWeek}
              style={{ borderRadius: "6px" }}
            >
              Next Week
            </Button>

            <Button
              icon={<ReloadOutlined />}
              onClick={fetchClasses}
              loading={loading}
              style={{ borderRadius: "6px" }}
            >
              Refresh
            </Button>

            <Tag color="blue" style={{ padding: "4px 12px", fontSize: "12px", fontWeight: 600 }}>
              {getWeekLabel()}
            </Tag>
          </Space>

          {/* View Mode Toggle */}
          <Space size="middle" wrap>
            <span style={{ fontSize: "13px", color: themeToken.colorTextSecondary }}>View:</span>
            <Segmented
              value={viewMode}
              onChange={setViewMode}
              options={[
                { label: "All Days", value: "current" },
                { label: "Weekdays Only", value: "weekdays" },
                { label: "Weekends Only", value: "weekends" },
              ]}
              style={{ borderRadius: "6px" }}
            />
          </Space>

          {/* Info */}
          <div style={{ fontSize: "13px", color: themeToken.colorTextSecondary }}>
            {hasClassesThisWeek ? (
              <span>✓ Classes found for this week • Total: {classes.length} classes</span>
            ) : (
              <span style={{ color: themeToken.colorWarning }}>⚠ No classes scheduled for this week</span>
            )}
          </div>
        </Space>
      </div>

      {/* Timetable */}
      <Row gutter={[16, 16]}>
        {DAYS_OF_WEEK.map((day, index) => {
          const dayData = getDayWithDate(index);
          const dayClasses = getClassesForDay(index);
          const dayIndex = index;
          const isWeekend = dayIndex >= 5;
          const isWeekday = dayIndex < 5;

          // Filter based on view mode
          let shouldShow = true;
          if (viewMode === "weekdays" && isWeekend) shouldShow = false;
          if (viewMode === "weekends" && isWeekday) shouldShow = false;

          if (!shouldShow) return null;

          return (
            <Col key={day} xs={24} sm={12} lg={8} xl={6}>
              <Card
                title={
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: "16px", fontWeight: 600, color: themeToken.colorText }}>
                        {dayData.day}
                      </div>
                      <div style={{ fontSize: "12px", color: themeToken.colorTextSecondary, marginTop: "2px" }}>
                        {dayData.date}
                      </div>
                    </div>
                    {isWeekend && (
                      <Tag color="gold" style={{ marginLeft: "8px" }}>Weekend</Tag>
                    )}
                  </div>
                }
                size="small"
                style={{
                  borderRadius: "12px",
                  border: `1px solid ${themeToken.colorBorderSecondary}`,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  transition: "all 0.3s ease",
                  height: "100%"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
                }}
              >
                {dayClasses.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {dayClasses.map((cls) => {
                      const teacher = cls.teacher_id?.user_id;
                      const borderColor = getClassColor(cls.grade);

                      return (
                        <div
                          key={cls._id}
                          style={{
                            padding: "12px",
                            border: `2px solid ${borderColor}`,
                            borderRadius: "8px",
                            background: themeToken.colorBgContainer,
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            position: "relative",
                            overflow: "hidden"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-4px)";
                            e.currentTarget.style.boxShadow = `0 4px 12px ${borderColor}40`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        >
                          {/* Grade Badge */}
                          <div style={{
                            position: "absolute",
                            top: "0",
                            right: "0",
                            background: borderColor,
                            color: "white",
                            padding: "4px 8px",
                            fontSize: "11px",
                            fontWeight: 700,
                            borderRadius: "0 8px 0 4px"
                          }}>
                            Grade {cls.grade}
                          </div>

                          {/* Class Name and Subject */}
                          <div style={{ marginBottom: "10px", marginTop: "2px" }}>
                            <div style={{
                              fontSize: "15px",
                              fontWeight: 700,
                              color: themeToken.colorText,
                              marginBottom: "4px"
                            }}>
                              {cls.class_name}
                            </div>
                            <div style={{
                              fontSize: "12px",
                              color: themeToken.colorTextSecondary,
                              display: "flex",
                              alignItems: "center",
                              gap: "4px"
                            }}>
                              <BookOutlined style={{ fontSize: "11px" }} />
                              {cls.subject}
                            </div>
                          </div>

                          {/* Divider */}
                          <div style={{
                            height: "1px",
                            background: `${borderColor}30`,
                            marginBottom: "10px"
                          }} />

                          {/* Time */}
                          <div style={{
                            fontSize: "12px",
                            marginBottom: "6px",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontWeight: 500,
                            color: themeToken.colorText
                          }}>
                            <ClockCircleOutlined style={{ color: borderColor, fontSize: "13px" }} />
                            {cls.schedule_start_time} - {cls.schedule_end_time}
                          </div>

                          {/* Teacher */}
                          <div style={{
                            fontSize: "12px",
                            marginBottom: "6px",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            color: themeToken.colorTextSecondary
                          }}>
                            <UserOutlined style={{ fontSize: "12px" }} />
                            {teacher ? `${teacher.first_name} ${teacher.last_name}` : "Unassigned"}
                          </div>

                          {/* Venue */}
                          <div style={{
                            fontSize: "12px",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            color: themeToken.colorTextSecondary
                          }}>
                            <EnvironmentOutlined style={{ fontSize: "12px" }} />
                            {cls.venue}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <Empty
                    description={
                      <span style={{ fontSize: "12px", color: themeToken.colorTextSecondary }}>
                        No classes
                      </span>
                    }
                    style={{ margin: "20px 0" }}
                  />
                )}
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default WeeklyTimetable;
