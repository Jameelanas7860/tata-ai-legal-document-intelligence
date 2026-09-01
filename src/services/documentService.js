// Document service — real Supabase database + storage.
// Handles document CRUD, file upload to storage, and search.

import { supabase, STORAGE_BUCKET } from '../lib/supabase';
import authService from './authService';

export default {
  async getDocuments() {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data.map(this._mapDocument);
  },

  async getDocument(id) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? this._mapDocument(data) : null;
  },

  async uploadDocument(file, metadata) {
    const user = authService.getSessionUser();
    if (!user) throw new Error('Not authenticated');

    const userId = user.id;
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}-${file.name}`;

    const uploadedBy = user.name || user.email?.split('@')[0] || 'Unknown';

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file);

    if (uploadError) throw new Error(uploadError.message);

    // Create document record
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .insert({
        user_id: userId,
        name: file.name,
        type: metadata.documentType,
        status: 'Processing',
        risk: 'Medium',
        jurisdiction: metadata.jurisdiction,
        business_unit: metadata.businessUnit,
        priority: metadata.priority,
        confidentiality: metadata.confidentiality,
        pages: 0,
        file_path: fileName,
        file_size: file.size,
        uploaded_by: uploadedBy,
      })
      .select()
      .single();

    if (docError) throw new Error(docError.message);

    // Trigger edge function for processing (fire-and-forget, errors logged)
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          document_id: doc.id,
          file_path: fileName,
          file_name: file.name,
        }),
      });
      if (!response.ok) {
        const errBody = await response.text();
        console.error('Edge function returned error:', response.status, errBody);
      }
    } catch (err) {
      console.error('Processing trigger failed:', err);
    }

    // Log upload to audit
    try {
      await supabase.from('audit_events').insert({
        document_id: doc.id,
        user_id: userId,
        action: 'Document Uploaded',
        detail: `${file.name} uploaded for analysis`,
        actor_name: uploadedBy,
        actor_role: user.role || 'Legal Counsel',
        status: 'Completed',
      });
    } catch (err) {
      console.error('Audit log failed:', err);
    }

    return this._mapDocument(doc);
  },

  async searchDocuments(query) {
    if (!query || !query.trim()) return this.getDocuments();
    const q = query.trim().toLowerCase();
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data
      .map(this._mapDocument)
      .filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.type.toLowerCase().includes(q) ||
          d.uploadedBy.toLowerCase().includes(q) ||
          d.id.toLowerCase().includes(q)
      );
  },

  async updateDocument(id, updates) {
    const dbUpdates = {};
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.risk) dbUpdates.risk = updates.risk;
    if (updates.contractSummary) dbUpdates.contract_summary = updates.contractSummary;

    const { data, error } = await supabase
      .from('documents')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this._mapDocument(data);
  },

  _mapDocument(row) {
    return {
      id: row.id,
      name: row.name,
      type: row.type,
      uploadedBy: row.uploaded_by || 'Unknown',
      date: row.created_at?.split('T')[0] || '',
      status: row.status,
      risk: row.risk,
      jurisdiction: row.jurisdiction,
      businessUnit: row.business_unit,
      priority: row.priority,
      confidentiality: row.confidentiality,
      pages: row.pages || 0,
      filePath: row.file_path,
      contractSummary: row.contract_summary,
      riskOverall: row.risk_overall,
      riskHigh: row.risk_high,
      riskMedium: row.risk_medium,
      riskLow: row.risk_low,
      riskConfidence: row.risk_confidence,
    };
  },
};
