# MVP Plan: The Nexus (3–4 Month Build)

Goal: Launch a focused, reliable pilot at one institution validating student engagement, collaboration, and AI-assisted learning value—while laying foundations for future expansion.

---

## 1. MVP Success Criteria (Exit Signals)

| Area             | Metric (Target)                                                                                 |
| ---------------- | ----------------------------------------------------------------------------------------------- |
| Activation       | >50% of invited students complete onboarding (create profile + join ≥1 course) in first 2 weeks |
| Engagement       | ≥35% WAU / invited students by end of Month 3                                                   |
| Learning Feature | ≥60% pass rate on second attempt of pre-tests (shows mastery loop)                              |
| Collaboration    | ≥30% of active users create/join a group OR form a study match                                  |
| Content Flow     | ≥70% of uploaded resources accessed at least once within 14 days                                |
| Reliability      | P95 core API latency <450ms; uptime ≥99% rolling 30 days                                        |

---

## 2. MVP Feature Scope (Build Now vs Defer)

| Area              | Include (MVP)                                             | Defer / Stretch                              |
| ----------------- | --------------------------------------------------------- | -------------------------------------------- |
| Auth              | Email/password + password reset                           | SSO (SAML/OAuth)                             |
| Profiles          | Basic profile (name, picture, skills tags)                | Portfolio auto-assembly                      |
| Courses / Classes | Manual course creation + enrollment join code             | LMS sync adapter (Moodle)                    |
| Resources         | Upload (PDF, doc, link), tagging by course                | Versioning, advanced search filters          |
| Pre-Test (AI)     | MCQ generation (5 questions) + gate to resource           | Adaptive difficulty / open-ended grading     |
| Feed              | Course & global announcements + basic posts               | Ranking algorithms, reactions analytics      |
| Groups & Clubs    | Create/join, posts, simple task list                      | Voice channels, file sharing inside group    |
| Matching          | Study buddy: simple course & skills overlap               | Fairness constraints, project team formation |
| Forums/Q&A        | Ask, answer, accept answer                                | AI summarization, duplicate detection        |
| Notifications     | In-app (polling) for mentions & group invites             | Real-time push / email digests               |
| AI Infra          | Managed LLM API, pgvector for embeddings                  | Self-hosted LLM, fine-tuning                 |
| Moderation        | Manual admin removal + profanity/length filters           | ML toxicity model integration                |
| Admin             | Basic dashboard: user count, active users, resource usage | Retention & risk analytics                   |

---

## 3. Technical Choices (Concrete)

| Layer              | Choice (MVP)                                      | Reason                             |
| ------------------ | ------------------------------------------------- | ---------------------------------- |
| Frontend           | React + TypeScript + Vite + Tailwind              | Fast iteration, consistent styling |
| State Mgmt         | TanStack Query (server state) + light Zustand     | Avoid over-centralization          |
| Forms & Validation | React Hook Form + Zod                             | Type-safe & performant             |
| Backend            | Node.js (Express)                                 | Familiar, ecosystem rich           |
| Auth               | JWT (15m) + refresh token (Redis or DB)           | Standard & simple                  |
| DB                 | PostgreSQL + Prisma                               | Strong relational + type safety    |
| Vector Store       | pgvector extension                                | Simplicity (no extra service)      |
| Job Queue          | BullMQ (Redis)                                    | Background embedding + email tasks |
| File Storage       | S3-compatible (e.g., MinIO local, or AWS S3 prod) | Scalable & decoupled               |
| Caching            | Redis (sessions + simple caches)                  | Low complexity                     |
| Embeddings         | sentence-transformers (API or local)              | Lightweight, good semantic quality |
| LLM Access         | Managed API (OpenAI GPT-4o mini / Claude Haiku)   | Faster build, predictable quality  |
| MCQ Generation     | Prompt template + retrieval of resource chunks    | Rapid feature delivery             |
| Monitoring         | Basic: health endpoint + pino logs → console      | Expand later to full metrics       |
| Testing            | Vitest/Jest + Supertest for API                   | Quick feedback                     |

---

## 4. Data Model (Minimum Tables)

users(id, email, password_hash, display_name, avatar_url, skills jsonb, created_at)
courses(id, code, title, description, created_by, created_at)
enrollments(id, user_id, course_id, role, created_at)
resources(id, course_id, uploader_id, title, type, storage_key, created_at)
resource_tests(id, resource_id, generated_at, model_version)
questions(id, resource_test_id, body, options jsonb, correct_index, difficulty, created_at)
attempts(id, user_id, resource_test_id, score, passed boolean, created_at)
posts(id, author_id, scope_type, scope_id, body, created_at)
groups(id, name, description, visibility, owner_id, created_at)
group_members(id, group_id, user_id, role, created_at)
study_matches(id, user_a, user_b, basis jsonb, created_at)
notifications(id, user_id, type, payload jsonb, read_at, created_at)
embeddings(id, source_type, source_id, chunk_index, text, embedding vector, created_at)

---

## 5. AI Components (MVP Depth)

- Resource Ingestion: Chunk + embed (store embedding + text reference)
- MCQ Generation Flow:
  1. Retrieve top N chunks for resource
  2. Prompt LLM for 5 MCQs (JSON schema)
  3. Validate schema + filter duplicates (embedding similarity threshold)
  4. Store questions; gate resource until user passes (≥60%)
- Matching:
  - Compute user embedding = avg(skill tag embeddings + course titles)
  - For each user, find top 5 nearest within same institution & overlapping course count ≥1
  - Store daily suggestions (cache)

---

## 6. Security / Privacy Baseline

