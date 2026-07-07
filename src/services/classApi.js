import apiRequest from "./api.js";
import { API_URLS } from "./apiUrls.js";

export const classAPI = {
  async getActiveClasses() {
    return await apiRequest(API_URLS.CLASSES);
  },

  async getTimetable(startDate = null, endDate = null) {
    let url = `${API_URLS.CLASSES}/timetable`;
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    return await apiRequest(url);
  },

  async createClass(classData) {
    return await apiRequest(API_URLS.CLASSES, {
      method: "POST",
      body: classData,
    });
  },

  async getClassById(classId) {
    return await apiRequest(`${API_URLS.CLASSES}/${classId}`);
  },

  async enrollStudent(studentId, classId) {
    return await apiRequest(`${API_URLS.CLASSES}/enroll`, {
      method: "POST",
      body: { student_id: studentId, class_id: classId },
    });
  },

  async dropStudent(studentId, classId) {
    return await apiRequest(`${API_URLS.CLASSES}/drop`, {
      method: "POST",
      body: { student_id: studentId, class_id: classId },
    });
  },

  async deleteClass(classId) {
    return await apiRequest(`${API_URLS.CLASSES}/${classId}`, {
      method: "DELETE",
    });
  },

  async getCourseSessions(classId) {
    return await apiRequest(`${API_URLS.CLASSES}/${classId}/sessions`);
  },

  async createSession(classId, dateString, startTime, endTime) {
    return await apiRequest(`${API_URLS.CLASSES}/${classId}/sessions`, {
      method: "POST",
      body: { date: dateString, start_time: startTime, end_time: endTime },
    });
  },

  async deleteSession(sessionId) {
    return await apiRequest(`${API_URLS.CLASSES}/sessions/${sessionId}`, {
      method: "DELETE",
    });
  },
};