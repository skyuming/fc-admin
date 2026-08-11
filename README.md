# fc-admin

A project-specific Claude Code skill plugin for the `future-community-manage` admin (Vue 3 + Vite + TypeScript + Pinia + Element Plus).

## What it provides

| Skill | Purpose |
|---|---|
| `fc-admin` | Entry / dispatcher — decides which sub-skill to invoke |
| `fc-admin-crud` | 9-stage guided Q&A to scaffold a complete business module (API + page + route + permissions) |
| `fc-admin-arch` | Architecture guide — answers "how do I use X" with file-anchored snippets |
| `fc-admin-review` | Code review — emits a 4-severity findings list after walking the target |

## Installation

Pick **one** of the following.

### Option 1 — Direct install (simplest)

```bash
/plugin install https://github.com/skyuming/fc-admin.git
```

Restart Claude Code after install.

### Option 2 — Local link install (for development)

```bash
git clone https://github.com/skyuming/fc-admin.git /tmp/fc-admin
ln -s /tmp/fc-admin /Users/mum/.claude/plugins/fc-admin
# restart Claude Code
```

### Option 3 — Add as a marketplace catalog (self-hosted)

The repo includes a `.claude-plugin/marketplace.json` that lists `fc-admin` itself. To register it as a marketplace:

```bash
/plugin marketplace add https://github.com/skyuming/fc-admin.git
/plugin install fc-admin
```

## Usage

After installation, just talk to Claude naturally. Examples:

- "fc-admin, 帮我加一个楼栋管理模块" → triggers `fc-admin-crud`
- "v-permission 怎么用?" → triggers `fc-admin-arch`
- "看下 src/views/community/article 怎么样" → triggers `fc-admin-review`

## Trigger phrases per skill

| Skill | Trigger phrases |
|---|---|
| `fc-admin` | fc-admin, fc 后台, 用 fc-admin, fc admin 帮我, future-community admin, vue3 element-plus admin |
| `fc-admin-crud` | 帮我加一个模块, 新建业务模块, 生成 XX 页面, 加一个 CRUD, 帮我做 XX 模块, scaffold module, generate CRUD, add business module, new module page |
| `fc-admin-arch` | 路由怎么配, v-permission 怎么用, 字典组件怎么接, adapter 怎么写, .env 变量有哪些, pinia 模块怎么写, element-plus 表格规范, how to add route in this project |
| `fc-admin-review` | review, 走查, 检查一下, 看一下有没有问题, code review, PR review, audit, 审查, 检查代码, 帮我看下 |

## Out of scope (this plugin does NOT cover)

- Backend code (.NET, API server, database).
- Business-domain knowledge of the consuming project (product features, business workflows, domain entities).
- Scaffolding scripts, code templates, codegen CLIs — CRUD is guided Q&A only.
- Marketplace packaging, settings.json hooks, automatic triggers.

## License

MIT — see [LICENSE](./LICENSE).