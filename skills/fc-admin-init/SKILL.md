---
name: fc-admin-init
description: Use when the user wants to create a NEW Vue 3 admin project from scratch, in an empty directory, using the fc-admin starter template. Scaffolds a complete admin skeleton (auth, layout, route guards, core admin pages) ready to run with pnpm install && pnpm dev. Triggers: 帮我建一个新项目, 新建 admin 项目, 初始化项目, scaffold new admin, create new project from empty dir, init vue3 admin, bootstrap admin, 新建后台, fc-admin 新建项目, fc-admin init, fc-admin 新建, 用 fc-admin 建项目.
---

# fc-admin-init — Project Scaffolding

When the user wants to **create a new Vue 3 admin project from an empty directory**, this skill walks them through questions, then copies the bundled starter template into the target directory, customizes project-name strings, and prints next-steps.

The bundled template lives at `templates/starter/` in this plugin's repo and contains ~400 files of working admin infrastructure: auth, layout, route guards, Pinia stores, 6 core admin pages (user/role/menu/dept/dict/region/template), directives, mock data, full ESLint/Prettier/Stylelint/Commitlint config.

**Prerequisite**: the target directory exists and is **empty** (or the user explicitly confirms overwriting).

## The 7 stages

Run these one at a time. **Stop and wait for user confirmation** between each stage. Never bundle two stages into one response.

### Stage 1 — Target directory

Ask:

- Path of the empty target directory. Verify with `ls -la <path>` that it is empty (or only contains `.git`, `.gitignore`, hidden OS files).

If the directory does not exist, ask: create it? If yes, run `mkdir -p <path>`.

If the directory is not empty, **STOP** and ask the user to confirm overwriting or pick a different path.

### Stage 2 — Project name

Ask:

- `PROJECT_NAME` (npm-safe, kebab-case or lowercase, e.g. `my-admin`, `parking-system`).
  - Validation: only `[a-z0-9-_]`, must start with a letter, ≤ 64 chars.
  - This becomes `package.json` "name" field.

### Stage 3 — Display title

Ask:

- `PROJECT_TITLE` (human-readable, shown in browser tab and sidebar logo).
  - Default suggestion: capitalize PROJECT_NAME (e.g. `my-admin` → `My Admin`).

### Stage 4 — Dev port

Ask:

- `DEV_PORT` (default `3000`).
- This becomes `VITE_APP_PORT` in `.env.development` and `.env.staging`.

### Stage 5 — Mock mode

Ask:

- Enable mock data on first run? (`VITE_USE_MOCK` = `'true'` by default).
  - If yes: leave `src/mock/data/` seed data in place.
  - If no: keep `VITE_USE_MOCK = 'false'` in `.env.development`.

Note: this starter's mock data is minimal (just enough for auth + user page to render). Real backend endpoints will need their own data.

### Stage 6 — Initial business modules (optional)

Ask:

- Do you want to add any business modules NOW (via `fc-admin-crud`), or just get the skeleton running first?
- If yes: collect a list of module names and call `fc-admin-crud` once per module after the project is scaffolded.
- If no: skip — user can run `fc-admin-crud` later on the scaffolded project.

### Stage 7 — Confirm and execute

Show a summary:

```
fc-admin-init: about to scaffold
  Target dir:   /abs/path/to/target
  Project name: my-admin
  Display title: My Admin
  Dev port:     3000
  Mock mode:    on
  Modules:      none (use fc-admin-crud later)
  Estimated:    ~400 files
Confirm? (y/n)
```

On `y`, execute these steps **in order**:

1. **Copy the template**:

   ```bash
   SRC="<path-to-this-plugin>/templates/starter"
   DST="/abs/path/to/target"

   # Copy entire template into target
   cp -R "$SRC/." "$DST/"
   ```

   (Using `cp -R SRC/. DST/` ensures hidden files like `.env.*`, `.eslintrc.cjs`, etc. are copied.)

2. **Replace placeholders** with sed-style replacements (or Edit tool) on every file in `$DST`:

   - `{{PROJECT_NAME}}` → user-chosen PROJECT_NAME
   - `{{PROJECT_TITLE}}` → user-chosen PROJECT_TITLE
   - `{{DEV_PORT}}` → user-chosen DEV_PORT
   - `{{GENERATED_AT}}` → current ISO timestamp

   Files that contain placeholders (after Stage 2):
   - `package.json`
   - `index.html`
   - `.env.development`, `.env.staging`, `.env.production`
   - `README.md`

3. **Initialize git** (if not already):

   ```bash
   cd "$DST"
   git init
   git add .
   git commit -m "chore: scaffold project via fc-admin-init"
   ```

4. **Print next steps** (do NOT run `pnpm install` automatically — let the user decide):

```
fc-admin-init: ✅ scaffolded project at /abs/path/to/target

Next steps:
  cd /abs/path/to/target
  pnpm install               # install deps (~3 minutes)
  pnpm dev                   # start dev server at http://localhost:3000

Then add your first business module:
  fc-admin, 帮我加一个 XX 模块
```

## Completion checklist (must pass before claiming done)

- [ ] Target directory exists and was empty (or user explicitly confirmed overwrite)
- [ ] All ~400 template files copied (verify: `find <target> -type f | wc -l` ≈ 400)
- [ ] No `{{...}}` placeholders remain in target (verify: `grep -r "{{" <target>` returns nothing)
- [ ] `package.json` has the user's PROJECT_NAME (not "vue3-element-admin")
- [ ] `index.html` <title> has the user's PROJECT_TITLE
- [ ] `.env.development` has `VITE_APP_TITLE = '<user's PROJECT_TITLE>'`
- [ ] `.env.development` has `VITE_APP_PORT = <user's DEV_PORT>`
- [ ] Git initialized with an initial commit
- [ ] User has been told the exact `cd` + `pnpm install` + `pnpm dev` commands

## Counter-examples (DO NOT)

- ❌ Writing `pnpm install` and running it for the user — installation can take minutes and surface network/auth issues the user should see.
- ❌ Modifying `templates/starter/` files in-place to add user data — templates are read-only references; always copy first then customize the copy.
- ❌ Forgetting to copy hidden files (`.env.*`, `.eslintrc.cjs`, `.gitignore`) — using `cp SRC/. DST/` not `cp SRC/* DST/`.
- ❌ Asking fewer than 7 stages — even if the user says "just use defaults", confirm the defaults explicitly.
- ❌ Skipping git init — user will forget, then wonder why there's no version control on their new project.

## What this skill does NOT do

- Run `pnpm install` (user does this themselves).
- Push to GitHub (user does this themselves — recommend they create an empty repo first).
- Generate business modules (use `fc-admin-crud`).
- Modify files inside `templates/starter/` of the plugin (templates are immutable references).
