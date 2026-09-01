/*
# Enable localStorage-based auth access — Phase 2: Recreate policies with anon role
*/

-- documents
CREATE POLICY "select_own_documents" ON documents FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "insert_own_documents" ON documents FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_own_documents" ON documents FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_own_documents" ON documents FOR DELETE
  TO anon, authenticated USING (true);

-- processing_steps
CREATE POLICY "select_own_processing_steps" ON processing_steps FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "insert_own_processing_steps" ON processing_steps FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_own_processing_steps" ON processing_steps FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_own_processing_steps" ON processing_steps FOR DELETE
  TO anon, authenticated USING (true);

-- risks
CREATE POLICY "select_own_risks" ON risks FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "insert_own_risks" ON risks FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_own_risks" ON risks FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_own_risks" ON risks FOR DELETE
  TO anon, authenticated USING (true);

-- audit_events
CREATE POLICY "select_own_audit_events" ON audit_events FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "insert_own_audit_events" ON audit_events FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_own_audit_events" ON audit_events FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_own_audit_events" ON audit_events FOR DELETE
  TO anon, authenticated USING (true);

-- notifications
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE
  TO anon, authenticated USING (true);

-- user_settings
CREATE POLICY "select_own_settings" ON user_settings FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "insert_own_settings" ON user_settings FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_own_settings" ON user_settings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_own_settings" ON user_settings FOR DELETE
  TO anon, authenticated USING (true);

-- user_profiles
CREATE POLICY "select_own_profile" ON user_profiles FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "insert_own_profile" ON user_profiles FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_own_profile" ON user_profiles FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_own_profile" ON user_profiles FOR DELETE
  TO anon, authenticated USING (true);

-- document_chunks
CREATE POLICY "select_own_chunks" ON document_chunks FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "insert_own_chunks" ON document_chunks FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "delete_own_chunks" ON document_chunks FOR DELETE
  TO anon, authenticated USING (true);

-- storage
CREATE POLICY "users_upload_own_documents" ON storage.objects
  FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'legal-documents');
CREATE POLICY "users_read_own_documents" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'legal-documents');
CREATE POLICY "users_update_own_documents" ON storage.objects
  FOR UPDATE TO anon, authenticated USING (bucket_id = 'legal-documents') WITH CHECK (bucket_id = 'legal-documents');
CREATE POLICY "users_delete_own_documents" ON storage.objects
  FOR DELETE TO anon, authenticated USING (bucket_id = 'legal-documents');
