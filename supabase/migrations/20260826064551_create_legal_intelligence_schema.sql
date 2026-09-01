/*
# Create Legal Document Intelligence Schema

## Overview
Creates the complete database schema for the AI Legal Document Intelligence platform.
Multi-user application with authentication — each user owns their documents and associated data.

## New Tables
1. documents — Legal documents uploaded for AI analysis
2. processing_steps — Pipeline stages for each document
3. risks — AI-identified risks within documents
4. audit_events — Audit trail of all document and review activities
5. notifications — User notification feed
6. user_settings — Per-user settings
7. user_profiles — Extended profile data

## Security
- RLS enabled on ALL tables with auth.uid() ownership checks.
- Owner columns default to auth.uid() so frontend inserts succeed without passing user_id.
- Child tables use EXISTS subqueries to verify ownership through parent document.
*/

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'Other',
  status text NOT NULL DEFAULT 'Processing',
  risk text NOT NULL DEFAULT 'Medium',
  jurisdiction text,
  business_unit text,
  priority text,
  confidentiality text,
  pages integer DEFAULT 0,
  file_path text,
  file_size bigint,
  contract_summary text,
  risk_overall text DEFAULT 'Medium',
  risk_high integer DEFAULT 0,
  risk_medium integer DEFAULT 0,
  risk_low integer DEFAULT 0,
  risk_confidence integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_documents" ON documents;
CREATE POLICY "select_own_documents" ON documents FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_documents" ON documents;
CREATE POLICY "insert_own_documents" ON documents FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_documents" ON documents;
CREATE POLICY "update_own_documents" ON documents FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_documents" ON documents;
CREATE POLICY "delete_own_documents" ON documents FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_risk ON documents(risk);

-- Processing steps table
CREATE TABLE IF NOT EXISTS processing_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  step_number integer NOT NULL,
  name text NOT NULL,
  detail text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE processing_steps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_processing_steps" ON processing_steps;
CREATE POLICY "select_own_processing_steps" ON processing_steps FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM documents WHERE documents.id = processing_steps.document_id AND documents.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_processing_steps" ON processing_steps;
CREATE POLICY "insert_own_processing_steps" ON processing_steps FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM documents WHERE documents.id = processing_steps.document_id AND documents.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_processing_steps" ON processing_steps;
CREATE POLICY "update_own_processing_steps" ON processing_steps FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM documents WHERE documents.id = processing_steps.document_id AND documents.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM documents WHERE documents.id = processing_steps.document_id AND documents.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_processing_steps" ON processing_steps;
CREATE POLICY "delete_own_processing_steps" ON processing_steps FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM documents WHERE documents.id = processing_steps.document_id AND documents.user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_processing_steps_document_id ON processing_steps(document_id);

-- Risks table
CREATE TABLE IF NOT EXISTS risks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  risk_code text NOT NULL,
  title text NOT NULL,
  severity text NOT NULL DEFAULT 'Low',
  confidence integer NOT NULL DEFAULT 0,
  evidence text,
  page_number integer,
  clause text,
  reason text,
  recommendation text,
  action_status text DEFAULT 'pending',
  action_note text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE risks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_risks" ON risks;
CREATE POLICY "select_own_risks" ON risks FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM documents WHERE documents.id = risks.document_id AND documents.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_risks" ON risks;
CREATE POLICY "insert_own_risks" ON risks FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM documents WHERE documents.id = risks.document_id AND documents.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_risks" ON risks;
CREATE POLICY "update_own_risks" ON risks FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM documents WHERE documents.id = risks.document_id AND documents.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM documents WHERE documents.id = risks.document_id AND documents.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_risks" ON risks;
CREATE POLICY "delete_own_risks" ON risks FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM documents WHERE documents.id = risks.document_id AND documents.user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_risks_document_id ON risks(document_id);
CREATE INDEX IF NOT EXISTS idx_risks_severity ON risks(severity);

-- Audit events table
CREATE TABLE IF NOT EXISTS audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  detail text,
  actor_name text NOT NULL DEFAULT 'System',
  actor_role text NOT NULL DEFAULT 'System',
  status text NOT NULL DEFAULT 'Completed',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_audit_events" ON audit_events;
CREATE POLICY "select_own_audit_events" ON audit_events FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_audit_events" ON audit_events;
CREATE POLICY "insert_own_audit_events" ON audit_events FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_audit_events" ON audit_events;
CREATE POLICY "update_own_audit_events" ON audit_events FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_audit_events" ON audit_events;
CREATE POLICY "delete_own_audit_events" ON audit_events FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_audit_events_user_id ON audit_events(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_document_id ON audit_events(document_id);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  detail text,
  time_label text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_notifications" ON notifications;
CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  email_alerts boolean NOT NULL DEFAULT true,
  risk_escalation_alerts boolean NOT NULL DEFAULT true,
  weekly_digest boolean NOT NULL DEFAULT false,
  auto_analysis boolean NOT NULL DEFAULT true,
  risk_threshold text NOT NULL DEFAULT 'Medium',
  dark_mode boolean NOT NULL DEFAULT false,
  language text NOT NULL DEFAULT 'English',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_settings" ON user_settings;
CREATE POLICY "select_own_settings" ON user_settings FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_settings" ON user_settings;
CREATE POLICY "insert_own_settings" ON user_settings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_settings" ON user_settings;
CREATE POLICY "update_own_settings" ON user_settings FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_settings" ON user_settings;
CREATE POLICY "delete_own_settings" ON user_settings FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'Legal Counsel',
  organization text NOT NULL DEFAULT 'Tata Group',
  member_since text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON user_profiles;
CREATE POLICY "select_own_profile" ON user_profiles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_profile" ON user_profiles;
CREATE POLICY "insert_own_profile" ON user_profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_profile" ON user_profiles;
CREATE POLICY "update_own_profile" ON user_profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_profile" ON user_profiles;
CREATE POLICY "delete_own_profile" ON user_profiles FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
