export const GRADE_COLORS = Object.freeze({
  A: "green",
  B: "blue",
  C: "orange",
  S: "warning",
  F: "red",
});

export const getGradeColor = (grade) => {
  return GRADE_COLORS[grade] || "default";
};
