#!/bin/sh
# Vercel "Ignored Build Step" gate. Vercel's contract: exit 1 => build,
# exit 0 => cancel the deployment.
# https://vercel.com/docs/project-configuration/project-settings#ignored-build-step
#
# WHY: docs/, .cursor/, and AGENTS.md never enter the Next.js build output, so a
# commit touching only those produces a byte-identical site. Skipping those
# deploys returns preview + production build minutes (and shortens the PR wall
# clock) without hiding anything — GitHub CI (lint/typecheck/e2e/lighthouse)
# still runs on docs pushes, and prose is what those paths carry.
#
# Diff base is VERCEL_GIT_PREVIOUS_SHA (the last SUCCESSFUL deploy for this
# branch), not HEAD^: a single push whose newest commit is docs-only but whose
# earlier commits changed code must still deploy that code. The var is empty on
# a branch's first deploy, and the SHA may be absent from Vercel's shallow
# clone — in both cases we fail open and build.

prev="${VERCEL_GIT_PREVIOUS_SHA:-}"

if [ -z "$prev" ]; then
  echo "vercel-ignore: no prior successful deploy on this branch; building."
  exit 1
fi

# `git diff --quiet` exits 0 when the scoped pathspec has no changes and 1 when
# it does — already Vercel's cancel/build contract. The :(exclude) pathspecs
# leave only site-affecting paths in scope; a non-zero from a missing $prev
# object also lands here and builds.
if git diff --quiet "$prev" HEAD -- ':(exclude)docs/**' ':(exclude).cursor/**' ':(exclude)AGENTS.md'; then
  echo "vercel-ignore: only docs/.cursor/AGENTS.md changed since $prev; skipping."
  exit 0
fi

echo "vercel-ignore: site-affecting changes since $prev; building."
exit 1
