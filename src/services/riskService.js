// Risk service — real Supabase database queries.

import { supabase } from '../lib/supabase';
import authService from './authService';

export default {
  async getRiskAnalysis(documentId) {
    let docQuery = supabase.from('documents').select('*');
    if (documentId) {
      docQuery = docQuery.eq('id', documentId);
    } else {
      docQuery = docQuery.order('created_at', { ascending: false }).limit(1);
    }
    const { data: doc, error: docError } = await docQuery.maybeSingle();

    if (docError) throw new Error(docError.message);
    if (!doc) return { risks: [], summary: { overall: 'Low', high: 0, medium: 0, low: 0, confidence: 0 }, contractSummary: '', document: null };

    const { data: risks, error: risksError } = await supabase
      .from('risks')
      .select('*')
      .eq('document_id', doc.id)
      .order('created_at', { ascending: true });

    if (risksError) throw new Error(risksError.message);

    return {
      risks: risks.map(this._mapRisk),
      summary: {
        overall: doc.risk_overall || 'Low',
        high: doc.risk_high || 0,
        medium: doc.risk_medium || 0,
        low: doc.risk_low || 0,
        confidence: doc.risk_confidence || 0,
      },
      contractSummary: doc.contract_summary || '',
      document: {
        id: doc.id,
        name: doc.name,
        type: doc.type,
        jurisdiction: doc.jurisdiction,
        status: doc.status,
      },
    };
  },

  async updateRiskStatus(documentId, riskId, action, note) {
    const { data, error } = await supabase
      .from('risks')
      .update({ action_status: action, action_note: note })
      .eq('id', riskId)
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Log to audit
    const user = authService.getSessionUser();
    if (user) {
      const actionLabel = action.charAt(0).toUpperCase() + action.slice(1);
      try {
        await supabase.from('audit_events').insert({
          document_id: documentId,
          user_id: user.id,
          action: `Risk ${actionLabel}`,
          detail: `${data.title} (${data.risk_code}) ${action}${note ? ': ' + note : ''}`,
          actor_name: user.name || 'Reviewer',
          actor_role: user.role || 'Reviewer',
          status: action === 'escalate' ? 'Escalated' : 'Completed',
        });
      } catch (err) {
        console.error('Audit log failed:', err);
      }
    }

    return { success: true, riskId, action, note };
  },

  _mapRisk(row) {
    return {
      id: row.risk_code,
      dbId: row.id,
      documentId: row.document_id,
      title: row.title,
      severity: row.severity,
      confidence: row.confidence,
      evidence: row.evidence,
      page: row.page_number,
      clause: row.clause,
      reason: row.reason,
      recommendation: row.recommendation,
      actionStatus: row.action_status,
      actionNote: row.action_note,
    };
  },
};
