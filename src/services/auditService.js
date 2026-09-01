// Audit service — real Supabase database queries.

import { supabase } from '../lib/supabase';

export default {
  async getAuditHistory() {
    const { data, error } = await supabase
      .from('audit_events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data.map(this._mapEvent);
  },

  async exportAuditLog(format = 'csv') {
    const events = await this.getAuditHistory();
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

  _mapEvent(row) {
    const dt = new Date(row.created_at);
    return {
      id: row.id,
      action: row.action,
      user: row.actor_name,
      role: row.actor_role,
      timestamp: dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      date: dt.toISOString().split('T')[0],
      status: row.status,
      detail: row.detail || '',
    };
  },
};