- Hash: Argon2id
- Rate limiting: Basic per-IP + per-user (Redis) for auth & posting
- Input validation: Zod schemas
- File scanning: (If time) queue ClamAV; else limit types + size (<=10MB)
- Secrets: .env (MVP) → vault later
- Logging: No sensitive payloads; user_id + request_id correlation

---

## 7. Timeline (Weeks 1–16)

### Month 1 (Weeks 1–4): Foundation

| Week | Focus                      | Deliverables                                                          |
| ---- | -------------------------- | --------------------------------------------------------------------- |
| 1    | Repo setup + Auth          | Monorepo (optional), auth APIs, DB schema v1, migrations              |
| 2    | Courses & Enrollment       | CRUD courses, join via code, basic UI forms                           |
| 3    | Resource Upload + Storage  | File upload (PDF), listing by course, basic feed skeleton             |
| 4    | Embeddings + MCQ Prototype | pgvector install, chunker script, MCQ generation API (manual trigger) |

### Month 2 (Weeks 5–8): Core Learning & Collaboration

| Week | Focus                   | Deliverables                                                   |
| ---- | ----------------------- | -------------------------------------------------------------- |
| 5    | Pre-Test Gate           | Attempt flow, pass check, unlock resource UI state             |
| 6    | Groups & Membership     | Create/join group, group posts, simple task list               |
| 7    | Forums / Q&A            | Ask, answer, accept; pagination; basic moderation admin delete |
| 8    | Study Buddy Matching v1 | Daily job generating suggestions; UI list + connect action     |

### Month 3 (Weeks 9–12): Stability & UX

| Week | Focus                   | Deliverables                                                                      |
| ---- | ----------------------- | --------------------------------------------------------------------------------- |
| 9    | Notifications (polling) | In-app notifications (new answer, match suggestion)                               |
| 10   | Refinement              | UI polish, loading states, empty states, error boundaries                         |
| 11   | Metrics & Logging       | Basic usage counters, admin dashboard (user count, active users, resource access) |
| 12   | Internal Pilot Dry Run  | Seed data, performance smoke tests, fix critical bugs                             |

### Month 4 (Weeks 13–16): Pilot Readiness & Stretch

| Week | Focus                     | Deliverables                                         |
| ---- | ------------------------- | ---------------------------------------------------- |
| 13   | Faculty Tools Lite        | Resource tagging improvements, question regen button |
| 14   | Matching Improvement      | Exclude previous matches, diversify suggestions      |
| 15   | Hardening                 | Security pass, dependency updates, backup scripts    |
| 16   | Pilot Launch & Monitoring | Onboarding scripts, feedback collection channel      |

---

## 8. Stretch (Only If Ahead)

- LMS sync (Moodle) import (courses + enrollment)
- Reaction system (likes) in feed & forums
- Basic toxicity filter (open-source model API)
- Portfolio basic page (list courses, groups, contributions)

---

## 9. Risks & Mitigations

| Risk                     | Impact                | Mitigation                                                  |
| ------------------------ | --------------------- | ----------------------------------------------------------- |
| AI Question Quality Poor | Blocked learning gate | Manual regen button + log low-score items                   |
| Scope Creep              | Delay                 | Weekly scope review; freeze after Week 6                    |
| Performance Degradation  | User frustration      | Add DB indices early; measure P95 queries                   |
| Low Engagement           | Weak validation       | Early seeding: sample posts/resources; onboarding checklist |
| Matching Irrelevant      | Feature ignored       | Display explanation (why matched) + simple feedback button  |

---

## 10. Instrumentation (MVP Level)

Track events: user_registered, course_joined, resource_uploaded, test_generated, test_attempted(pass/fail), resource_unlocked, group_created, group_joined, question_posted, answer_posted, match_viewed, match_contacted.
Store daily aggregates for dashboard.

---

## 11. Daily / Weekly Cadence (Team Discipline)

| Cadence      | Activity                                        |
| ------------ | ----------------------------------------------- |
| Daily        | Stand-up + check error logs + deployment status |
| Twice Weekly | Backlog prune & re-prioritize                   |
| Weekly       | Metrics snapshot + risk review                  |
| End of Month | Feature freeze review & retro                   |

---

## 12. Deployment Strategy

- Environments: dev (auto deploy main), staging (manual promote), pilot (tagged release)
- Rollback: Keep previous container image + migration down scripts where safe
- Backups: Nightly DB dump (off-site storage)

---

## 13. Minimal UI Pages (Wireframe List)

1. Login / Register
2. Dashboard (recent courses, groups, suggestions)
3. Course Detail (resources + upload)
4. Resource View (locked → pre-test → unlocked)
5. Pre-Test Attempt Page
6. Groups List + Group Detail (posts, tasks)
7. Forums List + Thread Page
8. Study Buddy Suggestions Page
9. Notifications Panel
10. Admin Mini Dashboard

---

## 14. Acceptance Test Examples

- User cannot view resource body until passing pre-test → returns 403 with reason
- Generating MCQ set yields exactly 5 valid questions with 4 options each
- Matching endpoint excludes the requesting user & returns max 5 suggestions
- Group membership required to view group posts
- Resource attempt recorded only once per submission

---

## 15. Post-Pilot Preparation (Forward Look)

Ready next if metrics validate:

- Adaptive difficulty for quizzes
- Portfolio auto-assembly & share link
- LMS integration
- Advanced analytics (risk prediction)

---

Focus: Ship value early, prove engagement loop (Resource → Pre-Test → Unlock → Collaboration), collect qualitative faculty & student feedback, then expand.
