# CLAUDE.md

## Table of Contents

- [Rules](#rules)
- [Context](#context)

## Rules

- Payload CMS is v3 (3.90.1). Never use Payload v2 APIs, config shapes, or docs.
- Postgres adapter runs with `push: false`. Every schema change needs a migration in `src/migrations/`.
- Medical articles must not be publishable without clinical-reviewer approval (see 01-BUILD-PLAN.md section 4).
- Never send identifying data (name, phone, email) to Gemini or into logs, emails, or analytics.
- Secrets only in `.env` (gitignored) and Vercel env vars.
- Ask the user before making architecture or scope decisions not covered by 01-BUILD-PLAN.md.
- No emojis, no typographic Unicode dashes/arrows/ellipsis in code, docs, or commit messages.

## Context

Content sources, spec, and build plan live outside this repo in `C:\Users\Administrator\OneDrive - tma.com.vn\Documents\SC\VMC\Webcontent from claude` (README.md, 00-SPEC.md, 01-BUILD-PLAN.md).
