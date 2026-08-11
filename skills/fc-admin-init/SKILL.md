---
name: fc-admin-init
description: Use when the user wants to create a NEW Vue 3 admin project from scratch, in an empty directory, using the fc-admin starter template. Scaffolds a complete admin skeleton (auth, layout, route guards, core admin pages) ready to run with pnpm install && pnpm dev. Triggers: 帮我建一个新项目, 新建 admin 项目, 初始化项目, scaffold new admin, create new project from empty dir, init vue3 admin, bootstrap admin, 新建后台, fc-admin 新建项目, fc-admin init, fc-admin 新建, 用 fc-admin 建项目.
---

# fc-admin-init — Project Scaffolding

When the user wants to **create a new Vue 3 admin project from an empty directory**, this skill walks them through **7 click-to-select questions**, then copies the bundled starter template into the target directory, customizes project-name strings, and prints next-steps.

The bundled template lives at `templates/starter/` in this plugin's repo and contains ~377 files of working admin infrastructure: auth, layout, route guards, Pinia stores, 6 core admin pages (user/role/menu/dept/dict/region/template), directives, mock data, full ESLint/Prettier/Stylelint/Commitlint config.

**Prerequisite**: the target directory exists and is **empty** (or the user explicitly confirms overwriting).

## How to interact

Use the `AskUserQuestion` tool for **every** question below. Each stage must present 2–4 clickable options + the auto-added "Other" option (which lets the user type a freeform value).

After every `AskUserQuestion` call, **stop and wait** for the user's selection. Never bundle two stages into one response. Never call `AskUserQuestion` more than once per turn.

## The 7 stages

### Stage 1 — Where to create the project

Call `AskUserQuestion` with:

- header: `"目标路径"` (≤ 12 chars)
- question: `"项目要创建在哪个目录?"`
- options:
  1. `{ label: "~/projects/<name>", description: "推荐: 用户主目录下 projects/<项目名>" }`
  2. `{ label: "./<name>(当前目录子文件夹)", description: "在你当前所在目录的子文件夹里创建" }`
  3. `{ label: "在当前目录直接创建", description: "用当前所在目录作为项目根,要求目录为空" }`

After the user picks, **verify with `ls -la <path>`**:

- If the directory exists and is **empty** (only `.git`, `.gitignore`, hidden OS files) → proceed to Stage 2.
- If the directory exists and is **not empty** → ask again with one extra option: `{ label: "清空后再用这个目录", description: "rm -rf <path>/* 后再用(危险操作)" }` and `Other`. **Only proceed after explicit confirmation.**
- If the directory does not exist → ask: `{ label: "自动创建该目录", description: "mkdir -p 后再继续" }`. On yes, run `mkdir -p <path>`.

Capture this as `TARGET_DIR`.

### Stage 2 — Project name

Call `AskUserQuestion` with:

- header: `"项目名"` (≤ 12 chars)
- question: `"项目名(会作为 package.json name)?"`
- options:
  1. `{ label: "my-admin", description: "默认: 通用管理后台名" }`
  2. `{ label: "admin-console", description: "适合运营 / 后台控制台类项目" }`
  3. `{ label: "dashboard", description: "适合数据大屏 / 看板类项目" }`

Validation rule (informational only — the "Other" option lets the user bypass): npm-safe, kebab-case or lowercase, only `[a-z0-9-_]`, must start with a letter, ≤ 64 chars.

Capture this as `PROJECT_NAME`.

### Stage 3 — Display title

Call `AskUserQuestion` with:

- header: `"显示名"` (≤ 12 chars)
- question: `"浏览器标签 / 侧边栏 LOGO 显示的标题?"`
- options:
  1. `{ label: "My Admin", description: "默认: 项目名首字母大写" }`
  2. `{ label: "管理后台", description: "中文通用" }`
  3. `{ label: "运营平台", description: "适合运营类项目" }`

If user picks the auto-derived default, derive it from PROJECT_NAME (`my-admin` → `My Admin`, `dashboard` → `Dashboard`).

Capture this as `PROJECT_TITLE`.

### Stage 4 — Dev server port

Call `AskUserQuestion` with:

- header: `"端口"` (≤ 12 chars)
- question: `"Vite dev server 用哪个端口?"`
- options:
  1. `{ label: "3000", description: "默认, Vite 标准端口" }`
  2. `{ label: "8080", description: "常用后端 / nginx 习惯端口" }`
  3. `{ label: "5173", description: "Vite 旧版默认端口" }`

Capture this as `DEV_PORT`.

### Stage 5 — Mock data mode

Call `AskUserQuestion` with:

- header: `"Mock 数据"` (≤ 12 chars)
- question: `"首次运行要启用 Mock 数据吗?(VITE_USE_MOCK)"`
- options:
  1. `{ label: "启用 Mock", description: "推荐: src/mock/data/ 里有登录 / 用户页种子数据,能直接 pnpm dev 看效果" }`
  2. `{ label: "禁用 Mock", description: "VITE_USE_MOCK=false,需要后端真实 API" }`

If user picks "启用 Mock", leave `.env.development` `VITE_USE_MOCK` as `'true'`. Otherwise change to `'false'`.

### Stage 6 — Add first business module now?

Call `AskUserQuestion` with:

