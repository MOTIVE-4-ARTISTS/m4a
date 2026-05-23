#!/bin/sh
# Reject staged comments that narrate code instead of explaining intent.
# This is the operational enforcement of .cursor/rules/070-comments.mdc,
# referenced in AGENTS.md as a non-negotiable. The pattern intentionally
# starts conservative — false positives cost more than false negatives at
# this stage. Extend the verb/noun lists as we observe real narrating
# comments slipping through.
#
# Only scans lines being ADDED (not whole files) so it doesn't block on
# legacy comments that haven't been touched in the staged diff.

set -e

staged=$(git diff --cached --name-only --diff-filter=ACMR -- '*.ts' '*.tsx' 2>/dev/null || true)
[ -z "$staged" ] && exit 0

PATTERN='^\+[[:space:]]*//[[:space:]]*(Get|Fetch|Loop|Iterate|Increment|Decrement|Define|Declare|Initialize|Set|Return|Call|Invoke|Create|Import|Add|Remove|Update|Build|Render|Save|Store|Delete|Parse|Validate|Check|Generate|Compute|Calculate|Convert|Map|Filter|Reduce|Find|Push|Pop|Insert|Apply|Reset|Clear|Read|Write|Make|Handle|Process|Assign|Print|Log)[[:space:]]+(the|a|an|all|each|every|i|j|k|n|count|counter|index|result|results|data|response|value|values|user|users|item|items|list|array|map|set|state|props|input|output|args|params|payload|object|name|id|email|amount|file|files|row|rows|key|keys)([[:space:]]|$)'

fail=0
for file in $staged; do
  [ -f "$file" ] || continue
  hits=$(git diff --cached --unified=0 -- "$file" | grep -En "$PATTERN" || true)
  if [ -n "$hits" ]; then
    echo "[comment-quality] $file"
    echo "$hits" | sed 's/^/  /'
    fail=1
  fi
done

if [ "$fail" -ne 0 ]; then
  cat <<'EOF'

Narrating comments rejected. See .cursor/rules/070-comments.mdc.

Comments explain WHY (a Stripe quirk, an IRS rule, a chosen-vs-rejected
design path), never WHAT the next line does. Delete the comment or rewrite
it to lead with the *reason*.

To bypass for an unavoidable case, use --no-verify (and explain in the PR).
EOF
  exit 1
fi

exit 0
