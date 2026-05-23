#!/bin/sh
# Conventional Commits enforcement. Migrated verbatim from .husky/commit-msg
# during the Lefthook switchover; same allowed-type list. The point of
# enforcement is not bureaucracy — it's that future release automation
# (changesets, release-please) and `git log --grep` filters can rely on
# every commit having a parseable shape.

set -e

commit_msg_file="$1"
first_line=$(head -n1 "$commit_msg_file")

# Pass through merge / fixup / squash / revert commits unchanged — git
# generates these and the human will rewrite them on rebase.
case "$first_line" in
  "Merge "* | "fixup!"* | "squash!"* | "Revert "*) exit 0 ;;
esac

if ! echo "$first_line" | grep -Eq '^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9_/.-]+\))?!?: .+'; then
  cat <<EOF
Commit message does not follow Conventional Commits.

Format: <type>(<optional-scope>): <subject>
Allowed types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert

Example: feat(donations): add stripe webhook handler
Got:     $first_line
EOF
  exit 1
fi
