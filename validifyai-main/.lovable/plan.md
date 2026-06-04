## Validify AI — Production-Grade Refactor Plan

This is a large refactor. Before I start churning files, here's the proposed scope so you can confirm or trim. The app stays on **TanStack Start + TanStack Router** (already installed) — I'll add React Query, Zustand, RHF+Zod, and an Axios client on top. No Next.js, no react-router-dom (those don't apply here).

---

### 1. Architecture & folders

Reorganize into:
```
src/
  components/{ui,landing,dashboard,charts,auth,reports,chat,common}
  routes/                 # unchanged TanStack file-based routes
  services/               # auth, ideas, reports, chat, user
  hooks/                  # useAuth, useIdeas, useDebounce, etc.
  store/                  # auth.store, dashboard.store, theme.store (Zustand)
  lib/                    # api.ts (axios), query-client.ts, utils.ts
  types/                  # startup, report, user, api
  providers/              # AuthProvider, QueryProvider, ThemeProvider
  constants/              # routes, config, nav
  assets/  styles/
```
Existing routes & pages stay; only imports get rewired.

### 2. Data layer

- `lib/api.ts` — Axios instance, `VITE_API_URL`, JWT interceptor from auth store, response error normalizer, `withCredentials`.
- `lib/query-client.ts` — QueryClient (staleTime 60s, retry 1, refetch off on focus). Wire `QueryClientProvider` + Devtools in `__root.tsx`.
- `services/*.service.ts` — typed functions returning `Promise<T>`, all going through `api`.
- `hooks/queries/*` — thin `useQuery`/`useMutation` wrappers per resource.
- `.env.example` with `VITE_API_URL`.

### 3. State

- Zustand stores with `persist` middleware for auth + theme.
- `dashboard.store` for filters (industry, range, search).

### 4. Auth scaffolding

- `providers/AuthProvider.tsx` hydrates from localStorage, exposes `user/token/login/logout`.
- `_authenticated.tsx` layout route with `beforeLoad` redirect to `/login` (move dashboard routes under it).
- Login/Register pages wired to `auth.service` via RHF + Zod.

### 5. Forms

- RHF + Zod resolvers. Reusable `components/common/Form/*` (FormField, FormError).
- Refactor validate-idea + auth forms.

### 6. UI polish (the big one — de-template-ify)

- **Tokens**: tone down `src/styles.css` — remove heavy `shadow-glow`, replace `bg-gradient-primary` hero washes with single accent + neutral surfaces. Tighter neutral palette (zinc-based), one accent color (indigo/violet), no rainbow chart palette.
- **Glass**: drop `.glass-strong` everywhere except where it earns its place (1–2 spots max). Replace with solid `bg-card` + `border-border`.
- **Landing**: rewrite Hero, Features, Pricing copy — shorter, fewer buzzwords, less symmetry. Remove gradient orbs. Restrained Linear/Vercel-style hero.
- **Dashboard**: real product chrome — command palette hint, denser sidebar, sectioned widgets with quiet borders instead of glow cards. Filter bar.
- **Charts**: extract to `components/charts/{AreaChart,RadarChart,PieChart,BarChart}.tsx` with shared theme tokens (no inline `oklch(...)` literals scattered around).
- **Motion**: strip floating/pulse animations; keep only fade/slide on mount and hover transforms ≤2px.
- **Typography**: tighter scale, more whitespace, consistent label/eyebrow treatment.

### 7. Common components

`PageHeader`, `SectionHeader`, `EmptyState`, `LoadingScreen`, `ErrorState`, `ConfirmDialog`, `SearchBar`, `DataTable`, `Pagination`, `Skeleton` variants.

### 8. Errors & loading

- Route-level `errorComponent` + `notFoundComponent` (root + dashboard).
- Toast via `sonner` (already installed) — skip `react-hot-toast` to avoid duplicate toasters.
- Skeleton loaders on dashboard widgets.

### 9. Chat upgrade

- Split into `components/chat/{MessageList,MessageBubble,Composer,HistorySidebar}`.
- Markdown via `react-markdown` + `remark-gfm`.
- Streaming-ready hook (`useChatStream`) with abort controller, even if backend mock for now.

### 10. Responsiveness pass

Mobile sidebar drawer, chart `ResponsiveContainer` audits, fix overflow on reports/validate pages.

---

### Notes / deviations from your spec

- **Keeping `sonner`** instead of adding `react-hot-toast` (already wired, same UX, one fewer dep).
- **No Axios `withCredentials` + JWT both** by default — I'll use bearer token from store; can flip to cookies later.
- **No Next.js** — your prompt mentions Next 15 but project is TanStack Start. Staying on TanStack.
- **Auth is scaffolding only** (no Lovable Cloud enable) since you said "prepare for real backend." Login still works against a mock until a backend exists.

### Scope I'll skip unless you ask

- Real backend / Lovable Cloud enablement.
- i18n, RBAC, billing pages.
- Storybook / tests.

---

Reply **"go"** to execute, or tell me what to cut/add. Given the size, expect this to land in several batched edits.