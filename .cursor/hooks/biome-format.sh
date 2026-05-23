#!/bin/bash
# Auto-format any file that Biome owns after an agent edit.
# Fails open: if biome is not installed we don't block the edit.

input=$(cat)
file_path=$(echo "$input" | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')

if [ -z "$file_path" ]; then
  echo '{}'
  exit 0
fi

# Biome only handles these languages; skip anything else.
case "$file_path" in
  *.ts|*.tsx|*.js|*.jsx|*.mjs|*.cjs|*.json|*.jsonc|*.css)
    if command -v pnpm >/dev/null 2>&1; then
      pnpm exec biome format --write "$file_path" >/dev/null 2>&1 || true
      pnpm exec biome lint --write --unsafe "$file_path" >/dev/null 2>&1 || true
    fi
    ;;
esac

echo '{}'
exit 0
