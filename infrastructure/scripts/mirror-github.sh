#!/bin/sh
# Last step of after-release: make github.com/ids-group/ids-design-system an exact copy of every
# branch and tag on Bitbucket. Runs after sync-dev.sh, so the mirror carries the regenerated
# design-sync tree and the back-merged dev.
#
# Clones bare instead of reusing the pipeline checkout: that one is shallow and holds one branch.
# --prune deletes on GitHub whatever was deleted here, so nothing may be committed there directly.
set -e

command -v git > /dev/null || apk add --no-cache git > /dev/null 2>&1 || true
command -v git > /dev/null || { echo "git is not available"; exit 1; }
[ -n "$RELEASE_TOKEN" ] || { echo "RELEASE_TOKEN is unset"; exit 1; }
[ -n "$GITHUB_MIRROR_TOKEN" ] || { echo "GITHUB_MIRROR_TOKEN is unset"; exit 1; }

work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

git clone --bare --quiet "https://x-token-auth:${RELEASE_TOKEN}@bitbucket.org/itband/ids-design-system.git" "$work"
git -C "$work" push --prune \
  "https://x-access-token:${GITHUB_MIRROR_TOKEN}@github.com/ids-group/ids-design-system.git" \
  '+refs/heads/*:refs/heads/*' '+refs/tags/*:refs/tags/*'
echo "GitHub mirror updated"
