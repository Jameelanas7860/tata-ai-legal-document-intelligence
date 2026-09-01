/*
# Enable localStorage-based auth access — Phase 1: Drop all existing policies

The app moved to frontend-only localStorage auth (no Supabase auth sessions).
This migration drops all RLS policies so we can alter column types,
then Phase 2 recreates everything with anon role access.
*/

-- Drop ALL existing policies first (required before altering column types)

-- documents
DROP POLICY IF EXISTS "select_own_documents" ON documents;
DROP POLICY IF EXISTS "insert_own_documents" ON documents;
DROP POLICY IF EXISTS "update_own_documents" ON documents;
DROP POLICY IF EXISTS "delete_own_documents" ON documents;

-- processing_steps
DROP POLICY IF EXISTS "select_own_processing_steps" ON processing_steps;
DROP POLICY IF EXISTS "insert_own_processing_steps" ON processing_steps;
DROP POLICY IF EXISTS "update_own_processing_steps" ON processing_steps;
DROP POLICY IF EXISTS "delete_own_processing_steps" ON processing_steps;

-- risks
DROP POLICY IF EXISTS "select_own_risks" ON risks;
DROP POLICY IF EXISTS "insert_own_risks" ON risks;
DROP POLICY IF EXISTS "update_own_risks" ON risks;
DROP POLICY IF EXISTS "delete_own_risks" ON risks;

-- audit_events
DROP POLICY IF EXISTS "select_own_audit_events" ON audit_events;
DROP POLICY IF EXISTS "insert_own_audit_events" ON audit_events;
DROP POLICY IF EXISTS "update_own_audit_events" ON audit_events;
DROP POLICY IF EXISTS "delete_own_audit_events" ON audit_events;

-- notifications
DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
DROP POLICY IF EXISTS "delete_own_notifications" ON notifications;

-- user_settings
DROP POLICY IF EXISTS "select_own_settings" ON user_settings;
DROP POLICY IF EXISTS "insert_own_settings" ON user_settings;
DROP POLICY IF EXISTS "update_own_settings" ON user_settings;
DROP POLICY IF EXISTS "delete_own_settings" ON user_settings;

-- user_profiles
DROP POLICY IF EXISTS "select_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "insert_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "update_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "delete_own_profile" ON user_profiles;

-- document_chunks
DROP POLICY IF EXISTS "select_own_chunks" ON document_chunks;
DROP POLICY IF EXISTS "insert_own_chunks" ON document_chunks;
DROP POLICY IF EXISTS "delete_own_chunks" ON document_chunks;

-- storage
DROP POLICY IF EXISTS "users_upload_own_documents" ON storage.objects;
DROP POLICY IF EXISTS "users_read_own_documents" ON storage.objects;
DROP POLICY IF EXISTS "users_update_own_documents" ON storage.objects;
DROP POLICY IF EXISTS "users_delete_own_documents" ON storage.objects;

-- Now alter column types
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_user_id_fkey;
ALTER TABLE audit_events DROP CONSTRAINT IF EXISTS audit_events_user_id_fkey;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE user_settings DROP CONSTRAINT IF EXISTS user_settings_user_id_fkey;
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey;

ALTER TABLE documents ALTER COLUMN user_id TYPE text USING user_id::text;
ALTER TABLE documents ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE audit_events ALTER COLUMN user_id TYPE text USING user_id::text;
ALTER TABLE audit_events ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE notifications ALTER COLUMN user_id TYPE text USING user_id::text;
ALTER TABLE notifications ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE user_settings ALTER COLUMN user_id TYPE text USING user_id::text;
ALTER TABLE user_settings ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE user_profiles ALTER COLUMN user_id TYPE text USING user_id::text;
ALTER TABLE user_profiles ALTER COLUMN user_id DROP DEFAULT;
