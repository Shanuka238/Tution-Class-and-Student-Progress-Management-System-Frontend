import apiRequest from "./api.js";
import { API_URLS } from "./apiUrls.js";

export const attendanceAPI = {
  async getMyAttendance() {
    return await apiRequest(`${API_URLS.ATTENDANCE}/student/me`);
  },

  async getSessionAttendance(sessionId) {
    return await apiRequest(`${API_URLS.ATTENDANCE}/session/${sessionId}`);
  },

  async checkSessionAttendanceExists(sessionId) {
    return await apiRequest(`${API_URLS.ATTENDANCE}/session/${sessionId}/exists`);
  },

  async saveBulkAttendance(sessionId, recordsArray) {
    return await apiRequest(`${API_URLS.ATTENDANCE}/session/${sessionId}/bulk`, {
      method: "POST",
      body: {
        records: recordsArray,
      },
    });
  },

  async getAttendanceRegister(courseId) {
    return await apiRequest(`${API_URLS.ATTENDANCE}/register/${courseId}`);
  },

  async getAllAttendance() {
    return await apiRequest(`${API_URLS.ATTENDANCE}/all`);
  },
};