- header: `"首个模块"` (≤ 12 chars)
- question: `"要不要在脚手架完成后立即加一个业务模块?"`
- options:
  1. `{ label: "暂不加", description: "推荐: 先把骨架跑起来,后续用 fc-admin-crud 单独加" }`
  2. `{ label: "加一个示例模块", description: "调用 fc-admin-crud 走 9 阶段问答,生成一个 notice(公告管理)模块作为模板" }`

If user picks "加一个示例模块", after Stage 7 executes the scaffold, **invoke `fc-admin-crud`** to add a `notice` module.

### Stage 7 — Confirm and execute

Show a final summary as plain text (no AskUserQuestion here):

```
fc-admin-init: about to scaffold
  Target dir:    <TARGET_DIR>
  Project name:  <PROJECT_NAME>
  Display title: <PROJECT_TITLE>
  Dev port:      <DEV_PORT>
  Mock mode:     on / off
  First module:  none / notice (via fc-admin-crud)
  Estimated:     ~377 files
```

Then call `AskUserQuestion` with:

- header: `"确认"` (≤ 12 chars)
- question: `"以上信息确认无误吗?"`
- options:
  1. `{ label: "确认,开始生成", description: "执行 cp + 占位符替换 + git init" }`
  2. `{ label: "我想修改几项", description: "回到 Stage 2 重做(项目名之后的)" }`

On "确认,开始生成", execute these steps **in order**:

1. **Copy the template**:

   ```bash
   SRC="<absolute path to this plugin>/templates/starter"
   DST="<TARGET_DIR>"

   # Copy entire template into target (note the trailing /. to include hidden files)
   cp -R "$SRC/." "$DST/"
   ```

2. **Replace placeholders** on every file in `$DST` via `Edit` tool or sed:

   - `{{PROJECT_NAME}}` → user's PROJECT_NAME
   - `{{PROJECT_TITLE}}` → user's PROJECT_TITLE
   - `{{DEV_PORT}}` → user's DEV_PORT (no quotes)
   - `{{GENERATED_AT}}` → current ISO timestamp

   Files that contain placeholders:
   - `package.json`
   - `index.html`
   - `.env.development`, `.env.staging`, `.env.production`
   - `README.md`

3. **If user picked "禁用 Mock"** in Stage 5: change `.env.development` line `VITE_USE_MOCK = 'true'` to `VITE_USE_MOCK = 'false'`.

4. **Initialize git** (only if not already a git repo):

   ```bash
   cd "$DST"
   [ -d .git ] || git init
   git add .
   git commit -m "chore: scaffold project via fc-admin-init"
   ```

5. **If user picked "加一个示例模块"** in Stage 6: invoke the `fc-admin-crud` skill to add a `notice` module to `$DST`.

6. **Print final next-steps** (do NOT run `pnpm install` automatically):

```
fc-admin-init: ✅ scaffolded project at <TARGET_DIR>

Next steps:
  cd <TARGET_DIR>
  pnpm install                 # ~3 minutes
  pnpm dev                     # http://localhost:<DEV_PORT>
```

## Completion checklist (must pass before claiming done)

- [ ] All 7 stages presented as `AskUserQuestion` calls (except Stage 7 confirm summary text)
- [ ] User selected each option via click (not free-typed) — unless they used "Other"
- [ ] TARGET_DIR exists and was empty (or user explicitly confirmed overwrite / clean)
- [ ] All ~377 template files copied (`find <target> -type f | wc -l` ≈ 377)
- [ ] No `{{...}}` placeholders remain in target (`grep -r "{{" <target>` returns nothing)
- [ ] `package.json` has the user's PROJECT_NAME (not "vue3-element-admin")
- [ ] `index.html` <title> has the user's PROJECT_TITLE
- [ ] `.env.development` has `VITE_APP_TITLE = '<user's PROJECT_TITLE>'`
- [ ] `.env.development` has `VITE_APP_PORT = <DEV_PORT>`
- [ ] If user picked "禁用 Mock": `.env.development` has `VITE_USE_MOCK = 'false'`
- [ ] If user picked "加一个示例模块": `notice` module exists under `src/`
- [ ] Git initialized with initial commit (or already a repo)
- [ ] User has been told the exact `cd` + `pnpm install` + `pnpm dev` commands

## Counter-examples (DO NOT)

- ❌ Asking "please type the project name" — always use `AskUserQuestion` with 2–4 options + auto-added "Other".
- ❌ Calling `AskUserQuestion` more than once per turn — that's one question per response, always.
- ❌ Calling `AskUserQuestion` with more than 4 options — Claude Code limits to 4 plus auto-Other.
- ❌ Bundling two stages into one AskUserQuestion call (e.g., asking project name + port in one go).
- ❌ Running `pnpm install` for the user — installation can take minutes and surface network/auth issues the user should see.
- ❌ Modifying `templates/starter/` files in-place — templates are read-only references; always copy first then customize the copy.
- ❌ Forgetting to copy hidden files (`.env.*`, `.eslintrc.cjs`, `.gitignore`) — use `cp SRC/. DST/` not `cp SRC/* DST/`.
- ❌ Skipping git init — user will forget, then wonder why there's no version control.
- ❌ Asking fewer than 7 stages — even if the user says "just use defaults", still present all 7 (with defaults selected).

## What this skill does NOT do

- Run `pnpm install` (user does this themselves).
- Push to GitHub (user does this themselves — recommend they create an empty repo first).
- Generate business modules other than the optional `notice` example (use `fc-admin-crud` for others).
- Modify files inside `templates/starter/` of the plugin (templates are immutable references).
