import { ATTENDANCE_STATUS } from "../enums/attendanceStatus";
import { FEE_STATUS } from "../enums/feeStatus";

export const GRADE_TO_MARKS_MAP = Object.freeze({
  A: 85,
  B: 75,
  C: 65,
  S: 55,
  F: 35,
});

export const calculateGrowthMetrics = (attendanceLogs = [], examResults = [], feeInvoices = []) => {
  let presentCount = 0;
  let lateCount = 0;
  let absentCount = 0;

  attendanceLogs.forEach((r) => {
    if (r.status === ATTENDANCE_STATUS.PRESENT) presentCount++;
    else if (r.status === ATTENDANCE_STATUS.LATE) lateCount++;
    else if (r.status === ATTENDANCE_STATUS.ABSENT) absentCount++;
  });

  const totalAttendance = attendanceLogs.length;
  const attendancePct =
    totalAttendance > 0
      ? Math.round(((presentCount + lateCount * 0.5) / totalAttendance) * 100)
      : 100;

  const unpaidFees = feeInvoices.filter((f) => f.status !== FEE_STATUS.PAID);
  const totalUnpaidAmount = unpaidFees.reduce((acc, f) => acc + (f.amount || 0), 0);

  const validExamScores = examResults.map((r) => {
    let markVal = r.marks;
    if ((markVal === undefined || markVal === null || markVal === 0) && r.grade && GRADE_TO_MARKS_MAP[r.grade]) {
      markVal = GRADE_TO_MARKS_MAP[r.grade];
    }
    return markVal !== undefined && markVal !== null ? markVal : 0;
  });

  const avgExamScore =
    examResults.length > 0
      ? Math.round(validExamScores.reduce((acc, val) => acc + val, 0) / examResults.length)
      : 0;

  const attendanceFactor = totalAttendance > 0 ? attendancePct : 100;
  const examFactor = examResults.length > 0 ? avgExamScore : 100;
  const feeStandingFactor = unpaidFees.length === 0 ? 100 : 50;

  const growthIndex = Math.round(
    attendanceFactor * 0.45 + examFactor * 0.45 + feeStandingFactor * 0.10
  );

  return {
    presentCount,
    lateCount,
    absentCount,
    totalAttendance,
    attendancePct,
    unpaidFees,
    totalUnpaidAmount,
    avgExamScore,
    growthIndex,
  };
};

export const getGrowthBadge = (score) => {
  if (score >= 85) return { color: "#10B981", label: "🌟 Excellent Progress", text: "Thriving in all academic domains" };
  if (score >= 70) return { color: "#3B82F6", label: "📈 Good Standing", text: "Consistent attendance & solid performance" };
  return { color: "#EF4444", label: "⚠️ Attention Recommended", text: "Requires focus on attendance or exam revision" };
};
