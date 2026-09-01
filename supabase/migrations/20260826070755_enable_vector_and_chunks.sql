/*
# Enable pgvector and create document_chunks table

Creates a vector storage table for RAG — stores document chunks with their
embedding vectors for similarity search during AI analysis.
*/

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Document chunks table for RAG pipeline
CREATE TABLE IF NOT EXISTS document_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index integer NOT NULL,
  content text NOT NULL,
  embedding vector(768),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_chunks" ON document_chunks;
CREATE POLICY "select_own_chunks" ON document_chunks FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM documents WHERE documents.id = document_chunks.document_id AND documents.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_chunks" ON document_chunks;
CREATE POLICY "insert_own_chunks" ON document_chunks FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM documents WHERE documents.id = document_chunks.document_id AND documents.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_chunks" ON document_chunks;
CREATE POLICY "delete_own_chunks" ON document_chunks FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM documents WHERE documents.id = document_chunks.document_id AND documents.user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_chunks_document_id ON document_chunks(document_id);

-- Create a matching function for vector similarity search
CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding vector(768),
  match_count integer DEFAULT 5,
  match_document_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  chunk_index integer,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    dc.id,
    dc.document_id,
    dc.chunk_index,
    dc.content,
    dc.metadata,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks dc
  WHERE
    (match_document_id IS NULL OR dc.document_id = match_document_id)
    AND dc.embedding IS NOT NULL
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
$$;
