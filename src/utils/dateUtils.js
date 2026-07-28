import dayjs from "dayjs";

export const formatDate = (date, formatStr = "MMM D, YYYY") => {
  if (!date) return "—";
  return dayjs(date).format(formatStr);
};

export const formatDateTime = (date) => {
  if (!date) return "—";
  return dayjs(date).format("MMM D, YYYY h:mm A");
};

export const isToday = (date) => {
  if (!date) return false;
  return dayjs(date).isSame(dayjs(), "day");
};
