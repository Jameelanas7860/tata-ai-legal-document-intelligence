// Document service — frontend-only demo implementation.
// Backend team: replace with real API calls using apiRequest().

import { apiRequest, API_ENDPOINTS } from './api';
import { documents as mockDocuments } from '../data/mockData';

let documents = [...mockDocuments];

export default {
  async getDocuments() {
    // Backend: return apiRequest(API_ENDPOINTS.DOCUMENTS.LIST);
    return [...documents];
  },

  async getDocument(id) {
    // Backend: return apiRequest(API_ENDPOINTS.DOCUMENTS.DETAIL, { params: { id } });
    return documents.find((d) => d.id === id) || null;
  },

  async uploadDocument(file, metadata) {
    // Backend: replace with a multipart/form-data POST:
    //   const formData = new FormData();
    //   formData.append('file', file);
    //   formData.append('metadata', JSON.stringify(metadata));
    //   return apiRequest(API_ENDPOINTS.DOCUMENTS.UPLOAD, {
    //     method: 'POST',
    //     body: formData,
    //     headers: {}, // let fetch set the content type for FormData
    //   });
    const newDoc = {
      id: `DOC-${2400 + documents.length + 1}`,
      name: file.name,
      type: metadata.documentType,
      uploadedBy: 'Anas Khan',
      date: new Date().toISOString().split('T')[0],
      status: 'Processing',
      risk: 'Medium',
      jurisdiction: metadata.jurisdiction,
      businessUnit: metadata.businessUnit,
      pages: Math.floor(Math.random() * 30) + 1,
    };
    documents = [newDoc, ...documents];
    return newDoc;
  },

  async searchDocuments(query) {
    // Backend: return apiRequest(`${API_ENDPOINTS.DOCUMENTS.LIST}?q=${encodeURIComponent(query)}`);
    if (!query || !query.trim()) return [...documents];
    const q = query.trim().toLowerCase();
    return documents.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.type.toLowerCase().includes(q) ||
        d.uploadedBy.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q)
    );
  },
};
