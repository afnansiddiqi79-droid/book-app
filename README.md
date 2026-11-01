# BookNook — Frontend

The frontend for BookNook, a small online library.

## Project description

Premium online book library frontend built with Next.js App Router, React, TypeScript and Tailwind CSS.

## Technologies

- Next.js 16.4.3
- React 19.3
- TypeScript 5
- Tailwind CSS 4
- React Compiler
- Swiper (hero slider)
- Sonner (toasts)

## Installation

```bash
npm install
```

## Environment setup

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_API_URL` — backend API base URL (e.g. `http://localhost:5000`)

## Features

- Responsive landing page with autoplaying hero slider, latest books and how-it-works sections.
- Public book catalogue with search and category filtering.
- Book details page with availability and borrow modal.
- Login / register pages with validation and toast feedback.
- Add book page (authenticated), edit book page (owner only), my books page with delete confirmation.
- My borrows page with return action.
- Profile page with account activity summary.
- Custom 404 page.

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — ESLint
- `npx tsc --noEmit` — typecheck

## Deployment

Vercel-ready via standard Next.js deployment; no custom backend deployment configured yet.

## Developer information

Frontend repository: https://github.com/afnansiddiqi79-droid/book-app
