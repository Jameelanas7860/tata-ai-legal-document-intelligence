// Risk service — frontend-only demo implementation.
// Backend team: replace with real API calls using apiRequest().

import { apiRequest, API_ENDPOINTS } from './api';
import { risks as mockRisks, riskSummary as mockSummary, contractSummary as mockContract } from '../data/mockData';

export default {
  async getRiskAnalysis(documentId) {
    // Backend: return apiRequest(API_ENDPOINTS.RISKS.ANALYSIS, { params: { id: documentId } });
    return {
      risks: [...mockRisks],
      summary: { ...mockSummary },
      contractSummary: mockContract,
    };
  },

  async getProcessingStatus(documentId) {
    // Backend: return apiRequest(API_ENDPOINTS.PROCESSING.STATUS, { params: { id: documentId } });
    return {
      currentStep: 0,
      progress: 0,
      status: 'pending',
    };
  },
};
