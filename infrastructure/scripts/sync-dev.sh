#!/bin/sh
# Step of after-release: carry main into dev, once, after every step that writes to main.
#
# A separate step rather than a tail inside build-design-sync.sh, so a merge conflict is its own
# red step instead of a failure buried in a build log.
#
# cut-release.sh back-syncs dev too, and that one stays: it carries the version bump the moment the
# release is cut, and a beta prerelease never reaches after-release at all.
set -e

cd "$(dirname "$0")/../.."

command -v git > /dev/null || apk add --no-cache git > /dev/null 2>&1 || true
command -v git > /dev/null || { echo "git is not available"; exit 1; }
[ -n "$RELEASE_TOKEN" ] || { echo "RELEASE_TOKEN is unset"; exit 1; }

git config user.name "${RELEASE_GIT_NAME:-IDS Release Bot}"
git config user.email "${RELEASE_GIT_EMAIL:-ci@ids-group.co.uk}"
git remote set-url origin "https://x-token-auth:${RELEASE_TOKEN}@bitbucket.org/itband/ids-design-system.git"
git remote set-branches origin main dev
if [ -f "$(git rev-parse --git-dir)/shallow" ]; then
  git fetch --unshallow origin --quiet
else
  git fetch origin --quiet
fi

if git merge-base --is-ancestor origin/main origin/dev; then
  echo "dev already contains main"
  exit 0
fi

git checkout -B dev origin/dev --quiet
git merge --no-edit --no-ff origin/main || {
  git merge --abort 2>/dev/null || true
  echo "main does not merge cleanly into dev. The docs are deployed and main is correct;"
  echo "merge main into dev by hand."
  exit 1
}
git push origin dev
echo "dev synced with main"
