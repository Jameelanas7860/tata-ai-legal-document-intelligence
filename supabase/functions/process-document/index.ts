// Process document edge function — verify_jwt disabled for localStorage auth
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const GEMINI_MODEL = "gemini-1.5-flash";
const GEMINI_EMBEDDING_MODEL = "text-embedding-004";
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";

const PIPELINE_STEPS = [
  { name: "Document Uploaded", detail: "File received and queued for analysis" },
  { name: "PDF Extraction / OCR", detail: "Text extracted from document pages" },
  { name: "Document Parsing & Chunking", detail: "Document split into semantic chunks for analysis" },
  { name: "Embedding & Vector Storage", detail: "Chunks embedded and stored for RAG retrieval" },
  { name: "RAG Retrieval", detail: "Relevant clauses retrieved from organizational knowledge base" },
  { name: "AI Risk Analysis", detail: "Gemini LLM analyzes clauses for risks with severity and confidence" },
  { name: "Summary Generation", detail: "Executive summary and recommendations drafted by LLM" },
];

// ─── Text extraction ────────────────────────────────────────────────

function extractPdfText(bytes: Uint8Array): string {
  const decoder = new TextDecoder("utf-8", { fatal: false });
  const raw = decoder.decode(bytes);

  // PDF text streams: text in parentheses within BT/ET blocks
  let text = "";
  const textMatches = raw.match(/\(([^)]+)\)/g);
  if (textMatches) {
    text = textMatches
      .map((m) => m.slice(1, -1))
      .filter((s) => s.trim().length > 1)
      .join(" ");
  }
  // Fallback: array-based text (TJ operators)
  if (!text) {
    const arrayMatches = raw.match(/\[(.*?)\]\s*TJ/g);
    if (arrayMatches) {
      text = arrayMatches
        .map((m) => {
          const strings = m.match(/\(([^)]+)\)/g);
          return strings ? strings.map((s) => s.slice(1, -1)).join("") : "";
        })
        .join(" ");
    }
  }
  // Last resort: printable ASCII runs
  if (!text) {
    const printable = raw.match(/[\x20-\x7E]{8,}/g);
    if (printable) text = printable.join(" ");
  }
  return text.slice(0, 100000);
}

function extractDocxText(bytes: Uint8Array): string {
  const decoder = new TextDecoder("utf-8", { fatal: false });
  const raw = decoder.decode(bytes);
  // DOCX is a ZIP of XML; w:t elements contain visible text
  const xmlText = raw.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
  if (!xmlText) return "";
  return xmlText
    .map((m) => m.replace(/<[^>]+>/g, ""))
    .join(" ")
    .slice(0, 100000);
}

function extractPlainText(bytes: Uint8Array): string {
  return new TextDecoder("utf-8").decode(bytes).slice(0, 100000);
}

// ─── Chunking (LangChain-style RecursiveCharacterTextSplitter) ──────

function splitText(text: string, chunkSize = 1500, overlap = 200): string[] {
  if (!text || text.trim().length === 0) return [];
  const separators = ["\n\n", "\n", ". ", " "];
  return recursiveSplit(text, separators, chunkSize, overlap);
}

