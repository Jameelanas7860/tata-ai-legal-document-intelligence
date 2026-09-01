// AI service — real Supabase database queries for AI-generated results.
// The actual AI processing happens in the process-document edge function.

import { supabase } from '../lib/supabase';

const PIPELINE_STEPS = [
  { id: 1, name: 'Document Uploaded', detail: 'File received and queued for analysis' },
  { id: 2, name: 'PDF Extraction / OCR', detail: 'Text extracted from document pages' },
  { id: 3, name: 'Document Parsing', detail: 'Structure and sections identified' },
  { id: 4, name: 'Clause Extraction', detail: 'Legal clauses isolated and tagged' },
  { id: 5, name: 'Knowledge Retrieval', detail: 'Compared against organizational knowledge base' },
  { id: 6, name: 'AI Risk Analysis', detail: 'Risk indicators flagged with confidence scoring' },
  { id: 7, name: 'Summary Generation', detail: 'Executive summary and review drafted' },
];

export default {
  async getDocumentSummary(documentId) {
    let query = supabase.from('documents').select('contract_summary, name');
    if (documentId) {
      query = query.eq('id', documentId);
    } else {
      query = query.order('created_at', { ascending: false }).limit(1);
    }
    const { data, error } = await query.maybeSingle();
    if (error) throw new Error(error.message);
    return { summary: data?.contract_summary || '' };
  },

  async getExtractedClauses(documentId) {
    let docQuery = supabase.from('documents').select('id');
    if (documentId) {
      docQuery = docQuery.eq('id', documentId);
    } else {
      docQuery = docQuery.order('created_at', { ascending: false }).limit(1);
    }
    const { data: doc } = await docQuery.maybeSingle();
    if (!doc) return { clauses: [] };

    const { data: risks, error } = await supabase
      .from('risks')
      .select('risk_code, title, clause, page_number')
      .eq('document_id', doc.id);

    if (error) throw new Error(error.message);
    return {
      clauses: risks.map((r) => ({
        id: r.risk_code,
        title: r.title,
        clause: r.clause,
        page: r.page_number,
      })),
    };
  },

  async getRiskAnalysis(documentId) {
    let docQuery = supabase.from('documents').select('*');
    if (documentId) {
      docQuery = docQuery.eq('id', documentId);
    } else {
      docQuery = docQuery.order('created_at', { ascending: false }).limit(1);
    }
    const { data: doc, error: docError } = await docQuery.maybeSingle();
    if (docError) throw new Error(docError.message);
    if (!doc) return { risks: [], summary: { overall: 'Low', high: 0, medium: 0, low: 0, confidence: 0 } };

    const { data: risks, error: risksError } = await supabase
      .from('risks')
      .select('*')
      .eq('document_id', doc.id)
      .order('created_at', { ascending: true });

    if (risksError) throw new Error(risksError.message);

    return {
      risks: risks.map((r) => ({
        id: r.risk_code,
        dbId: r.id,
        title: r.title,
        severity: r.severity,
        confidence: r.confidence,
        evidence: r.evidence,
        page: r.page_number,
        clause: r.clause,
        reason: r.reason,
        recommendation: r.recommendation,
        actionStatus: r.action_status,
      })),
      summary: {
        overall: doc.risk_overall || 'Low',
        high: doc.risk_high || 0,
        medium: doc.risk_medium || 0,
        low: doc.risk_low || 0,
        confidence: doc.risk_confidence || 0,
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
    return { success: true, riskId, action, note };
  },

  async getProcessingStatus(documentId) {
    let docQuery = supabase.from('documents').select('id, status, name');
    if (documentId) {
      docQuery = docQuery.eq('id', documentId);
    } else {
      docQuery = docQuery.order('created_at', { ascending: false }).limit(1);
    }
    const { data: doc } = await docQuery.maybeSingle();
    if (!doc) return { steps: PIPELINE_STEPS, currentStep: 0, progress: 0, status: 'pending', name: '' };

    const { data: steps } = await supabase
      .from('processing_steps')
      .select('*')
      .eq('document_id', doc.id)
      .order('step_number', { ascending: true });

    const mappedSteps = (steps && steps.length > 0 ? steps : PIPELINE_STEPS.map((s, i) => ({
      ...s,
      status: doc.status === 'Completed' ? 'completed' : 'pending',
    }))).map((s) => ({
      id: s.step_number || s.id,
      name: s.name,
      detail: s.detail,
      status: s.status,
    }));

    const completedCount = mappedSteps.filter((s) => s.status === 'completed').length;
    const progress = Math.round((completedCount / mappedSteps.length) * 100);

    return {
      steps: mappedSteps,
      currentStep: completedCount,
      progress,
      status: doc.status === 'Completed' ? 'completed' : doc.status === 'Failed' ? 'failed' : 'processing',
      name: doc.name,
    };
  },

  async getProcessingPipeline() {
    return PIPELINE_STEPS;
  },
};
