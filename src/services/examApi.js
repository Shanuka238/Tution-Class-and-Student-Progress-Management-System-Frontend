import apiRequest from "./api.js";

const EXAM_API_URL = "/exams";

export const examAPI = {
  // Exam Routes
  createExam: async (examData) => {
    return await apiRequest(`${EXAM_API_URL}`, { method: "POST", body: examData });
  },

  getExamsByClass: async (classId) => {
    return await apiRequest(`${EXAM_API_URL}/class/${classId}`);
  },

  getExamById: async (examId) => {
    return await apiRequest(`${EXAM_API_URL}/${examId}`);
  },

  // Result Routes
  submitBulkResults: async (examId, resultsData) => {
    return await apiRequest(`${EXAM_API_URL}/${examId}/results`, { method: "POST", body: { results: resultsData } });
  },

  getResultsByExam: async (examId) => {
    return await apiRequest(`${EXAM_API_URL}/${examId}/results`);
  },

  getMyResults: async () => {
    return await apiRequest(`${EXAM_API_URL}/results/me`);
  },
};