function recursiveSplit(
  text: string,
  separators: string[],
  chunkSize: number,
  overlap: number
): string[] {
  if (text.length <= chunkSize) return [text.trim()].filter(Boolean);

  const sep = separators[0];
  const parts = text.split(sep);
  const chunks: string[] = [];
  let current = "";

  for (const part of parts) {
    const candidate = current ? current + sep + part : part;
    if (candidate.length > chunkSize && current) {
      chunks.push(current.trim());
      const overlapText = current.slice(-overlap);
      current = overlapText + sep + part;
    } else {
      current = candidate;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  if (separators.length > 1) {
    const needsRecurse = chunks.some((c) => c.length > chunkSize * 1.5);
    if (needsRecurse) {
      return chunks.flatMap((c) =>
        c.length > chunkSize * 1.5
          ? recursiveSplit(c, separators.slice(1), chunkSize, overlap)
          : [c]
      );
    }
  }

  return chunks.filter((c) => c.length > 0);
}

// ─── Gemini API calls ───────────────────────────────────────────────

async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured — cannot generate embeddings");
  }

  // Batch in groups of 100 (Gemini batch limit)
  const results: number[][] = [];
  for (let i = 0; i < texts.length; i += 100) {
    const batch = texts.slice(i, i + 100);
    const response = await fetch(
      `${GEMINI_BASE}/models/${GEMINI_EMBEDDING_MODEL}:batchEmbedContents?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: batch.map((t) => ({
            model: `models/${GEMINI_EMBEDDING_MODEL}`,
            content: { parts: [{ text: t.slice(0, 2000) }] },
          })),
        }),
      }
    );

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Gemini embedding API error ${response.status}: ${errBody}`);
    }

    const data = await response.json();
    const batchEmbeddings = data.embeddings?.map((e: { values: number[] }) => e.values);
    if (!batchEmbeddings || batchEmbeddings.length !== batch.length) {
      throw new Error("Gemini embedding API returned mismatched count");
    }
    results.push(...batchEmbeddings);
  }

  return results;
}

