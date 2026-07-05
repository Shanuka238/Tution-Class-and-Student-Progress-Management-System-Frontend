import apiRequest from "./api.js";

export const attendanceAPI = {
  /**
   * Fetch daily tracking status matrix logs for an active class
   */
  async getClassAttendance(classId, dateString) {
    return await apiRequest(`/attendance/${classId}?date=${dateString}`);
  },

  /**
   * Checks if attendance has already been marked for a class on a given date
   * Returns { marked: true/false }
   */
  async checkAttendanceExists(classId, dateString) {
    return await apiRequest(`/attendance/${classId}/exists?date=${dateString}`);
  },

  /**
   * Submits a chunk payload array directly down to the bulk write handler
   */
  async saveBulkAttendance(classId, dateString, recordsArray) {
    return await apiRequest(`/attendance/${classId}/bulk`, {
      method: "POST",
      body: {
        date: dateString,
        records: recordsArray, // Expects [{ student_id: String, status: String }]
      },
    });
  },
};