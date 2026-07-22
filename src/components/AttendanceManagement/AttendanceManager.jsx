import React, { useEffect, useState, useCallback, useMemo } from "react";
import { message, theme } from "antd";
import { classAPI } from "../../services/classApi";
import { attendanceAPI } from "../../services/attendanceApi";
import dayjs from "dayjs";

import AttendanceHeader from "./AttendanceHeader";
import AttendanceTable from "./AttendanceTable";
import AttendanceMarkingDrawer from "./AttendanceMarkingDrawer";
import SessionList from "../ClassManagement/SessionList";
import AttendanceRegisterDrawer from "./AttendanceRegisterDrawer";


const AttendanceManager = () => {
  const { token: themeToken } = theme.useToken();

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [activeClass, setActiveClass] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [activeSessionIsMarked, setActiveSessionIsMarked] = useState(false);
  const [roster, setRoster] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [sessionsDrawerVisible, setSessionsDrawerVisible] = useState(false);
  const [selectedCourseForSessions, setSelectedCourseForSessions] = useState(null);
  const [registerDrawerVisible, setRegisterDrawerVisible] = useState(false);
  const [selectedCourseForRegister, setSelectedCourseForRegister] = useState(null);

  const currentUser = useMemo(
    () => JSON.parse(localStorage.getItem("edutracker_user") || "{}"),
    []
  );
  const isAdmin = currentUser.role === "admin";

  const fetchClassSchedule = useCallback(async () => {
    setLoading(true);
    try {
      const response = await classAPI.getActiveClasses();
      const allClasses = response.data || response;
      setClasses(allClasses);
      return allClasses;
    } catch (error) {
      message.error(error.message || "Failed to load class list");
      return [];
    } finally {
      setLoading(false);
    }
  }, [isAdmin, currentUser]);

  useEffect(() => {
    fetchClassSchedule();
  }, [fetchClassSchedule]);

  const handleOpenMarkingSheet = async (classRecord, targetSession, isMarked = false) => {
    setActiveClass(classRecord);
    setDrawerVisible(true);
    setDrawerLoading(true);
    setAttendanceMap({});
    setActiveSessionIsMarked(isMarked);

    try {
      if (!targetSession) {
        throw new Error("Unable to establish class session record.");
      }

      setActiveSession(targetSession);

      const enrolledStudents = (classRecord.enrolled_students || []).map(student => {
        const parts = (student.name || "").split(" ");
        return {
          profile: {
            _id: student.id || student._id,
            student_number: student.student_number
          },
          user: {
            first_name: parts[0] || "",
            last_name: parts.slice(1).join(" ") || ""
          }
        };
      });
      
      setRoster(enrolledStudents);

      const attendanceRes = await attendanceAPI.getSessionAttendance(targetSession._id);
      const savedLogs = attendanceRes.data || attendanceRes;

      const initialMap = {};
      enrolledStudents.forEach((student) => {
        const studentId = student.profile?._id;
        const match = savedLogs.find(
          (log) =>
            String(log.student_id?._id || log.student_id) === String(studentId)
        );
        initialMap[studentId] = match ? match.status : "present";
      });
      setAttendanceMap(initialMap);
    } catch (err) {
      console.error(err);
      message.error("Failed to load attendance roster");
      setDrawerVisible(false);
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleSaveAttendanceBulk = async () => {
    setSaving(true);
    try {
      const recordPayload = Object.entries(attendanceMap).map(
        ([studentId, statusValue]) => ({ student_id: studentId, status: statusValue })
      );

      await attendanceAPI.saveBulkAttendance(
        activeSession._id,
        recordPayload
      );

      message.success("Attendance saved successfully!");
      setDrawerVisible(false);
    } catch (err) {
      message.error(err.message || "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenSessions = (courseRecord) => {
    setSelectedCourseForSessions(courseRecord);
    setSessionsDrawerVisible(true);
  };

  const handleOpenRegister = (courseRecord) => {
    setSelectedCourseForRegister(courseRecord);
    setRegisterDrawerVisible(true);
  };

  const handleMarkAttendanceFromSessionList = (sessionRecord, isMarked) => {
    setSessionsDrawerVisible(false);
    handleOpenMarkingSheet(selectedCourseForSessions, sessionRecord, isMarked);
  };

  return (
    <div
      style={{
        padding: "24px",
        background: themeToken.colorBgContainer,
        borderRadius: "8px",
      }}
    >
      <AttendanceHeader />

      <AttendanceTable
        classes={classes}
        loading={loading}
        onSessionsClick={handleOpenSessions}
        onRegisterClick={handleOpenRegister}
      />

      <AttendanceMarkingDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        activeClass={activeClass}
        activeSession={activeSession}
        targetDate={activeSession ? dayjs(activeSession.date) : null}
        isMarked={activeSessionIsMarked}
        roster={roster}
        attendanceMap={attendanceMap}
        onStatusChange={(studentId, status) =>
          setAttendanceMap((prev) => ({ ...prev, [studentId]: status }))
        }
        onSave={handleSaveAttendanceBulk}
        loading={drawerLoading}
        saving={saving}
      />

      <SessionList
        visible={sessionsDrawerVisible}
        onClose={() => setSessionsDrawerVisible(false)}
        course={selectedCourseForSessions}
        onMarkAttendance={handleMarkAttendanceFromSessionList}
        hideManagement={true}
      />

      <AttendanceRegisterDrawer
        visible={registerDrawerVisible}
        onClose={() => setRegisterDrawerVisible(false)}
        course={selectedCourseForRegister}
      />
    </div>
  );
};

export default AttendanceManager;