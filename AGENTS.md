<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from the diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project: book-app

Fresh Create Next App scaffold. Single package (no monorepo), no tests, no CI.

### Commands (verified)

- `npm run dev` — dev server at http://localhost:3000
- `npm run build` / `npm run start` — production build / serve
- `npm run lint` — runs bare `eslint` (flat config via `eslint.config.mjs`); passes clean on a fresh scaffold
- Typecheck (no script exists): `npx tsc --noEmit` — passes clean

There is no `test`, `typecheck`, `format`, or `check` script; run `npx tsc --noEmit` for type checking and nothing else covers tests.

### Structure

- App Router source lives in `src/app/`: root layout `src/app/layout.tsx`, home page `src/app/page.tsx`, global styles `src/app/globals.css` (`@import "tailwindcss"`, Tailwind v4).
- Path alias: `@/*` -> `./src/*` (tsconfig `paths`).
- Static assets in `public/`.
- No API routes, components, or lib code beyond the scaffold yet.

### Toolchain quirks

- `next.config.ts` sets `reactCompiler: true` (React Compiler auto-memoizes components) and wires Tailwind v4 through Turbopack via `@tailwindcss/turbopack` for `*.css`.
- No env files are committed; `.env*` is gitignored.

## Design system (current)

- Visual identity: blue + modern premium. Deep Navy `#101D3A`, Royal Blue `#2563EB`, Ice Blue `#EAF2FF`, White `#FFFFFF`, Light Background `#F7F9FE`, Main Text `#172033`, Secondary Text `#64748B`.
- Tailwind v4 tokens live in `src/app/globals.css` via `@theme` (`--color-navy`, `--color-royal`, `--color-ice`, `--color-light`, `--color-ink`, `--color-slate`); utilities like `bg-navy`, `text-royal`, `bg-ice` are available.
- Fonts: Playfair Display (headings) + Inter (body) via `next/font/google` (`--font-playfair-display`, `--font-inter`).
- Do not revert to the previous cream/forest palette without an explicit design update.
