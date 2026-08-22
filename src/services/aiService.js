// AI service — frontend-only demo implementation.
// Backend/AI team: replace with real API calls to your AI/LLM service.
// The function signatures and return shapes below define the contract
// the UI expects. Replace the mock bodies with apiRequest() calls.

import { apiRequest, API_ENDPOINTS } from './api';
import {
  risks as mockRisks,
  riskSummary as mockSummary,
  contractSummary as mockContract,
  processingSteps as mockSteps,
} from '../data/mockData';

export default {
  async getDocumentSummary(documentId) {
    // Backend: return apiRequest(`/documents/${documentId}/summary`);
    return { summary: mockContract };
  },

  async getExtractedClauses(documentId) {
    // Backend: return apiRequest(`/documents/${documentId}/clauses`);
    return { clauses: mockRisks.map((r) => ({ id: r.id, title: r.title, clause: r.clause, page: r.page })) };
  },

  async getRiskAnalysis(documentId) {
    // Backend: return apiRequest(API_ENDPOINTS.RISKS.ANALYSIS, { params: { id: documentId } });
    return {
      risks: [...mockRisks],
      summary: { ...mockSummary },
    };
  },

  async updateRiskStatus(documentId, riskId, action, note) {
    // Backend: return apiRequest(`/documents/${documentId}/risks/${riskId}/status`, {
    //   method: 'POST',
    //   body: JSON.stringify({ action, note }),
    // });
    return { success: true, riskId, action, note };
  },

  async getProcessingStatus(documentId) {
    // Backend: return apiRequest(API_ENDPOINTS.PROCESSING.STATUS, { params: { id: documentId } });
    return {
      steps: mockSteps,
      currentStep: 0,
      progress: 0,
      status: 'pending',
    };
  },

  async getProcessingPipeline() {
    return [...mockSteps];
  },
};