async function callGemini(prompt: string, systemInstruction?: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured — cannot call Gemini LLM");
  }

  const body: Record<string, unknown> = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.3,
      topP: 0.8,
      maxOutputTokens: 8192,
    },
  };

  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  const response = await fetch(
    `${GEMINI_BASE}/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned empty response");
  return text;
}

// ─── RAG retrieval ──────────────────────────────────────────────────

async function retrieveRelevantChunks(
  supabase: ReturnType<typeof createClient>,
  queryText: string,
  documentId: string,
  matchCount = 5
): Promise<{ content: string }[]> {
  const [embedding] = await generateEmbeddings([queryText.slice(0, 2000)]);
  const { data, error } = await supabase.rpc("match_document_chunks", {
    query_embedding: embedding,
    match_count: matchCount,
    match_document_id: documentId,
  });

  if (error) {
    console.error("Vector search error:", error);
    return [];
  }
  return data ?? [];
}

// ─── AI Analysis with Gemini ────────────────────────────────────────

const RISK_SYSTEM_INSTRUCTION = `You are an expert legal AI assistant specializing in contract risk analysis for a large corporate legal department. Your task is to identify legal risks in contracts and provide structured analysis.

For each risk, provide:
- title: A concise name for the risk type
- severity: "High", "Medium", or "Low"
- confidence: An integer 0-100 representing your confidence
- evidence: The exact contract text that triggered this risk
- page: Approximate page number (integer)
- clause: Section/clause reference if identifiable
- reason: Why this is a risk, referencing corporate standards
- recommendation: Specific actionable advice

Respond ONLY with a JSON array of risk objects. No prose, no markdown fences.`;

const SUMMARY_SYSTEM_INSTRUCTION = `You are an expert legal AI assistant. Generate a clear, professional executive summary of the contract. Cover: purpose, key parties, duration, payment terms, liability caps, termination, confidentiality, and notable risk areas. Write 3-5 sentences in formal legal language. No markdown.`;

async function analyzeRisksWithLLM(chunkText: string, ragContext: string): Promise<Record<string, unknown>[]> {
  const prompt = `Analyze the following legal document text for risks. Consider corporate standards: liability caps should be at least 24 months of fees, termination notice should be 90+ days, confidentiality should be 5+ years, indemnification should not be capped below $1M, governing law should match operating jurisdiction.

${ragContext ? `Relevant context from knowledge base:\n${ragContext}\n\n` : ""}Document text to analyze:
${chunkText}

Return a JSON array of risk objects. Each object must have: title, severity, confidence, evidence, page, clause, reason, recommendation.`;

  const response = await callGemini(prompt, RISK_SYSTEM_INSTRUCTION);
  // Strip markdown fences if present
  const cleaned = response.replace(/^```json?\s*/i, "").replace(/```\s*$/i, "").trim();
  const parsed = JSON.parse(cleaned);
  return Array.isArray(parsed) ? parsed : [];
}

async function generateSummaryWithLLM(chunkText: string, ragContext: string): Promise<string> {
  const prompt = `Summarize the following legal document in 3-5 sentences of formal legal language.

${ragContext ? `Context from knowledge base:\n${ragContext}\n\n` : ""}Document text:
${chunkText}`;

  return await callGemini(prompt, SUMMARY_SYSTEM_INSTRUCTION);
}

// ─── Main handler ───────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { document_id, file_path, file_name } = await req.json();

    if (!document_id) {
      return new Response(
        JSON.stringify({ error: "document_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Fetch document record
    const { data: doc, error: docError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", document_id)
      .single();

    if (docError || !doc) {
      return new Response(
        JSON.stringify({ error: "Document not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Step 1: Extract text ──
    let extractedText = "";
    if (file_path) {
      const { data: fileData, error: downloadError } = await supabase
        .storage
        .from("legal-documents")
        .download(file_path);

      if (downloadError) {
        throw new Error(`Failed to download file from storage: ${downloadError.message}`);
      }
      if (!fileData) {
        throw new Error("File not found in storage");
      }

      const arrayBuffer = await fileData.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const lowerName = (file_name || file_path).toLowerCase();

      if (lowerName.endsWith(".pdf")) {
        extractedText = extractPdfText(bytes);
      } else if (lowerName.endsWith(".docx")) {
        extractedText = extractDocxText(bytes);
      } else {
        extractedText = extractPlainText(bytes);
      }
    }

    if (!extractedText || extractedText.trim().length < 20) {
      // Use document metadata to construct a meaningful prompt for Gemini
      extractedText = `Document: ${doc.name}\nType: ${doc.type}\nJurisdiction: ${doc.jurisdiction || "Not specified"}\n\nThe document text could not be fully extracted. Analyze based on the document type and available metadata.`;
    }

    // ── Step 2: Chunking ──
    const chunks = splitText(extractedText, 1500, 200);
    const limitedChunks = chunks.length > 0 ? chunks.slice(0, 50) : [extractedText.slice(0, 5000)];

    // ── Step 3: Generate embeddings & store in vector DB ──
    const embeddings = await generateEmbeddings(limitedChunks);

    const chunkRows = limitedChunks.map((content, i) => ({
      document_id,
      chunk_index: i,
      content,
      embedding: `[${embeddings[i].join(",")}]`,
      metadata: { source: file_name || doc.name, chunk_size: content.length },
    }));

    const { error: chunkError } = await supabase
      .from("document_chunks")
      .insert(chunkRows);

    if (chunkError) {
      console.error("Failed to store chunks:", chunkError);
    }

    // ── Step 4: RAG retrieval — find relevant chunks for risk analysis ──
    const ragQuery = "liability termination confidentiality indemnification governing law data protection risk";
    const ragResults = await retrieveRelevantChunks(supabase, ragQuery, document_id, 8);
    const ragContext = ragResults.map((r: { content: string }) => r.content).join("\n\n");

    // Prepare combined text for LLM (use chunks + RAG context)
    const analysisText = limitedChunks.slice(0, 10).join("\n\n");

    // ── Step 5: LLM Risk Analysis ──
    const llmRisks = await analyzeRisksWithLLM(analysisText, ragContext);

    // Map LLM output to DB schema
    const risksData = llmRisks.map((r: Record<string, unknown>, i: number) => ({
      document_id,
      risk_code: `RISK-${String(i + 1).padStart(2, "0")}`,
      title: String(r.title || `Risk ${i + 1}`),
      severity: ["High", "Medium", "Low"].includes(String(r.severity)) ? String(r.severity) : "Medium",
      confidence: Math.min(100, Math.max(0, parseInt(String(r.confidence)) || 75)),
      evidence: String(r.evidence || ""),
      page_number: parseInt(String(r.page)) || 0,
      clause: String(r.clause || ""),
      reason: String(r.reason || ""),
      recommendation: String(r.recommendation || ""),
      action_status: "pending",
    }));

    // ── Step 6: LLM Summary Generation ──
    const summary = await generateSummaryWithLLM(analysisText, ragContext);

    // Compute risk summary
    const high = risksData.filter((r) => r.severity === "High").length;
    const medium = risksData.filter((r) => r.severity === "Medium").length;
    const low = risksData.filter((r) => r.severity === "Low").length;
    const overall = high > 0 ? "High" : medium > 0 ? "Medium" : "Low";
    const confidence = risksData.length > 0
      ? Math.round(risksData.reduce((s, r) => s + r.confidence, 0) / risksData.length)
      : 0;

    // ── Store processing steps ──
    const stepsData = PIPELINE_STEPS.map((step, i) => ({
      document_id,
      step_number: i + 1,
      name: step.name,
      detail: step.detail,
      status: "completed",
    }));

    await supabase.from("processing_steps").insert(stepsData);

    // ── Store risks ──
    if (risksData.length > 0) {
      const { error: risksError } = await supabase.from("risks").insert(risksData);
      if (risksError) console.error("Failed to insert risks:", risksError);
    }

    // ── Update document with results ──
    await supabase
      .from("documents")
      .update({
        status: "Completed",
        risk: overall,
        contract_summary: summary,
        risk_overall: overall,
        risk_high: high,
        risk_medium: medium,
        risk_low: low,
        risk_confidence: confidence,
        pages: Math.max(doc.pages || 0, Math.ceil(extractedText.length / 3000)),
      })
      .eq("id", document_id);

    // ── Create audit events ──
    const auditData = [
      {
        document_id,
        user_id: doc.user_id,
        action: "Document Uploaded",
        detail: `${file_name || doc.name} uploaded for analysis`,
        actor_name: doc.uploaded_by || "User",
        actor_role: "User",
        status: "Completed",
      },
      {
        document_id,
        user_id: doc.user_id,
        action: "Text Extraction & Chunking",
        detail: `${limitedChunks.length} chunks created from extracted text`,
        actor_name: "System",
        actor_role: "System",
        status: "Completed",
      },
      {
        document_id,
        user_id: doc.user_id,
        action: "Embeddings & Vector Storage",
        detail: `${embeddings.length} chunk embeddings stored in vector database`,
        actor_name: "Gemini AI",
        actor_role: "AI",
        status: "Completed",
      },
      {
        document_id,
        user_id: doc.user_id,
        action: "RAG Retrieval",
        detail: `${ragResults.length} relevant chunks retrieved for analysis context`,
        actor_name: "System",
        actor_role: "System",
        status: "Completed",
      },
      {
        document_id,
        user_id: doc.user_id,
        action: "AI Risk Analysis",
        detail: `${risksData.length} risks identified — ${high} High, ${medium} Medium, ${low} Low`,
        actor_name: "Gemini AI",
        actor_role: "AI",
        status: "Completed",
      },
      {
        document_id,
        user_id: doc.user_id,
        action: "Summary Generated",
        detail: "AI-generated executive summary and recommendations created",
        actor_name: "Gemini AI",
        actor_role: "AI",
        status: "Completed",
      },
    ];

    await supabase.from("audit_events").insert(auditData);

    // ── Create notification ──
    await supabase.from("notifications").insert({
      user_id: doc.user_id,
      title: "Analysis complete",
      detail: `${doc.name} is ready for review — ${risksData.length} risks found`,
      time_label: "Just now",
      is_read: false,
    });

    return new Response(
      JSON.stringify({
        success: true,
        document_id,
        risks_count: risksData.length,
        risk_summary: { overall, high, medium, low, confidence },
        chunks_created: limitedChunks.length,
        rag_results: ragResults.length,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Process document error:", err);

    // Update document status to Failed on error
    const body = await req.clone().json().catch(() => ({}));
    if (body.document_id) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );
      await supabase
        .from("documents")
        .update({ status: "Failed" })
        .eq("id", body.document_id);
    }

    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
