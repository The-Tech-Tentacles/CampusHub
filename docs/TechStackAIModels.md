## AI / ML Tech Stack for "The Nexus"

Goal: Power matching, adaptive learning content, auto-assessment, Q&A assistance, moderation, recommendations, semantic search, portfolio insights—while remaining privacy-first, cost-aware, and incrementally extensible.

---

### Core AI Capability Map

| Feature                     | AI Tasks                                                         | Models / Techniques                                                                                                    |
| --------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Study Buddy & Team Match    | Profile + course + skill embedding & constraint matching         | Sentence-transformer embeddings + clustering + Hungarian / stable matching                                             |
| AI Resource Creation        | Summarization, outline + content generation, adaptive difficulty | LLM (general) + prompt templates + RAG over course materials                                                           |
| Pre‑Access Resource Test    | Question generation (MCQ, short answer), difficulty calibration  | LLM + taxonomy prompts + answer key extraction + distractor generation heuristics                                      |
| Auto Grading / Feedback     | Semantic similarity, rubric-based evaluation                     | LLM w/ rubric prompt + embedding cosine checks + rule validators                                                       |
| Q&A Forum Assist            | Retrieval-Augmented Generation (RAG)                             | Hybrid BM25 + vector search + LLM answer synthesis                                                                     |
| Moderation (Posts, Chat)    | Toxicity, harassment, academic integrity                         | Lightweight classifier (DistilRoBERTa toxicity), optional API (OpenAI mod), plagiarism check (MinHash + embedding sim) |
| Personalized Feed           | Hybrid recommender (content + collaborative)                     | User/content embeddings + matrix factorization (ALS) + re-rank via CTR model                                           |
| Job / Opportunity Matching  | Skill & intent extraction                                        | NER + embeddings + rule filters                                                                                        |
| Portfolio Summaries         | Extractive + abstractive summarization                           | LLM + keyphrase extraction (YAKE / PositionRank)                                                                       |
| Semantic Search (Resources) | Dense + sparse retrieval                                         | pg_trgm / BM25 + pgvector / Qdrant                                                                                     |
| Document Ingestion          | Chunking, metadata enrichment                                    | Recursive chunking + embedding + PII scrub                                                                             |

---

### Model Layers

1. Base LLM Access (choose tiered):

   - MVP (Managed API): OpenAI GPT-4o mini / Anthropic Claude 3 Haiku (fast prototyping)
   - Cost-Control / Self-Host: Llama 3 8B / Mistral 7B-Instruct (vLLM / text-generation-inference)
   - Specialized: Fine-tuned adapter (LoRA) for question style + grading tone

2. Embeddings:

   - General text: sentence-transformers/all-MiniLM-L12-v2 (MVP), upgrade to nomic-embed-text / Instructor-xl
   - Code (if needed later): Salesforce CodeT5+ small

3. Moderation / Safety:

   - DistilRoberta-base toxicity fine-tuned (HateXplain/Detoxify)
   - Academic integrity: Local semantic similarity + heuristics (no full external copy-check initially)

4. Recommenders:

   - Phase 1: Content-based (embedding similarity + recency)
   - Phase 2: Hybrid: LightFM / implicit ALS + re-rank via gradient boosted trees (XGBoost) on engagement features

5. Matching Engine:

   - Skill vector = average of embeddings of declared skills + course descriptions + extracted keywords
   - Constraint solver: Hungarian (balanced team formation) or ILP (pulp/OR-Tools) for multi-criteria fairness

6. Question Generation & Grading:
   - Template library (MCQ, fill-in, short answer, conceptual explain)
   - LLM prompt slices: (a) context summary → (b) candidate questions → (c) distractor refine
   - Automated validation: deduplicate via embedding clustering; answer correctness via second-pass LLM critique

---

### Retrieval & Data Layer

| Layer              | Tool                                                        |
| ------------------ | ----------------------------------------------------------- |
| Primary DB         | PostgreSQL (already in PERN)                                |
| Vector Store (MVP) | Postgres + pgvector (simplifies ops)                        |
| Scale Option       | Qdrant or Weaviate (if >10M vectors / latency <30ms needed) |
| Object Store       | MinIO / S3 (raw docs, model artifacts)                      |
| Cache              | Redis (prompt & embedding cache)                            |
| Feature Store      | Feast (user engagement, skill features)                     |
| Metrics / Traces   | OpenTelemetry + Prometheus + Grafana                        |

Chunking Strategy: Recursive (800–1200 tokens overlap 100). Store: text, source_id, checksum, course_id, access_level, embedding, keywords.

