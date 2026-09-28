# AGENTS.md

## Product context
- This project is a premium personal finance dashboard built with Next.js, TypeScript, Prisma, and Tailwind.
- The product should feel polished, trustable, modern, and conversion-focused.

## Frontend UI/UX rules
- Prefer premium SaaS / fintech aesthetics: soft gradients, glass surfaces, strong hierarchy, spacious layout, and subtle motion.
- Use a consistent design system across all screens: rounded cards, elevated surfaces, clear spacing, readable typography, and muted neutral backgrounds.
- Favor modern dashboard patterns: summary metrics, segmented sections, activity cards, and high-contrast CTA buttons.
- Use color intentionally: primary violet/indigo for trust and premium feel; emerald for growth/success; slate for neutral surfaces.
- Keep layouts responsive, accessible, and clean.
- Reuse existing components under `src/components` before creating new ones.
- Prefer semantic HTML, strong labels, and visible affordances for actions.
- Maintain good contrast ratios and not overcrowd the UI.
- Avoid visual clutter, neon excess, or weak hierarchy.
- Keep motion subtle and smooth, not distracting.

## Styling conventions
- Use Tailwind utility classes and existing theme variables from `src/app/globals.css`.
- Prefer consistent border radius, shadows, and spacing tokens.
- Use `glass-card`, `premium-card`, and gradient surfaces when appropriate.
- Use dark/light mode support with careful contrast.

## Quality bar
- Do not degrade accessibility.
- Do not introduce duplicate or redundant UI patterns.
- Do not use brittle inline styles for major layout decisions.
- Before claiming completion, run `npx tsc --noEmit`.

## Security rules
- Never hardcode secrets.
- Always validate API inputs with Zod or equivalent.
- Enforce session.user.id checks for protected mutations.
- Fail closed in production.
- Use secure randomness for OTPs and secrets.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
