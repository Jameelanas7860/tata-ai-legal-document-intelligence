-- Add uploaded_by column to documents table
ALTER TABLE documents ADD COLUMN IF NOT EXISTS uploaded_by text DEFAULT 'Unknown';
