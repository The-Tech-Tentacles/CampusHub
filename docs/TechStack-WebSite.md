## Core Platform Tech Stack (Web Application Layer)

Primary Stack: PERN (PostgreSQL, Express.js, React, Node.js) — unified language (TypeScript) across front & back, strong ecosystem, easy hiring, good relational integrity.

---

### Architecture Overview

| Layer                 | Primary Tech                                                            | Notes                                                        |
| --------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------ |
| Client (Web)          | React + TypeScript + Vite (or Next.js if SSR/SEO needed later)          | Tailwind CSS + Headless UI + Zustand/Redux Toolkit for state |
| API Gateway / Backend | Express.js (modular routers)                                            | Consider Fastify for performance if latency critical         |
| ORM / Data Access     | Prisma ORM                                                              | Type-safe schema, migrations, introspection                  |
| Database              | PostgreSQL                                                              | Use schemas per domain (auth, lms, social)                   |
| Realtime              | WebSockets (Socket.IO) / native ws                                      | Offload to Rocket.Chat / Stream for chat domain              |
| Auth & Sessions       | JWT (short-lived) + Refresh tokens; optional Keycloak / Ory Hydra later | Role + attribute-based checks                                |
| File Storage          | S3-compatible (MinIO)                                                   | Pre-signed uploads from client                               |
| Caching Layer         | Redis                                                                   | Session cache, rate limits, feed precompute                  |
| Background Jobs       | BullMQ (Redis)                                                          | Email, notifications, ingestion, embedding dispatch          |
| Search                | PostgreSQL full-text (MVP) → OpenSearch/Meilisearch (scale)             | Hybrid with pgvector for semantic                            |
| API Style             | REST (MVP) + incremental GraphQL or tRPC for client efficiency          | Keep boundaries clean                                        |
| Messaging/Event Bus   | Redis Streams (MVP) → Kafka / Redpanda (scale)                          | For activity feeds & ML signals                              |
| Containerization      | Docker + docker-compose → K8s (scale)                                   | Use multi-stage builds                                       |
| Deployment            | Fly.io / Railway / Render (MVP) → AWS/GCP (scale)                       | Keep infra-as-code ready                                     |
| Infra-as-Code         | Terraform                                                               | Separate state per environment                               |
| Monitoring            | Prometheus + Grafana                                                    | Health, DB, latency, queue depth                             |
| Logging               | Pino (app) + Loki / OpenSearch                                          | Correlation IDs per request                                  |
| Metrics & Tracing     | OpenTelemetry                                                           | Distributed trace instrumentation                            |
| CI/CD                 | GitHub Actions                                                          | Lint → Test → Build → Deploy gates                           |

---

### Frontend Stack Detail

| Concern                       | Choice                                                   | Rationale                                 |
| ----------------------------- | -------------------------------------------------------- | ----------------------------------------- |
| Build Tool                    | Vite                                                     | Fast dev HMR, future SSR via adapters     |
| Component Styling             | Tailwind CSS + variant utilities                         | Consistency, design tokens mapping        |
| State (Global)                | Zustand (simple domains) / Redux Toolkit (complex flows) | Avoid over-centralization                 |
| Forms                         | React Hook Form + Zod validation                         | Type-safe + performant                    |
| Routing                       | React Router (MVP) → Next.js (if SSR/SEO)                | Start simple                              |
| Data Fetch                    | TanStack Query                                           | Caching, re-fetch hooks, offline patterns |
| Design System                 | Custom tokens + Radix UI primitives                      | Accessible components                     |
| Internationalization (future) | i18next                                                  | Optional feature gating                   |
| Accessibility                 | axe-core CI audits                                       | Compliance baseline                       |

---

### Backend Service Modules (Logical Domains)

| Module              | Responsibilities                                    | Notes                                  |
| ------------------- | --------------------------------------------------- | -------------------------------------- |
| Auth                | Registration, login, password reset, token rotation | Future SSO (SAML/OAuth) adapter        |
| User Profile        | Academic info, achievements, portfolio meta         | Feeds ML feature store                 |
| Social Feed         | Posts, reactions, moderation flags                  | Append-only events table for analytics |
| Groups & Clubs      | Membership, roles, channels link                    | Integrate with external chat IDs       |
| LMS Integration     | Course sync, assignments proxy, grade fetch         | Moodle/Canvas API adaptors             |
| Resource Library    | Upload, versioning, access gating                   | Ties into AI pre-access tests          |
| Notification        | Email, in-app, push dispatch                        | Throttle + preference center           |
| Matching Engine API | Exposes match requests to AI layer                  | Async jobs with status polling         |
| Search              | Faceted + semantic retrieval endpoints              | Hybrid query planning                  |
| Audit & Compliance  | Event log, access traces                            | WORM storage option later              |

