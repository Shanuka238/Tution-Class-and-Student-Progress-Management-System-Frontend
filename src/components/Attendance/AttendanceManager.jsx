import React, { useEffect, useState, useCallback, useMemo } from "react";
import { message, theme } from "antd";
import { classAPI } from "../../services/classApi";
import { adminAPI } from "../../services/adminApi";
import { attendanceAPI } from "../../services/attendanceApi";
import dayjs from "dayjs";

import AttendanceHeader from "./AttendanceHeader";
import AttendanceTable from "./AttendanceTable";
import AttendanceMarkingDrawer from "./AttendanceMarkingDrawer";

/**
 * AttendanceManager — orchestrator component.
 * Owns all state and API calls; delegates rendering to sub-components.
 */
const AttendanceManager = () => {
  const { token: themeToken } = theme.useToken();

  // ── Core state ──────────────────────────────────────────────────────────────
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [targetDate, setTargetDate] = useState(dayjs());

  // { classId: boolean } — whether attendance has been marked for the selected date
  const [markedMap, setMarkedMap] = useState({});
  // { classId: log[] | undefined } — cached attendance rows for expandable view
  const [savedAttendanceMap, setSavedAttendanceMap] = useState({});
  // Set of expanded class IDs
  const [expandedRows, setExpandedRows] = useState(new Set());

  // ── Drawer state ────────────────────────────────────────────────────────────
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [activeClass, setActiveClass] = useState(null);
  const [roster, setRoster] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({}); // { studentId: status }
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const currentUser = useMemo(
    () => JSON.parse(localStorage.getItem("edutracker_user") || "{}"),
    []
  );
  const isAdmin = currentUser.role === "admin";

  // ── Helpers ─────────────────────────────────────────────────────────────────
  /** Resolves the marked-status map for a list of classes on a date. */
  const resolveMarkedMap = useCallback(async (classList, date) => {
    const dateStr = date.format("YYYY-MM-DD");
    const results = await Promise.allSettled(
      classList.map((cls) => attendanceAPI.checkAttendanceExists(cls._id, dateStr))
    );
    const newMarkedMap = {};
    classList.forEach((cls, idx) => {
      const res = results[idx];
      newMarkedMap[cls._id] =
        res.status === "fulfilled"
          ? (res.value?.data?.marked ?? res.value?.marked ?? false)
          : false;
    });
    return newMarkedMap;
  }, []);

  // ── Initial load: classes + marked status in one go ──────────────────────────
  // Keeps the table in loading state until BOTH fetches are complete,
  // preventing the "Not Marked → Marked" flash on first render.
  const initialLoad = useCallback(async (date) => {
    setLoading(true);
    try {
      const response = await classAPI.getActiveClasses();
      const allClasses = response.data || response;
      const filtered = isAdmin
        ? allClasses
        : allClasses.filter(
            (c) =>
              String(c.teacher_id?._id || c.teacher_id) ===
              String(currentUser.profile_id || currentUser._id)
          );

      // Fetch marked status while still inside the loading state
      const newMarkedMap =
        filtered.length > 0 ? await resolveMarkedMap(filtered, date) : {};

      // Single batched update — table renders once with full data
      setClasses(filtered);
      setMarkedMap(newMarkedMap);
      setExpandedRows(new Set());
      setSavedAttendanceMap({});
    } catch (error) {
      message.error(error.message || "Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  }, [isAdmin, currentUser, resolveMarkedMap]);

  useEffect(() => {
    initialLoad(targetDate);
  }, [initialLoad]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Date change: re-check marked status for the new date ───────────────────
  const handleDateChange = async (date) => {
    setTargetDate(date);
    setExpandedRows(new Set());
    setSavedAttendanceMap({});
    if (classes.length === 0) return;
    const newMarkedMap = await resolveMarkedMap(classes, date);
    setMarkedMap(newMarkedMap);
  };

  // ── Expandable row: fetch attendance for a class ─────────────────────────────
  const fetchSavedAttendance = async (classRecord) => {
    try {
      const res = await attendanceAPI.getClassAttendance(
        classRecord._id,
        targetDate.format("YYYY-MM-DD")
      );
      const logs = res.data || res;
      setSavedAttendanceMap((prev) => ({ ...prev, [classRecord._id]: logs }));
    } catch {
      setSavedAttendanceMap((prev) => ({ ...prev, [classRecord._id]: [] }));
    }
  };

  const handleToggleExpand = (record) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(record._id)) {
      newSet.delete(record._id);
    } else {
      newSet.add(record._id);
      if (!savedAttendanceMap[record._id]) fetchSavedAttendance(record);
    }
    setExpandedRows(newSet);
  };

  // ── Open marking drawer ─────────────────────────────────────────────────────
  const handleOpenMarkingSheet = async (classRecord) => {
    setActiveClass(classRecord);
    setDrawerVisible(true);
    setDrawerLoading(true);
    setAttendanceMap({});

    try {
      const usersResponse = await adminAPI.getAllUsers();
      const allUsers = usersResponse.data || usersResponse;
      const enrolledStudents = allUsers.filter(
        (item) =>
          item.user?.role === "student" &&
          item.profile?.grade?.toString() === classRecord.grade?.toString()
      );
      setRoster(enrolledStudents);

      const attendanceRes = await attendanceAPI.getClassAttendance(
        classRecord._id,
        targetDate.format("YYYY-MM-DD")
      );
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
    } catch {
      message.error("Failed to load attendance roster");
    } finally {
      setDrawerLoading(false);
    }
  };

  // ── Save attendance ──────────────────────────────────────────────────────────
  const handleSaveAttendanceBulk = async () => {
    setSaving(true);
    try {
      const recordPayload = Object.entries(attendanceMap).map(
        ([studentId, statusValue]) => ({ student_id: studentId, status: statusValue })
      );

      await attendanceAPI.saveBulkAttendance(
        activeClass._id,
        targetDate.format("YYYY-MM-DD"),
        recordPayload
      );

      message.success("Attendance saved successfully!");

      // Mark this class as attended and invalidate its cached expand data
      setMarkedMap((prev) => ({ ...prev, [activeClass._id]: true }));
      setSavedAttendanceMap((prev) => {
        const next = { ...prev };
        delete next[activeClass._id];
        return next;
      });

      setDrawerVisible(false);
    } catch (err) {
      message.error(err.message || "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        padding: "24px",
        background: themeToken.colorBgContainer,
        borderRadius: "8px",
      }}
    >
      <AttendanceHeader targetDate={targetDate} onDateChange={handleDateChange} />

      <AttendanceTable
        classes={classes}
        loading={loading}
        markedMap={markedMap}
        savedAttendanceMap={savedAttendanceMap}
        expandedRows={expandedRows}
        onMarkClick={handleOpenMarkingSheet}
        onToggleExpand={handleToggleExpand}
      />

      <AttendanceMarkingDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        activeClass={activeClass}
        targetDate={targetDate}
        isMarked={!!markedMap[activeClass?._id]}
        roster={roster}
        attendanceMap={attendanceMap}
        onStatusChange={(studentId, status) =>
          setAttendanceMap((prev) => ({ ...prev, [studentId]: status }))
        }
        onSave={handleSaveAttendanceBulk}
        loading={drawerLoading}
        saving={saving}
      />
    </div>
  );
};

export default AttendanceManager;