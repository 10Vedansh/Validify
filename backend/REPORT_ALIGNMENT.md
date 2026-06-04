# Report Implementation — Frontend Compatibility Verification

## Endpoint Alignment

| Frontend `reportsService` call | Backend route | Status |
|---|---|---|
| `api.get<Report[]>("/reports")` | `GET /reports` → paginated `{ data, page, pageSize, total, totalPages }` | ✅ |
| `api.get<Report>("/reports/:id")` | `GET /reports/:id` → `ReportResponse` | ✅ |
| *(not in FE service yet)* `api.post("/reports/generate", body)` | `POST /reports/generate` → `ReportResponse` (201) | ✅ (new) |
| *(not in FE service yet)* `api.delete("/reports/:id")` | `DELETE /reports/:id` → `{ message }` | ✅ (new) |

## Response Shape Alignment

### Frontend `Report` → Backend `ReportResponse`

| Frontend field | Backend serialization | Status |
|---|---|---|
| `id: string` | `report.id` | ✅ |
| `ideaId: string` | `report.ideaId` | ✅ |
| `title: string` | `report.title` | ✅ |
| `summary: string` | `report.summary` | ✅ |
| `industry: string` | `report.industry` | ✅ |
| `score: { overall, market, team, moat, monetization, traction, risk }` | `report.overallScore/marketScore/...` → nested object | ✅ |
| `swot: { strengths, weaknesses, opportunities, threats }` | `report.strengths/weaknesses/...` arrays → nested object | ✅ |
| `competitors: { name, score, url? }[]` | `report.competitors` (JSONB) → parsed array | ✅ |
| `roadmap: { quarter, label }[]` | `report.roadmap` (JSONB) → parsed array | ✅ |
| `createdAt: string` | `report.createdAt.toISOString()` | ✅ |

### Paginated Response (`GET /reports`)

| Frontend `Paginated<T>` | Backend `PaginatedResult` | Status |
|---|---|---|
| `data: T[]` | `data: ReportResponse[]` | ✅ |
| `page: number` | `page` | ✅ |
| `pageSize: number` | `pageSize` | ✅ |
| `total: number` | `total` | ✅ |
| *(not in FE)* `totalPages` | `totalPages` | ✅ (bonus) |

## Authorization Rules

| Operation | Auth check |
|---|---|
| `POST /reports/generate` | `requireAuth` → only generates for own user |
| `GET /reports` | `requireAuth` → only returns own user's reports |
| `GET /reports/:id` | `requireAuth` → checks `report.userId === userId` (403 if mismatch) |
| `DELETE /reports/:id` | `requireAuth` → checks `report.userId === userId` (403 if mismatch) |

## Filtering & Pagination

| Query param | Type | Default | Description |
|---|---|---|---|
| `page` | int ≥1 | 1 | Page number |
| `pageSize` | int 1-100 | 10 | Items per page |
| `search` | string | — | Full-text search on title + summary |
| `industry` | string | — | Filter by industry (case-insensitive) |
| `sortBy` | `createdAt` \| `title` \| `overallScore` | `createdAt` | Sort column |
| `sortOrder` | `asc` \| `desc` | `desc` | Sort direction |

## Generate Request Body

```json
{
  "ideaId": "idea_001",         // Optional: use existing idea
  // OR provide all required idea fields:
  "name": "NeuroDesk",
  "industry": "Productivity",
  "problem": "Engineering teams lose 4+ hours per week...",
  "audience": "Engineering teams at mid-market SaaS",
  "businessModel": "SaaS",
  // Optional:
  "budget": "$500K seed",
  "country": "United States",
  "competitors": ["Notion AI", "Mem"],
  "notes": "Keyboard-first..."
}
```

## Error Responses

| Scenario | Status | Code |
|---|---|---|
| Report not found | 404 | `NOT_FOUND` |
| Report belongs to another user | 403 | `FORBIDDEN` |
| Missing required idea fields on generate | 400 | `BAD_REQUEST` |
| Unauthenticated | 401 | `UNAUTHORIZED` |

## Generation Flow

```
POST /reports/generate
  │
  ├── Resolve idea (existing or create new)
  ├── Create Validation (RUNNING)
  ├── Run 7 AI services in parallel (orchestrator)
  ├── Generate summary + roadmap (2 more LLM calls)
  ├── Update Validation (COMPLETE) with scores
  ├── Save Report to database
  └── Return 201 with serialized ReportResponse
```
