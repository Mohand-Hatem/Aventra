# Aventra Frontend Template

This project is a **comment-only architecture template** for an ATS + AI CV analysis + RAG search frontend using Next.js App Router.

The goal of this README is to explain, for every folder and file:
- what it should do
- why it exists
- an example of how it should be implemented

## Project Tree

```txt
aventra-main/
├─ middleware.ts
└─ src/
   ├─ app/
   │  ├─ layout.tsx
   │  ├─ page.tsx
   │  ├─ login/page.tsx
   │  ├─ register/page.tsx
   │  ├─ user/layout.tsx
   │  ├─ user/profile/page.tsx
   │  ├─ user/upload-cv/page.tsx
   │  ├─ user/reports/page.tsx
   │  ├─ company/layout.tsx
   │  ├─ company/profile/page.tsx
   │  ├─ company/search/page.tsx
   │  ├─ company/candidates/[id]/page.tsx
   │  ├─ loading.tsx
   │  ├─ not-found.tsx
   │  └─ globals.css
   ├─ components/
   │  ├─ ui/button.tsx
   │  ├─ shared/page-header.tsx
   │  └─ feature/cv/upload-cv-form.tsx
   ├─ lib/
   │  ├─ axios.ts
   │  ├─ react-query.ts
   │  └─ utils.ts
   ├─ queries/
   │  ├─ auth.ts
   │  └─ cv.ts
   ├─ providers/
   │  ├─ app-providers.tsx
   │  └─ react-query-provider.tsx
   ├─ stores/
   │  ├─ sidebar-store.ts
   │  ├─ modal-store.ts
   │  └─ theme-store.ts
   ├─ types/
   │  ├─ api.ts
   │  ├─ auth.ts
   │  └─ cv.ts
   ├─ schemas/
   │  ├─ auth.ts
   │  └─ cv.ts
   └─ constants/
      ├─ routes.ts
      ├─ roles.ts
      └─ query-keys.ts
```

## Folder And File Guide

### `middleware.ts`
- **What it should do:** protect private routes and enforce role-based access.
- **Why it exists:** central security gate before route rendering.
- **Example:** redirect unauthenticated users from `/user/*` to `/login`; block non-company users from `/company/*`.

### `src/app`
- **What it should do:** define all App Router routes, layouts, and route-level loading/error UI.
- **Why it exists:** Next.js standard routing layer.
- **Example:** each route file calls feature components and query hooks, not raw API logic.

`src/app/layout.tsx`
- **Should do:** root HTML/body layout and provider wrapping.
- **Example:** wrap `children` with `AppProviders`.

`src/app/page.tsx`
- **Should do:** home page (landing/entry).
- **Example:** show links to `login` and `register`.

`src/app/login/page.tsx`
- **Should do:** login form UI.
- **Example:** validate credentials then call `useLoginMutation`.

`src/app/register/page.tsx`
- **Should do:** register form UI.
- **Example:** submit role (`user`/`company`) via `useRegisterMutation`.

`src/app/user/layout.tsx`
- **Should do:** shared layout for all `/user/*` routes.
- **Example:** user sidebar with links to profile/upload/reports.

`src/app/user/profile/page.tsx`
- **Should do:** candidate profile page.
- **Example:** fetch profile data and allow updates.

`src/app/user/upload-cv/page.tsx`
- **Should do:** CV upload page for candidates.
- **Example:** render `UploadCvForm` and mutation status.

`src/app/user/reports/page.tsx`
- **Should do:** user analysis history page.
- **Example:** list previous CV scores and AI summaries.

`src/app/company/layout.tsx`
- **Should do:** shared layout for all `/company/*` routes.
- **Example:** recruiter navigation for profile/search/candidates.

`src/app/company/profile/page.tsx`
- **Should do:** company profile/settings page.
- **Example:** manage hiring preferences and org info.

`src/app/company/search/page.tsx`
- **Should do:** RAG candidate search page.
- **Example:** submit search text and display ranked results.

`src/app/company/candidates/[id]/page.tsx`
- **Should do:** dynamic candidate detail page.
- **Example:** read `id` param and fetch candidate analysis by id.

`src/app/loading.tsx`
- **Should do:** route-level loading fallback.
- **Example:** spinner/skeleton while page data resolves.

`src/app/not-found.tsx`
- **Should do:** global 404 page.
- **Example:** show message + button back to home.

`src/app/globals.css`
- **Should do:** global styles, resets, variables.
- **Example:** define theme tokens and base typography.

### `src/components`
- **What it should do:** contain reusable UI and feature view components.
- **Why it exists:** separates presentation from route and data layers.
- **Example:** route pages compose components from here.

