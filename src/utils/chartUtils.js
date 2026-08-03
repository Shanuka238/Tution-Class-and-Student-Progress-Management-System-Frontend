import dayjs from "dayjs";
import { GRADE_TO_MARKS_MAP } from "./academicUtils";

export const aggregateMonthlyRevenue = (feesList = []) => {
  const monthsMap = {};
  const currentYear = dayjs().year();

  for (let i = 5; i >= 0; i--) {
    const m = dayjs().subtract(i, "month").format("MMM YYYY");
    monthsMap[m] = { month: m, revenue: 0, unpaid: 0 };
  }

  feesList.forEach((fee) => {
    const dateStr = fee.paid_date || fee.created_at || fee.due_date;
    if (!dateStr) return;
    const m = dayjs(dateStr).format("MMM YYYY");
    if (monthsMap[m]) {
      if (fee.status === "paid") {
        monthsMap[m].revenue += fee.amount || 0;
      } else {
        monthsMap[m].unpaid += fee.amount || 0;
      }
    }
  });

  return Object.values(monthsMap);
};

export const aggregateFeeStatusBreakdown = (feesList = []) => {
  let paidCount = 0;
  let unpaidCount = 0;
  let overdueCount = 0;

  feesList.forEach((fee) => {
    if (fee.status === "paid") paidCount++;
    else if (fee.status === "overdue" || (fee.due_date && dayjs(fee.due_date).isBefore(dayjs()))) {
      overdueCount++;
    } else {
      unpaidCount++;
    }
  });

  return [
    { name: "Paid Invoices", value: paidCount, color: "#10B981" },
    { name: "Unpaid Pending", value: unpaidCount, color: "#3B82F6" },
    { name: "Overdue Dues", value: overdueCount, color: "#EF4444" },
  ];
};

export const aggregateEnrollmentByGrade = (classList = []) => {
  const gradeMap = {};

  classList.forEach((cls) => {
    const g = `Grade ${cls.grade || "Other"}`;
    if (!gradeMap[g]) gradeMap[g] = 0;
    gradeMap[g] += cls.max_students || 30; 
  });

  return Object.keys(gradeMap).map((grade) => ({
    grade,
    students: gradeMap[grade],
  }));
};

export const aggregateMonthlyAttendanceTrend = (attendanceLogs = []) => {
  if (!attendanceLogs || attendanceLogs.length === 0) return [];

  const monthsMap = {};
  for (let i = 5; i >= 0; i--) {
    const m = dayjs().subtract(i, "month").format("MMM");
    monthsMap[m] = { month: m, total: 0, present: 0 };
  }

  attendanceLogs.forEach((log) => {
    const dateStr = log.date || log.session_id?.date || log.createdAt;
    if (!dateStr) return;
    const m = dayjs(dateStr).format("MMM");
    if (monthsMap[m]) {
      monthsMap[m].total += 1;
      if (log.status === "present" || log.status === "late") {
        monthsMap[m].present += 1;
      }
    }
  });

  return Object.values(monthsMap).map((item) => ({
    month: item.month,
    rate: item.total > 0 ? Math.round((item.present / item.total) * 100) : 0,
    attendance: item.total > 0 ? Math.round((item.present / item.total) * 100) : 0,
  }));
};

const extractScore = (r) => {
  if (r.marks_obtained !== undefined && r.marks_obtained !== null) {
    return Number(r.marks_obtained);
  }
  if (r.marks !== undefined && r.marks !== null) {
    return Number(r.marks);
  }
  if (r.score !== undefined && r.score !== null) {
    return Number(r.score);
  }
  if (r.grade && GRADE_TO_MARKS_MAP[r.grade]) {
    return GRADE_TO_MARKS_MAP[r.grade];
  }
  return 0;
};