---

### Integration Strategy (External Systems)

| Domain          | Option                  | Approach                                                  | When                       |
| --------------- | ----------------------- | --------------------------------------------------------- | -------------------------- |
| Chat            | Rocket.Chat (self-host) | IFrame/embed + OAuth SSO + channel provisioning API       | Phase 1–2                  |
| Chat (alt)      | Stream Chat (managed)   | Server token generation + web SDK                         | If time-to-market critical |
| LMS             | Moodle                  | Service account + REST Web Services + scheduled sync jobs | Pilot                      |
| LMS (alt)       | Canvas / Open edX       | Adapter interface pattern                                 | University variation       |
| Email           | Resend / Postmark       | Reliable templates + webhook status                       | MVP                        |
| File Virus Scan | ClamAV (container)      | Scan before persistence                                   | MVP                        |
| Auth Hardening  | Keycloak / Ory Hydra    | If custom auth becomes a drag                             | Scale                      |

---

### Data Modeling Principles

1. Use UUID v7 (time-ordered) for major entities (user, post, resource, course)
2. Soft deletes via deleted_at; background janitor for hard purge (privacy requests)
3. Multi-tenancy (future): Add institution_id to core tables; row-level policies
4. Audit fields: created_by, updated_by where meaningful
5. Event sourcing selectively (feed_activity, moderation_event) for reconstructability

---

### Example Core Tables (Concise)

users(id, email, password_hash, display_name, role, institution_id, created_at)
profiles(user_id PK/FK, bio, skills jsonb, portfolio_visibility, updated_at)
courses(id, code, title, institution_id, external_lms_id, metadata jsonb)
enrollments(id, user_id, course_id, role, created_at)
resources(id, course_id, title, type, storage_key, checksum, visibility, created_at)
posts(id, author_id, scope_type, scope_id, body, metadata jsonb, created_at)
groups(id, name, owner_id, visibility, chat_external_channel_id, created_at)
group_members(id, group_id, user_id, role, joined_at)
notifications(id, user_id, type, payload jsonb, read_at, created_at)
feed_activity(id, actor_id, verb, object_type, object_id, context jsonb, created_at)

---

### API Design Conventions

| Aspect      | Convention                                                         |
| ----------- | ------------------------------------------------------------------ |
| Versioning  | /api/v1 prefix; backward-compatible additive changes               |
| Errors      | JSON: { error: { code, message, details? } }                       |
| Pagination  | Cursor-based (created_at, id) + limit                              |
| Filtering   | Query params with strict allowlist; advanced via /search endpoints |
| Idempotency | Idempotency-Key header for mutation prone to retries               |
| Rate Limits | Sliding window in Redis; headers: X-RateLimit-\*                   |

---

### Security & Compliance

| Concern          | Measure                                                              |
| ---------------- | -------------------------------------------------------------------- |
| Auth             | Short JWT (5–10m) + refresh rotation + device session table          |
| Passwords        | Argon2id (libsodium)                                                 |
| Secrets          | Vault / SSM Parameter Store (scale)                                  |
| RBAC             | role + attribute checks; resource ownership decorator                |
| Input Validation | Zod / Joi at boundaries                                              |
| File Upload      | Size limit, extension whitelist, ClamAV scan before commit           |
| Audit            | Append-only logs secure channel to storage bucket                    |
| CSRF             | Not needed for pure token APIs; else SameSite=strict + double submit |
| CORS             | Allowlist of origins per environment                                 |
| Logging Hygiene  | PII scrub middleware (email, tokens)                                 |

---

### Performance Targets (MVP)

| Endpoint                        | P95 Latency |
| ------------------------------- | ----------- |
| Auth login                      | <250ms      |
| Feed fetch (paginated)          | <400ms      |
| Resource upload (metadata save) | <300ms      |
| Group creation                  | <300ms      |
| Notification poll               | <200ms      |

