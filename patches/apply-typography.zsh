#!/usr/bin/env zsh
# apply-typography.zsh — Apply the typography migration patches
#
# Usage:
#   cd your-repo
#   ./apply-typography.zsh [--dry-run]

set -euo pipefail

SCRIPT_DIR="${0:A:h}"
TYPO_CSS="$SCRIPT_DIR/typography.css"
PATCHES=("$SCRIPT_DIR"/000[2-9]*.patch)

if [[ ! -f "$TYPO_CSS" ]]; then
  echo "❌ typography.css not found in $SCRIPT_DIR"
  exit 1
fi

if [[ ${#PATCHES[@]} -eq 0 ]]; then
  echo "❌ No patch files (0002-0009) found in $SCRIPT_DIR"
  exit 1
fi

echo "🔤 Typography Migration — 1 infra step + ${#PATCHES[@]} patches"
echo ""

# Preflight
if ! git rev-parse --is-inside-work-tree &>/dev/null; then
  echo "❌ Not inside a git repo. cd into your project first."
  exit 1
fi

if [[ -n "$(git diff --stat HEAD)" ]]; then
  echo "⚠️  Working tree has uncommitted changes. Commit or stash first."
  exit 1
fi

GLOBAL_CSS="src/styles/global.css"
TYPO_DEST="src/styles/typography.css"

# Dry run mode
if [[ "${1:-}" == "--dry-run" ]]; then
  echo "🧪 Dry run — checking if everything applies cleanly...\n"

  # Check infra step
  if [[ ! -f "$GLOBAL_CSS" ]]; then
    echo "  ❌ Step 1 (typography infra) — $GLOBAL_CSS not found"
  else
    echo "  ✅ Step 1 (typography infra) — will copy typography.css + wire import"
  fi

  # Check patches
  for p in "${PATCHES[@]}"; do
    name="${p:t}"
    if git apply --check "$p" 2>/dev/null; then
      echo "  ✅ $name"
    else
      echo "  ❌ $name — will not apply cleanly"
    fi
  done
  echo "\nRun without --dry-run to apply."
  exit 0
fi

# ── Step 1: Typography infrastructure ──
echo "Applying to branch: $(git branch --show-current)\n"
echo "  Step 1: typography infrastructure..."

# Copy the complete typography.css
cp "$TYPO_CSS" "$TYPO_DEST"

# Add the import to global.css if not already present
if ! grep -qF "@import './typography.css'" "$GLOBAL_CSS"; then
  # Insert after the tailwindcss import (macOS + Linux compatible)
  if [[ "$(uname)" == "Darwin" ]]; then
    sed -i '' '/^@import "tailwindcss";/a\
@import '\''./typography.css'\'';
' "$GLOBAL_CSS"
  else
    sed -i '/^@import "tailwindcss";/a @import '\''./typography.css'\'';' "$GLOBAL_CSS"
  fi
fi

git add "$TYPO_DEST" "$GLOBAL_CSS"
git commit -m "feat(typography): add typography.css token system and wire into global.css

11 semantic tokens replacing ~243 scattered inline declarations:
  type-heading, type-metric, type-gene, type-body, type-title,
  type-sm, type-label, type-mono, type-badge, type-caption, type-select

Eliminates font-medium (500) — collapsed to 400 or 600.
Consolidates 14 font sizes to 7.
All tokens in @layer base so Tailwind utilities can override." --quiet

echo "  ✅ typography.css + global.css import"

# ── Step 2: Apply component migration patches ──
for p in "${PATCHES[@]}"; do
  name="${p:t}"
  if git am --keep-cr "$p" 2>/dev/null; then
    echo "  ✅ $name"
  else
    echo "\n❌ Failed on $name"
    echo "   Fix conflicts, then: git am --continue"
    echo "   Or abort everything:  git am --abort"
    exit 1
  fi
done

TOTAL=$((${#PATCHES[@]} + 1))
echo "\n✅ All $TOTAL steps applied."
echo ""
git log --oneline -$TOTAL
