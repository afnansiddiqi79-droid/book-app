<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from the diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project: book-app

BookNook frontend — Next.js 16 App Router, React 19, TypeScript, Tailwind v4. Single package, no monorepo, no tests, no CI.

### Commands (verified)

- `npm run dev` — dev server (Turbopack), http://localhost:3000
- `npm run build` — production build
- `npm run start` — production serve
- `npm run lint` — bare `eslint` via flat config `eslint.config.mjs`
- `npx tsc --noEmit` — typecheck (no `typecheck` script exists)

No `test` script; nothing runs tests. Lint + typecheck is the full local verification.

### Structure

- App Router: `src/app/` — root `layout.tsx`, home `page.tsx`, routes `books`, `books/[id]`, `my-books`, `my-books/[id]/edit`, `add-book`, `login`, `register`, `profile`, `my-borrows`, plus `not-found.tsx`.
- Components: `src/components/{layout,home,books}` (navbar, footer, hero-slider, book-card, book-form, etc.)
- API + auth: `src/services/api.ts` (better-auth client + fetch wrapper), `src/context/auth-context.tsx` (wraps root layout)
- Types: `src/types/book.ts`, `src/types/borrow.ts`
- Styles: `src/app/globals.css` (`@import "tailwindcss"`, Tailwind v4 `@theme` tokens)
- Static assets: `public/`
- Path alias: `@/*` -> `./src/*`

### Runtime / env

- `NEXT_PUBLIC_API_URL` — backend base URL. `api.ts` defaults to `http://localhost:5000` if unset.
- `.env*` is gitignored; a local `.env` exists pointing at `https://book-server-sandy.vercel.app/`. No `.env.example` is committed.
- Auth token in `localStorage` under `booknook_token`; cached user under `booknook_user`.
- Images require `next.config.ts` `remotePatterns`: placehold.co, images.unsplash.com, covers.openlibrary.org, i.ibb.co.

### Toolchain quirks

- `next.config.ts` sets `reactCompiler: true` — React Compiler auto-memoizes components; don't add `useMemo`/`useCallback` solely for perf.
- Tailwind v4 is wired through Turbopack via `@tailwindcss/turbopack` for `*.css`.
- Design tokens in `src/app/globals.css` `@theme`: `--color-navy`, `--color-royal`, `--color-ice`, `--color-light`, `--color-ink`, `--color-slate`; fonts `--font-playfair-display` (headings) and `--font-inter` (body).
- Do not revert to the previous cream/forest palette without an explicit design update.

### Deployment

- Vercel-ready via standard Next.js deployment; no custom backend deployment configured yet.