`src/components/ui/button.tsx`
- **Should do:** primitive reusable button.
- **Example:** support variants, disabled, loading state.

`src/components/shared/page-header.tsx`
- **Should do:** reusable page heading block.
- **Example:** title + subtitle used in many pages.

`src/components/feature/cv/upload-cv-form.tsx`
- **Should do:** CV upload form UI and event handling.
- **Example:** collect file and call upload mutation.

### `src/lib`
- **What it should do:** technical setup and generic utilities.
- **Why it exists:** avoid duplicated setup across features.

`src/lib/axios.ts`
- **Should do:** create shared Axios instance.
- **Example:** set `baseURL`, auth header interceptor.

`src/lib/react-query.ts`
- **Should do:** configure `QueryClient`.
- **Example:** set stale time, retries, cache garbage collection.

`src/lib/utils.ts`
- **Should do:** generic helper functions.
- **Example:** `cn()` className combiner, format helpers.

### `src/queries`
- **What it should do:** all API/server-state logic via React Query hooks.
- **Why it exists:** replaces service layer and keeps data flow clear.

`src/queries/auth.ts`
- **Should do:** auth hooks.
- **Example:** `useLoginMutation`, `useRegisterMutation`, `useCurrentUserQuery`.

`src/queries/cv.ts`
- **Should do:** CV + RAG hooks.
- **Example:** `useUploadCvMutation`, `useCvAnalysisListQuery`, `useRagSearchMutation`.

### `src/providers`
- **What it should do:** app-wide provider composition.
- **Why it exists:** single place for global wrappers.

`src/providers/app-providers.tsx`
- **Should do:** combine all providers.
- **Example:** return `ReactQueryProvider` around children.

`src/providers/react-query-provider.tsx`
- **Should do:** instantiate and expose QueryClientProvider.
- **Example:** `useState(createQueryClient)` for stable client.

### `src/stores`
- **What it should do:** Zustand stores for UI-only state.
- **Why it exists:** lightweight global UI state, separate from server data.

`src/stores/sidebar-store.ts`
- **Should do:** sidebar open/close state.
- **Example:** `toggleSidebar()`.

`src/stores/modal-store.ts`
- **Should do:** active modal state.
- **Example:** `openModal("delete")`, `closeModal()`.

`src/stores/theme-store.ts`
- **Should do:** theme mode state.
- **Example:** set `"light" | "dark" | "system"`.

### `src/types`
- **What it should do:** TypeScript contracts for API/domain.
- **Why it exists:** consistent typing across app.

`src/types/api.ts`
- **Should do:** generic API response types.
- **Example:** `ApiResponse<T>`, pagination shape.

`src/types/auth.ts`
- **Should do:** auth payload and user types.
- **Example:** `LoginPayload`, `AuthUser`, `AuthTokens`.

`src/types/cv.ts`
- **Should do:** CV analysis and search domain types.
- **Example:** `CvAnalysisResult`, `CvUploadPayload`.

### `src/schemas`
- **What it should do:** runtime validation with Zod.
- **Why it exists:** validate form and mutation payloads before requests.

`src/schemas/auth.ts`
- **Should do:** auth form schemas.
- **Example:** login email/password validation.

`src/schemas/cv.ts`
- **Should do:** CV upload/search schemas.
- **Example:** file required + optional target role.

### `src/constants`
- **What it should do:** centralized static values.
- **Why it exists:** avoid magic strings and duplication.

`src/constants/routes.ts`
- **Should do:** all route path constants.
- **Example:** `APP_ROUTES.userUploadCv = "/user/upload-cv"`.

`src/constants/roles.ts`
- **Should do:** role constants and role type.
- **Example:** `ROLES.user`, `ROLES.company`.

`src/constants/query-keys.ts`
- **Should do:** React Query key factory/constants.
- **Example:** `queryKeys.cv.analysisById(id)`.

## Development Rules For Implementation

- Use React Query as the **only** server-state manager.
- Keep Axios only in `src/lib/axios.ts`.
- Keep Zustand only for UI state in `src/stores/*`.
- Keep API calls inside `src/queries/*` (no `services` layer).
- Keep route concerns in `src/app/*`.

## Planned Data Flow Example

1. User uploads CV in `src/app/user/upload-cv/page.tsx`.
2. Form validates with `src/schemas/cv.ts`.
3. `useUploadCvMutation` in `src/queries/cv.ts` sends request through `src/lib/axios.ts`.
4. Backend performs ATS + AI + RAG processing.
5. React Query cache updates and UI rerenders with new data.
