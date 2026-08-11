# Changelog

## 0.2.0 — 2026-08-04

### Added — `fc-admin-init` sub-skill + bundled starter template

- **New sub-skill `fc-admin-init`**: 7-stage guided Q&A that scaffolds a new Vue 3 admin project from an empty directory. Stages: target dir → project name → display title → dev port → mock mode → optional initial business modules → confirm + execute.
- **Bundled starter template** at `templates/starter/` (~400 files): core admin infrastructure (auth + layout + route guards + Pinia stores + directives + mock data + ESLint/Prettier/Stylelint/Commitlint config) distilled from `future-community-manage`, excluding business-specific modules.
- **Templates/starter/README.md**: project-specific README with quick-start, what's included, what's not.

### Changed — dispatch table + entry skill

- `fc-admin/SKILL.md`: dispatch table now lists 4 sub-skills (`init` added before `crud`); trigger phrases updated; out-of-scope list refined.
- `README.md`: added `fc-admin-init` to the skills table; trigger phrases updated; added "What's bundled" section.

### Verified

- **Init smoke test**: ran the 7-stage flow against `/tmp/fc-admin-smoke-test` — 400 files landed, all 4 placeholders (`{{PROJECT_NAME}}`, `{{PROJECT_TITLE}}`, `{{DEV_PORT}}`, `{{GENERATED_AT}}`) replaced, `package.json` / `index.html` / `.env.development` customized correctly, git init + initial commit succeeded.
- `scripts/validate.sh`: passes 7 categories, 5 SKILL files (added `fc-admin-init` description with 17 trigger phrases).

## 0.1.0 — 2026-08-04

### Added

- Plugin manifest `.claude-plugin/plugin.json` (name: `fc-admin`, MIT, author: thirdnet).
- Skills:
  - `fc-admin` (entry / dispatcher) — routes to the right sub-skill.
  - `fc-admin-crud` — 9-stage guided Q&A to scaffold a complete business module.
  - `fc-admin-arch` — architecture guide with 6 on-demand references.
  - `fc-admin-review` — code review that emits a 4-severity findings list.
- Architecture references (loaded on demand by `fc-admin-arch`):
  - `routing.md` — `specialRoutes.{disabled,enabled}.ts` + `viewModules.*.ts` clarification.
  - `permission.md` — `v-has-perm` directive (NOT `v-permission`).
  - `api-module-pattern.md` — `src/api/{module}/{index,types}.ts` convention.
  - `env-config.md`, `store-pinia.md`, `component-conventions.md`.
- `scripts/validate.sh` — 7 structural checks (manifest JSON, file existence, frontmatter, trigger phrases, no placeholder leaks).
- `README.md` — install instructions + trigger phrase index + explicit out-of-scope list.
- `LICENSE` (MIT).

### Aligned with project reality (after first smoke test)

During smoke testing against `future-community-manage`, the plugin's documentation was updated to match the actual project structure:

- Routes live in `src/router/specialRoutes.{disabled,enabled}.ts` — NOT per-module `src/router/modules/{module}.ts`.
- `src/store/modules/viewModules.*.ts` controls `import.meta.glob` exclusions, NOT navigation.
- Permission directive is `v-has-perm` — NOT `v-permission`.
- API modules use a 2-file split (`index.ts` + `types.ts`) — NOT mock/real/adapter per module.
- All HTTP goes through the global `request` helper.

### Verified

- **CRUD smoke test** (`notice` module end-to-end):
  - `src/api/notice/types.ts` + `src/api/notice/index.ts` — types and functions per `api-module-pattern.md`.
  - `src/views/notice/index.vue` + `src/views/notice/components/NoticeForm.vue` — table + drawer + form using `v-has-perm`.
  - `src/router/specialRoutes.disabled.ts` — route entry added.
  - ESLint passes on all emitted files (exit 0).
  - vue-tsc reports 0 new errors in emitted files (3 pre-existing errors in unrelated `src/views/futureGovernance/notice/` are not from this work).
- **Review smoke test** (`src/views/login/index.vue`): emitted 4-severity findings list with file:line references — output format matches SKILL spec.
- **Structural validation**: `./scripts/validate.sh` passes all 7 check categories (29 individual assertions).