// Audit service — frontend-only demo implementation.
// Backend team: replace with real API calls using apiRequest().

import { apiRequest, API_ENDPOINTS } from './api';
import { auditEvents as mockEvents } from '../data/mockData';

export default {
  async getAuditHistory() {
    // Backend: return apiRequest(API_ENDPOINTS.AUDIT.LIST);
    return [...mockEvents];
  },

  async exportAuditLog(format = 'csv') {
    // Backend: return apiRequest(`${API_ENDPOINTS.AUDIT.EXPORT}?format=${format}`);
    const events = [...mockEvents];
    if (format === 'json') {
      return JSON.stringify(events, null, 2);
    }
    const headers = ['ID', 'Action', 'Description', 'User', 'Role', 'Date', 'Timestamp', 'Status'];
    const rows = events.map((e) =>
      [e.id, e.action, e.detail, e.user, e.role, e.date, e.timestamp, e.status]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  },

  downloadExport(content, filename, type = 'text/csv') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};
