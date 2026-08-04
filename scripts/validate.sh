#!/usr/bin/env bash
# validate.sh — structural checks for the fc-admin plugin.
# Not loaded by Claude Code; run manually or in CI.

set -euo pipefail

PLUGIN_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PLUGIN_ROOT"

errors=0

check() {
  local desc="$1"
  shift
  if "$@"; then
    echo "✅ $desc"
  else
    echo "❌ $desc"
    errors=$((errors + 1))
  fi
}

# 1. plugin.json exists + valid JSON + required fields
check "plugin.json exists"               test -f .claude-plugin/plugin.json
check "plugin.json is valid JSON"        jq empty .claude-plugin/plugin.json
check "plugin.json has name=fc-admin"    jq -e '.name == "fc-admin"' .claude-plugin/plugin.json
check "plugin.json has version"          jq -e '.version | length > 0' .claude-plugin/plugin.json
check "plugin.json has MIT license"      jq -e '.license == "MIT"' .claude-plugin/plugin.json

# 2. Required SKILL.md files exist
for skill in fc-admin fc-admin-crud fc-admin-arch fc-admin-review; do
  check "skills/$skill/SKILL.md exists"  test -f "skills/$skill/SKILL.md"
done

# 3. Required arch references exist
for ref in routing permission api-module-pattern env-config store-pinia component-conventions; do
  check "arch reference: $ref"           test -f "skills/fc-admin-arch/references/$ref.md"
done

# 4. README + LICENSE exist
check "README.md exists"                 test -f README.md
check "LICENSE exists"                   test -f LICENSE

# 5. Frontmatter sanity — every SKILL.md starts with `---`
for f in skills/*/SKILL.md; do
  check "$f has frontmatter"             awk 'NR==1 && /^---$/ {found=1} END {exit !found}' "$f"
done

# 6. No placeholder leaks (TBD / TODO / FIXME / "implement later")
if grep -rEn "\b(TBD|FIXME|implement later)\b" skills/ README.md 2>/dev/null; then
  echo "❌ placeholder leak detected above"
  errors=$((errors + 1))
else
  echo "✅ no placeholder leaks"
fi

# 7. Each SKILL.md description has 5+ trigger phrases (comma-separated fragments)
for f in skills/*/SKILL.md; do
  phrases=$(grep -E "^description:" "$f" | grep -oE "[^,]+(,|$)" | wc -l | tr -d ' ')
  if [ "$phrases" -ge 5 ]; then
    echo "✅ $f description has $phrases trigger phrases"
  else
    echo "❌ $f description has only $phrases trigger phrases (need ≥5)"
    errors=$((errors + 1))
  fi
done

# 8. No actual dependency markers pointing to thirdnet-fullstack inside skills/README.
#    (Mentions that say "we are independent of it" are legitimate disavowals and allowed.)
if grep -rEn "(require|depends on|uses from|imports from|extends) thirdnet-fullstack" skills/ README.md 2>/dev/null; then
  echo "❌ dependency marker pointing to thirdnet-fullstack detected"
  errors=$((errors + 1))
else
  echo "✅ no dependency markers pointing to thirdnet-fullstack"
fi

echo
if [ "$errors" -eq 0 ]; then
  echo "🎉 all checks passed"
else
  echo "❌ $errors check(s) failed"
  exit 1
fi