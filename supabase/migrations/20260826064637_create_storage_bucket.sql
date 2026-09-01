/*
# Create storage bucket for legal documents

Creates a private storage bucket 'legal-documents' for uploading PDF/DOCX files.
Storage policies allow authenticated users to manage only their own files,
scoped by user_id folder prefix.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('legal-documents', 'legal-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to their own folder
DROP POLICY IF EXISTS "users_upload_own_documents" ON storage.objects;
CREATE POLICY "users_upload_own_documents" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'legal-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to read their own documents
DROP POLICY IF EXISTS "users_read_own_documents" ON storage.objects;
CREATE POLICY "users_read_own_documents" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'legal-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to update their own documents
DROP POLICY IF EXISTS "users_update_own_documents" ON storage.objects;
CREATE POLICY "users_update_own_documents" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'legal-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  ) WITH CHECK (
    bucket_id = 'legal-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete their own documents
DROP POLICY IF EXISTS "users_delete_own_documents" ON storage.objects;
CREATE POLICY "users_delete_own_documents" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'legal-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