---

### Orchestration & MLOps

| Function               | Tool                                            |
| ---------------------- | ----------------------------------------------- |
| Experiment Tracking    | MLflow                                          |
| Workflow Orchestration | Prefect (lighter) → Airflow (scale)             |
| Model Serving          | FastAPI + vLLM (for self-hosted LLM)            |
| CI Eval Harness        | pytest + custom eval scripts                    |
| Prompt Versioning      | Git + YAML prompt registry + MLflow params      |
| Data Validation        | Great Expectations (ingest), Pydantic (runtime) |
| Guardrails             | Guardrails.ai / Pydantic schema + regex filters |

Deployment Tiers:

1. MVP: Single inference service (LLM proxy) + retrieval service
2. Scale: Split (retrieval / generation / moderation / recommender) microservices, independent autoscaling
3. Advanced: Async pipeline for offline batch embeddings + feature refresh (daily) & incremental (event-driven)

---

### Inference Architecture (RAG Path)

User Query → Normalize → Safety Pre-check → Embed → Hybrid Retrieve (BM25 + vector) → Rerank (Cross-encoder small) → Context Packager (token budget) → LLM Generate → Post-process (citation injection, toxicity check) → Cache

Latency Targets:
| Stage | Budget |
|-------|--------|
| Retrieval (hybrid) | <150ms |
| Rerank (top 20→5) | <120ms |
| Generation (API) | 1.2–2.5s |
| End-to-end | <3s P95 |

Caching: (a) Embeddings (LRU in Redis), (b) Retrieval results hash(query_norm+filters), (c) Final answers (short TTL 5–15m if non-personalized)

---

### Data Pipeline (Incremental)

1. Ingest: File / text upload → virus scan → PII scrub (Presidio) → chunk → embed → store
2. Event Stream: Kafka / Redpanda events: view, click, like, answer_accept → feature store update
3. Nightly jobs: Recompute collaborative matrix + decay weights
4. Drift Monitor: Compare embedding centroid shift & moderation spike metrics

---

### Security & Privacy

PII Scrubbing: Presidio (names, emails, IDs) before external API calls.
Access Control: Row-level filtering on retrieval (course/group scope).
Audit: Log prompt + response hashes (not full content for sensitive student submissions) + model version id.
Prompt Injection Defense: Static allowlist of tool names + regex strip suspicious directives.

---

### Evaluation & Quality

Buckets:
| Capability | Metric |
|------------|--------|
| Question Gen | Valid rate (% non-ambiguous) |
| Grading | Agreement vs human sample (%) |
| Matching | Post-match retention / satisfaction survey |
| RAG Answers | Context citation precision / hallucination rate |
| Moderation | False positive rate |

Continuous Eval: Shadow set of 200 anonymized queries; weekly run across model versions; store scores in MLflow.

---

### Phased Rollout

MVP (Month 1–2):

- Managed LLM API
- pgvector + BM25 hybrid
- Basic question generation + simple matching

Phase 2 (Month 3–5):

- Add recommender hybrid layer
- Introduce self-host Llama 3 for low-stakes tasks
- Evaluation harness + drift detection

Phase 3 (Scale):

- Fine-tuned adapters (LoRA) for domain question style
- Dedicated moderation ensemble
- Autoscaling microservices & cost dashboards

---

### Tooling Summary (Concise)

LLM: GPT-4o mini / Llama 3 8B (vLLM)
Embeddings: sentence-transformers → Instructor-xl
Vector Store: pgvector → Qdrant (scale)
Recommender: LightFM / implicit + XGBoost re-rank
Workflow: Prefect
Tracking: MLflow
Moderation: DistilRoBERTa toxicity + rule filters
Guardrails: Pydantic + Guardrails.ai
Feature Store: Feast
PII: Presidio
Cache: Redis
Metrics: Prometheus + Grafana

---

### Minimal Schema Hints

table: embeddings (id, source_type, source_id, course_id, access_scope, chunk_index, text, embedding vector)
table: user_features (user_id, skills_vec, recency_score, engagement_features jsonb, updated_at)
table: questions (id, resource_id, type, body, answer_key, distractors jsonb, difficulty, model_version)
table: eval_metrics (id, capability, model_version, metric_name, value, run_id, timestamp)

---

### Immediate Next Steps

1. Add pgvector extension & embeddings table.
2. Implement ingestion + chunk + embed worker.
3. Build simple RAG endpoint (Top-k + prompt template v1).
4. Implement MCQ generator pipeline.
5. Log evaluation samples for later human review.

---