export const aggregateTeacherExamPerformance = (examResults = []) => {
  const examMap = {};
  let passCount = 0;
  let failCount = 0;

  examResults.forEach((r) => {
    const exam = r.exam_id || {};
    const title = exam.exam_title || exam.term || "Assessment";
    const score = extractScore(r);

    if (!examMap[title]) {
      examMap[title] = { exam: title, totalScore: 0, count: 0 };
    }
    examMap[title].totalScore += score;
    examMap[title].count += 1;

    if (score >= 50) {
      passCount++;
    } else {
      failCount++;
    }
  });

  const examAverages = Object.values(examMap).map((item) => ({
    exam: item.exam,
    avg: item.count > 0 ? Math.round(item.totalScore / item.count) : 0,
  }));

  const passFailData = [
    { name: "Passed (>=50%)", value: passCount, color: "#10B981" },
    { name: "Failed (<50%)", value: failCount, color: "#EF4444" },
  ];

  return { examAverages, passFailData };
};

export const aggregateAttendanceBreakdown = (attendanceLogs = []) => {
  if (!attendanceLogs || attendanceLogs.length === 0) return [];

  let present = 0;
  let late = 0;
  let absent = 0;

  attendanceLogs.forEach((log) => {
    if (log.status === "present") present++;
    else if (log.status === "late") late++;
    else if (log.status === "absent") absent++;
  });

  return [
    { name: "Present", value: present, color: "#10B981" },
    { name: "Late", value: late, color: "#F59E0B" },
    { name: "Absent", value: absent, color: "#EF4444" },
  ];
};

export const aggregateExamPerformanceTrend = (examResults = [], selectedSubject = "ALL") => {
  const sorted = [...examResults].sort((a, b) => {
    const dateA = new Date(a.exam_id?.exam_date || a.createdAt || a.date || 0);
    const dateB = new Date(b.exam_id?.exam_date || b.createdAt || b.date || 0);
    if (dateA - dateB !== 0) return dateA - dateB;
    const termA = String(a.exam_id?.term || a.term || "");
    const termB = String(b.exam_id?.term || b.term || "");
    return termA.localeCompare(termB);
  });

  return sorted.slice(-10).map((r, i) => {
    const exam = r.exam_id || {};
    const cls = exam.class_id || {};
    const score = extractScore(r);
    
    const rawDate = exam.exam_date || r.createdAt || r.date;
    const formattedDate = rawDate ? dayjs(rawDate).format("MMM D") : "";
    const termStr = exam.term || exam.exam_title || `Exam ${i + 1}`;
    const subjName = cls.subject || cls.class_name || "";

    let displayLabel = "";
    if (selectedSubject === "ALL" && subjName) {
      displayLabel = formattedDate ? `${subjName} - ${termStr} (${formattedDate})` : `${subjName} - ${termStr}`;
    } else {
      displayLabel = formattedDate ? `${termStr} (${formattedDate})` : termStr;
    }

    return {
      term: displayLabel,
      shortTerm: termStr,
      fullTitle: exam.exam_title || termStr,
      examDate: formattedDate,
      subject: subjName || "Subject",
      score,
      rank: r.rank || i + 1,
    };
  });
};

export const aggregateSubjectComparison = (examResults = [], selectedSubject = "ALL") => {
  if (selectedSubject !== "ALL") {
    return examResults.map((r, i) => {
      const exam = r.exam_id || {};
      const score = extractScore(r);
      const rawDate = exam.exam_date || r.createdAt || r.date;
      const formattedDate = rawDate ? dayjs(rawDate).format("MMM D") : "";
      const examName = exam.exam_title || exam.term || `Exam ${i + 1}`;

      return {
        subject: formattedDate ? `${examName} (${formattedDate})` : examName,
        averageScore: score,
      };
    });
  }

  const subjectMap = {};

  examResults.forEach((r) => {
    const exam = r.exam_id || {};
    const cls = exam.class_id || {};
    const subj = cls.subject || cls.class_name || "General";
    const score = extractScore(r);

    if (!subjectMap[subj]) {
      subjectMap[subj] = { subject: subj, total: 0, count: 0 };
    }
    subjectMap[subj].total += score;
    subjectMap[subj].count += 1;
  });

  return Object.values(subjectMap).map((item) => ({
    subject: item.subject,
    averageScore: item.count > 0 ? Math.round(item.total / item.count) : 0,
  }));
};
