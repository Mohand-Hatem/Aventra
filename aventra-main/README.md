# Aventra Frontend (Comment-Only Template)

This repository is currently a **documentation scaffold**.  
All architecture files are intentionally **comment-only** to explain structure before implementation.

## Why This Format

- Keeps the project structure clear without committing runtime logic yet.
- Helps onboard developers by showing where each concern should live.
- Provides file-level guidance and examples directly in each file.

## Current Architecture (Folders + Intent)

```txt
aventra-main/
├─ middleware.ts                      # comment-only: auth/role guard intention
├─ src/
│  ├─ app/                            # routes only (App Router)
│  │  ├─ layout.tsx                   # global layout blueprint
│  │  ├─ page.tsx                     # home page blueprint
│  │  ├─ login/page.tsx               # login page blueprint
│  │  ├─ register/page.tsx            # register page blueprint
│  │  ├─ user/layout.tsx              # user area shared layout blueprint
│  │  ├─ user/profile/page.tsx        # user profile page blueprint
│  │  ├─ user/upload-cv/page.tsx      # upload CV page blueprint
│  │  ├─ user/reports/page.tsx        # user reports page blueprint
│  │  ├─ company/layout.tsx           # company area shared layout blueprint
│  │  ├─ company/profile/page.tsx     # company profile page blueprint
│  │  ├─ company/search/page.tsx      # RAG search page blueprint
│  │  ├─ company/candidates/[id]/page.tsx
│  │  ├─ loading.tsx                  # loading UI blueprint
│  │  ├─ not-found.tsx                # 404 page blueprint
│  │  └─ globals.css                  # global styles blueprint
│  ├─ components/
│  │  ├─ ui/button.tsx                # primitive UI component blueprint
│  │  ├─ shared/page-header.tsx       # shared component blueprint
│  │  └─ feature/cv/upload-cv-form.tsx
│  ├─ lib/
│  │  ├─ axios.ts                     # HTTP client setup blueprint
│  │  ├─ react-query.ts               # QueryClient config blueprint
│  │  └─ utils.ts                     # utility helpers blueprint
│  ├─ queries/
│  │  ├─ auth.ts                      # auth hooks blueprint
│  │  └─ cv.ts                        # CV/RAG hooks blueprint
│  ├─ providers/
│  │  ├─ app-providers.tsx            # providers composition blueprint
│  │  └─ react-query-provider.tsx     # Query provider blueprint
│  ├─ stores/
│  │  ├─ sidebar-store.ts             # UI state blueprint
│  │  ├─ modal-store.ts               # UI state blueprint
│  │  └─ theme-store.ts               # UI state blueprint
│  ├─ types/
│  │  ├─ api.ts                       # API contract types blueprint
│  │  ├─ auth.ts                      # auth types blueprint
│  │  └─ cv.ts                        # CV domain types blueprint
│  ├─ schemas/
│  │  ├─ auth.ts                      # auth validation blueprint
│  │  └─ cv.ts                        # CV validation blueprint
│  └─ constants/
│     ├─ routes.ts                    # route constants blueprint
│     ├─ roles.ts                     # role constants blueprint
│     └─ query-keys.ts                # query keys blueprint
```

## How To Use This Template

1. Open any file and read the comment block.
2. Follow:
   - **Purpose** section to know why the file exists.
   - **Example** section to know what to implement.
3. Replace comments with real code gradually, keeping the same structure.

## Implementation Rules (When You Start Coding)

- Use **React Query** as the only server-state manager.
- Use **Axios** only as HTTP transport in `src/lib/axios.ts`.
- Use **Zustand** only for UI state in `src/stores/*`.
- Keep route files and route layouts inside `src/app/*`.
- Keep API logic inside `src/queries/*` (no services layer).

## Workflow Example (Planned)

1. User uploads CV on `/user/upload-cv`.
2. Validation runs with schema in `src/schemas/cv.ts`.
3. Mutation hook in `src/queries/cv.ts` sends request through Axios client.
4. Backend performs ATS + AI + RAG processing.
5. React Query cache updates, and UI re-renders automatically.

## Authentication & Access (Planned)

- Auth pages: `/login`, `/register`.
- Protected groups:
  - `/user/*` for role `user`
  - `/company/*` for role `company`
- `middleware.ts` comment explains intended redirect/authorization behavior.

## Notes

- This repository is intentionally non-runnable right now because files are comment-only by request.
- The structure is production-ready; only implementation code is pending.
