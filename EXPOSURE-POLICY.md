# Exposure Policy — what leaves this machine

> **This repo is PUBLIC.** A push is a publication. This file is the single
> authority on what may appear in committed content — files, commit messages,
> journal entries, images, everything. The `/wrap` command runs the sweep
> against this policy **before** anything is committed or pushed, every
> session, no exceptions. Three tiers; when in doubt, a thing is GRAY.

---

## 🟢 GREEN — explicitly allowed

- **First name "Dan"** and the `dig-flowspace` handle.
- **The framework itself:** Kilgore, the panel, the registry, TODO, wrap,
  this policy, and the session journals *describing the work*.
- **Build content:** designs, CAD, code, configs, measurements, BOMs,
  failure stories, photos of parts and machines on the bench.
- **Names of public things:** tools, models (Claude, Fable, etc.), upstream
  projects (EnderCNCs, the slider), sibling project *names*
  (digit-dance, hyperliminal_flow), software, vendors.
- **The Claude co-author trailer** on commits.
- **Environment-variable *names* and dummy values** (`.env.example`).

## 🔴 RED — never, no exceptions, blocks the commit

- **Secrets of any kind:** API keys, tokens, passwords, cookies, session
  IDs, private keys or certificates, `.env` contents, OAuth anything.
  A real credential that ever lands in a commit is treated as burned:
  rotate it immediately, then deal with the history.
- **Identity anchors:** full legal name, date of birth, government IDs,
  financial or account numbers, home address, phone numbers, precise
  location (coordinates, street, photos showing house numbers or street
  views).
- **Other people's personal information** — names, contact details, or
  identifying stories about family, friends, or collaborators — without
  their explicit say-so. Their privacy is not ours to spend.
- **Content from outside the repo tree:** Claude memory files, session
  transcripts, browser or system data, anything from the wider machine.
  The repo's boundary is the publication boundary.
- **Reddit account credentials or identifying account details.**

## 🟡 GRAY — human call, held out of the commit until Dan rules

- **Email addresses** — including the commit-author email (GitHub offers a
  noreply address; using it is Dan's call).
- **Absolute local paths** — they carry the machine username. Prefer
  `%APPDATA%`-style or relative forms; a raw `C:\Users\<name>\...` waits
  for Dan.
- **Photos beyond the bench:** faces, house interior or exterior,
  identifiable background.
- **Coarse location** (city/region), employer, schedule or absence
  patterns ("away next week").
- **Unpublished ideas with commercial intent**, and anything quoting
  another person's words at length.
- **Links to private or internal services** (dashboards, local IPs,
  hostnames).

---

## Sweep mechanics (what /wrap actually runs)

1. **Scope.** The session's diff (`git diff HEAD` + untracked additions),
   plus the full tracked tree after any bulk import, rename, or pasted-in
   content — arrivals are how gray things sneak past a diff-scoped check.
2. **Eyes first, then grep.** Read the diff as a human would; the greps are
   a net under the reading, not a substitute for it:
   - emails: `git grep -inE "[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}" | grep -vi noreply`
   - user paths: `git grep -in "Users.\|/home/"`
   - secrets: `git grep -inE "api[_-]?key|token|passw|BEGIN [A-Z ]*PRIVATE KEY|AKIA[0-9A-Z]{16}"`
   (Expect benign hits; the point is that a human dispositions each one.)
3. **Disposition, before commit:**
   - **RED** → fixed now. The commit does not happen until it is gone. If it
     was already pushed: credential rotated first, history scrub proposed to
     Dan second.
   - **GRAY** → named to Dan by **file and line, never by repeating the
     value into any committed file** (a finding report that quotes the email
     re-publishes it). Held out of the commit until he rules; his ruling can
     be recorded here as a new GREEN or RED line so it never has to be asked
     twice.
   - **GREEN** → proceeds.
4. **Rulings accumulate.** When Dan rules on a gray item, append it to the
   GREEN or RED list above with a date. This file is the memory; the wrap
   never re-litigates a written ruling.

## Standing rulings

- 2026-08-25 — Repo visibility PUBLIC is intentional (Dan).
- 2026-08-25 — First name "Dan" in journals: GREEN (Dan).
- 2026-08-25 — Commit-author email: **RED**. History rewritten to the GitHub
  noreply address, force-pushed; repo git config pinned to noreply; GitHub
  email-privacy setting enabled (Dan). The personal address never appears in
  this repo again.
- 2026-08-25 — Machine username in paths: **RED** in committed content.
  Historical blobs scrubbed to `%APPDATA%` form in the same rewrite. Use
  environment-variable or relative forms always.
