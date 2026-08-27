import { useEffect, useState, useCallback, useMemo } from "react";
import { Card, Tag, Empty, message, theme, Spin, Row, Col, Button, Space, Segmented, Input, Select } from "antd";
import {
  ClockCircleOutlined,
  UserOutlined,
  EnvironmentOutlined,
  BookOutlined,
  LeftOutlined,
  RightOutlined,
  ReloadOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { classAPI } from "../../services/classApi";
import { DAYS_OF_WEEK } from "../../enums/dateTime";
import dayjs from "dayjs";

const WeeklyTimetable = () => {
  const { token: themeToken } = theme.useToken();
  const [classes, setClasses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [viewMode, setViewMode] = useState("current");
  const [searchFilter, setSearchFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");

  const getWeekDates = useCallback(() => {
    const base = dayjs().add(weekOffset, "week");
    const dayNum = base.day(); // 0 is Sunday, 1 is Monday...
    const monday = dayNum === 0 ? base.subtract(6, "day") : base.subtract(dayNum - 1, "day");
    const weekStart = monday.startOf("day");
    const weekEnd = monday.add(6, "day").endOf("day");
    return { weekStart, weekEnd };
  }, [weekOffset]);

  // Load all active courses once to populate subject filter catalog
  const loadAllCourses = useCallback(async () => {
    try {
      const res = await classAPI.getActiveClasses();
      const courseList = res.data?.classes || res.data || res.classes || [];
      setAllCourses(Array.isArray(courseList) ? courseList : []);
    } catch {
      // Non-blocking
    }
  }, []);

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const { weekStart, weekEnd } = getWeekDates();
      const startStr = weekStart.format("YYYY-MM-DD");
      const endStr = weekEnd.format("YYYY-MM-DD");

      const response = await classAPI.getTimetable(startStr, endStr);

      let classesData = [];
      if (response && typeof response === "object") {
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
      console.error("Timetable load error:", error);
      message.error(error.message || "Failed to load timetable data");
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }, [getWeekDates]);


  useEffect(() => {
    loadAllCourses();
  }, [loadAllCourses]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const getWeekLabel = () => {
    const { weekStart, weekEnd } = getWeekDates();
    const startStr = weekStart.format("MMM D");
    const endStr = weekEnd.format("MMM D, YYYY");

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
    const targetDate = weekStart.add(dayIndex, "day");
    return {
      day: DAYS_OF_WEEK[dayIndex],
      date: targetDate.format("MMM D"),
      fullDateStr: targetDate.format("YYYY-MM-DD"),
      fullDate: targetDate.toDate(),
    };
  };

  // Extract unique subjects from both active course catalog and timetable sessions
  const uniqueSubjects = useMemo(() => {
    const set = new Set();
    allCourses.forEach((c) => {
      if (c.subject) set.add(c.subject);
    });
    classes.forEach((cls) => {
      const subj = cls.subject || cls.course_id?.subject;
      if (subj) set.add(subj);
    });
    return Array.from(set);
  }, [allCourses, classes]);

  const getClassesForDay = (dayIndex) => {
    const dayData = getDayWithDate(dayIndex);
    return (classes || [])
      .filter((cls) => {
        if (!cls.date) return false;

        // 1. Match Exact Session Date
        const sessionDateStr = dayjs(cls.date).format("YYYY-MM-DD");
        if (sessionDateStr !== dayData.fullDateStr) return false;

        // 2. Subject Filter
        const subj = cls.subject || cls.course_id?.subject || cls.course_id?.class_name || "";
        if (subjectFilter !== "all" && subj !== subjectFilter) {
          return false;
        }

        // 3. Search Filter
        if (searchFilter.trim()) {
          const q = searchFilter.toLowerCase().trim();
          const title = (cls.class_name || cls.course_id?.class_name || "").toLowerCase();
          const venue = (cls.venue || "").toLowerCase();
          const teacher = (
            cls.teacher_name ||
            `${cls.teacher_id?.user_id?.first_name || ""} ${cls.teacher_id?.user_id?.last_name || ""}`
          ).toLowerCase();

          if (!title.includes(q) && !subj.toLowerCase().includes(q) && !venue.includes(q) && !teacher.includes(q)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = a.start_time || "";
        const timeB = b.start_time || "";
        return timeA.localeCompare(timeB);
      });
  };

  // Get color based on grade
  const getClassColor = (grade) => {
    const colors = {
      "6": "#0284c7",
      "7": "#0d9488",
      "8": "#16a34a",
      "9": "#1890ff",
      "10": "#722ed1",
      "11": "#fa8c16",
      "12": "#f5222d",
      "13": "#4f46e5",
    };
    return colors[String(grade)] || "#4f46e5";
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

  const hasClassesThisWeek = (classes || []).length > 0 && DAYS_OF_WEEK.some((_, idx) => getClassesForDay(idx).length > 0);

  return (
    <div style={{ width: "100%" }}>
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

          <Space size="middle" wrap style={{ width: "100%", justifyContent: "space-between" }}>
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

            <Space size="small" wrap>
              <Input
                prefix={<SearchOutlined style={{ color: "#9CA3AF" }} />}
                placeholder="Search class, venue, teacher..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                allowClear
                style={{ width: 220 }}
              />
              <Select
                value={subjectFilter}
                onChange={(val) => setSubjectFilter(val)}
                style={{ width: 180 }}
                placeholder="Filter by Subject"
              >
                <Select.Option value="all">All Subjects ({uniqueSubjects.length})</Select.Option>
                {uniqueSubjects.map((s) => (
                  <Select.Option key={s} value={s}>
                    {s}
                  </Select.Option>
                ))}
              </Select>
              {(searchFilter || subjectFilter !== "all") && (
                <Button
                  type="text"
                  danger
                  onClick={() => {
                    setSearchFilter("");
                    setSubjectFilter("all");
                  }}
                >
                  Reset
                </Button>
              )}
            </Space>
          </Space>

          <div style={{ fontSize: "13px", color: themeToken.colorTextSecondary }}>
            {hasClassesThisWeek ? (
              <span>
                <CheckCircleOutlined style={{ color: "#10B981", marginRight: "6px" }} />
                Classes found for this week • Total: {classes.length} session(s)
              </span>
            ) : (
              <span style={{ color: themeToken.colorWarning }}>
                <WarningOutlined style={{ color: themeToken.colorWarning, marginRight: "6px" }} />
                No classes scheduled for this week
              </span>
            )}
          </div>

        </Space>
      </div>

      <Row gutter={[16, 16]}>
        {DAYS_OF_WEEK.map((day, index) => {
          const dayData = getDayWithDate(index);
          const dayClasses = getClassesForDay(index);
          const dayIndex = index;
          const isWeekend = dayIndex >= 5;
          const isWeekday = dayIndex < 5;

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
                      const course = cls.course_id || {};
                      const teacher = cls.teacher_id?.user_id;
                      const teacherName = teacher
                        ? `${teacher.first_name || ""} ${teacher.last_name || ""}`.trim()
                        : "Teacher";
                      const borderColor = getClassColor(course.grade);

                      return (
                        <div
                          key={cls._id || cls.session_id}
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
                            Grade {course.grade || "N/A"}
                          </div>

                          <div style={{ marginBottom: "10px", marginTop: "2px" }}>
                            <div style={{
                              fontSize: "15px",
                              fontWeight: 700,
                              color: themeToken.colorText,
                              marginBottom: "4px"
                            }}>
                              {course.class_name || "Class Session"}
                            </div>
                            <div style={{
                              fontSize: "12px",
                              color: themeToken.colorTextSecondary
                            }}>
                              <BookOutlined style={{ marginRight: "4px" }} />
                              {course.subject || "Subject"}
                            </div>
                          </div>

                          <div style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px",
                            fontSize: "12px",
                            color: themeToken.colorTextSecondary
                          }}>
                            <div>
                              <ClockCircleOutlined style={{ marginRight: "6px", color: themeToken.colorPrimary }} />
                              <strong>{cls.start_time} - {cls.end_time}</strong>
                            </div>

                            <div>
                              <EnvironmentOutlined style={{ marginRight: "6px", color: "#52c41a" }} />
                              {cls.venue || "Main Hall"}
                            </div>

                            <div>
                              <UserOutlined style={{ marginRight: "6px", color: "#722ed1" }} />
                              {teacherName}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <span style={{ fontSize: "12px", color: themeToken.colorTextSecondary }}>
                        No classes
                      </span>
                    }
                    style={{ margin: "24px 0" }}
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