Budgeting Early: DB connections < 40 (pool), average CPU < 50%, error rate < 0.5%.

---

### Caching Strategy

| Layer         | What                   | TTL                 |
| ------------- | ---------------------- | ------------------- |
| API Response  | Public course metadata | 5m                  |
| Computed Feed | User feed slice        | 30–60s              |
| Lookup        | Institution settings   | 10m                 |
| Auth          | Session/refresh state  | Duration of session |

Invalidate via event bus (Redis pub/sub) keyed namespaces.

---

### Background Jobs (Initial Set)

| Job               | Trigger             | Description                         |
| ----------------- | ------------------- | ----------------------------------- |
| SendEmail         | Event emit          | Templated transactional mail        |
| SyncLMSCourses    | Schedule (hourly)   | Pull course updates via Moodle API  |
| RebuildFeed       | User activity burst | Precompute personalized feed page 1 |
| CleanupUploadsTmp | Nightly             | Remove abandoned temp files         |
| AggregateStats    | Nightly             | Summaries for admin dashboards      |

---

### Dev Workflow & Tooling

| Stage      | Tooling                                                 |
| ---------- | ------------------------------------------------------- |
| Lint       | ESLint + Prettier + TypeScript strict                   |
| Test       | Vitest / Jest (unit), Supertest (API)                   |
| Migrations | Prisma migrate deploy                                   |
| Local Env  | docker-compose: postgres, redis, minio, clamav, mailhog |
| Seed       | Script with institution + sample courses                |
| Pre-commit | lint-staged + type-check                                |

---

### Observability Minimum Viable

1. Structured logs (Pino) → Loki
2. Request tracing middleware (trace-id in response header)
3. Metrics: http_request_duration_seconds, db_query_time, queue_depth, job_failures
4. Alerting: latency P95 breach, error rate spike, queue backlog > threshold

---

### Progressive Enhancement / Phases

MVP (Month 1–2):

- Auth + Profiles + Courses + Resources + Basic Feed
- Rocket.Chat embedded (SSO passthrough) OR skip chat until pilot
- LMS sync (subset: course list + enrollment)
- Minimal notifications (in-app poll)

Phase 2 (Month 3–4):

- Full group system + external chat provisioning
- File versioning + advanced search (add Meilisearch)
- Real-time notifications (WebSocket)
- Basic analytics dashboard

Phase 3 (Scale):

- Multi-institution tenancy + permission boundaries
- Event bus upgrade to Kafka/Redpanda
- Horizontal scaling + CDN + edge caching for static + asset optimization
- GraphQL/tRPC refinement for mobile clients

---

### Build vs Integrate Decisions

| Capability | Decision                              | Reason                             |
| ---------- | ------------------------------------- | ---------------------------------- |
| Chat       | Integrate (Rocket.Chat / Stream)      | Time & reliability                 |
| LMS core   | Integrate (Moodle/Canvas)             | Feature richness                   |
| Feed       | Build                                 | Domain unique + ML instrumentation |
| Matching   | Build (AI pipeline)                   | Differentiation                    |
| Moderation | Hybrid (basic build + external model) | Control + accuracy                 |
| Auth       | Build (MVP) → optional integrate      | Simplicity early                   |

---

### Risk & Mitigation Snapshot

| Risk                    | Impact             | Mitigation                                    |
| ----------------------- | ------------------ | --------------------------------------------- |
| Scope creep LMS         | Delays core value  | Limit to sync + assignment metadata initially |
| Chat complexity         | Burn cycles        | External integration with SLA                 |
| Performance regressions | Poor UX            | Budget metrics + automated load tests         |
| Data model churn        | Migration overhead | Schema review gate + versioned ERD            |
| Security gaps           | Trust loss         | Regular dependency scanning + threat modeling |

---

### Immediate Next Steps

1. Initialize monorepo (apps/web, apps/api, packages/shared)
2. Stand up Postgres + Redis + MinIO via docker-compose
3. Define Prisma schema (users, courses, resources, posts)
4. Implement auth + simple feed API
5. Add Rocket.Chat POC embedding + SSO handshake
6. Add CI pipeline (lint, test, build) + preview deployments

---
