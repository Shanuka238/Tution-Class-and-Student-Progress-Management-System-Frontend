import apiRequest from "./api.js";
import { API_URLS } from "./apiUrls";

export const examAPI = {
  getAllExams: async () => {
    return await apiRequest(`${API_URLS.EXAMS}`);
  },

  createExam: async (examData) => {
    return await apiRequest(`${API_URLS.EXAMS}`, { method: "POST", body: examData });
  },

  getExamsByClass: async (classId) => {
    return await apiRequest(`${API_URLS.EXAMS}/class/${classId}`);
  },

  getExamById: async (examId) => {
    return await apiRequest(`${API_URLS.EXAMS}/${examId}`);
  },

  submitBulkResults: async (examId, resultsData) => {
    return await apiRequest(`${API_URLS.EXAMS}/${examId}/results`, { method: "POST", body: { results: resultsData } });
  },

  getResultsByExam: async (examId) => {
    return await apiRequest(`${API_URLS.EXAMS}/${examId}/results`);
  },

  getMyResults: async () => {
    return await apiRequest(`${API_URLS.EXAMS}/results/me`);
  },
};
