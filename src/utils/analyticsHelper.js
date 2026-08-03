import { DEFAULT_FILTER_ALL } from "../enums/analyticsConfig";

export const extractUniqueSubjects = (examResults = []) => {
  const subjectsSet = new Set();
  examResults.forEach((r) => {
    const cls = r.exam_id?.class_id || {};
    const subj = cls.subject || cls.class_name;
    if (subj) subjectsSet.add(subj);
  });
  return Array.from(subjectsSet);
};

export const filterExamResults = (examResults = [], selectedSubject = DEFAULT_FILTER_ALL, selectedTerm = DEFAULT_FILTER_ALL) => {
  return examResults.filter((r) => {
    const cls = r.exam_id?.class_id || {};
    const subj = cls.subject || cls.class_name || "";
    const term = r.exam_id?.term || r.term || "";

    const matchSubject = selectedSubject === DEFAULT_FILTER_ALL || subj === selectedSubject;
    const matchTerm = selectedTerm === DEFAULT_FILTER_ALL || term === selectedTerm;

    return matchSubject && matchTerm;
  });
};

export const calculateFilteredStats = (trendData = []) => {
  if (!trendData || trendData.length === 0) {
    return { avg: 0, highest: 0, lowest: 0 };
  }
  const scores = trendData.map((d) => d.score || 0);
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const highest = Math.max(...scores);
  const lowest = Math.min(...scores);

  return { avg, highest, lowest };
};
