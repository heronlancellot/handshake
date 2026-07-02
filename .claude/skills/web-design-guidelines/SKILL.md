---
name: web-design-guidelines
description: Review UI code for Web Interface Guidelines compliance. Use when asked to review UI, check accessibility, audit design, review UX, or check against best practices. Covers 100+ rules across accessibility, forms, animation, typography, performance, dark mode, i18n, and touch.
---

# Web Design Guidelines

Review files for compliance with Web Interface Guidelines. Fetches fresh guidelines from the upstream source before each review.

## When to Apply

- "Review my UI"
- "Check accessibility"
- "Audit design"
- "Review UX"
- "Check my site against best practices"
- Building new UI components
- Reviewing pull requests with UI changes

## Categories Covered

- **Accessibility** — aria-labels, semantic HTML, keyboard handlers
- **Focus States** — visible focus, focus-visible patterns
- **Forms** — autocomplete, validation, error handling
- **Animation** — prefers-reduced-motion, compositor-friendly transforms
- **Typography** — curly quotes, ellipsis, tabular-nums
- **Images** — dimensions, lazy loading, alt text
- **Performance** — virtualization, layout thrashing, preconnect
- **Navigation & State** — URL reflects state, deep-linking
- **Dark Mode & Theming** — color-scheme, theme-color meta
- **Touch & Interaction** — touch-action, tap-highlight
- **Locale & i18n** — Intl.DateTimeFormat, Intl.NumberFormat

## How It Works

1. Fetch the latest guidelines from the source URL
2. Read the specified files (or ask user for files/pattern)
3. Check against all rules from the fetched guidelines
4. Output findings in terse `file:line` format

## Usage

When reviewing files:

1. **Fetch fresh guidelines:**
```
WebFetch("https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md")
```

2. **Read the target files** provided by the user

3. **Apply all rules** from the fetched guidelines against the code

4. **Output findings** using the format specified in the guidelines

If no files specified, ask the user which files to review.

## Source

Upstream: `vercel-labs/agent-skills` — `skills/web-design-guidelines/`
Guidelines: `vercel-labs/web-interface-guidelines`
