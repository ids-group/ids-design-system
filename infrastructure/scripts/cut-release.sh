#!/bin/sh
# Cut a release from CI: bump the version, stamp the CHANGELOG, commit, tag, and
# push to main. It does NOT publish — pushing the vX.Y.Z tag triggers the
# `tags: v*` pipeline, which is the single publisher (build-lib.sh + publish.sh).
# Triggered by the custom release-{patch,minor,major,beta} pipelines
# (Bitbucket UI -> Run pipeline).
#
# Local `npm run release:*` is the equivalent fallback: same bump+tag, then the
# same v* pipeline publishes the pushed tag.
#
# Secured repository variable required:
#   RELEASE_TOKEN — Bitbucket Repository Access Token (repository:write) to push
#                   the bump commit + tag back to main.
#
# Fill the `## Unreleased` CHANGELOG section before running; preflight (the
# preversion hook) fails the pipeline early otherwise.
#
# No bun install or build here: `npm version` and its node-only hooks (preflight,
# changelog stamp) need just git + node, both already in the image (+ apk git).
set -e

level="$1"
case "$level" in
  patch | minor | major | beta) ;;
  *) echo "cut-release: unknown level '$level' (expected patch|minor|major|beta)."; exit 1 ;;
esac

cd "$(dirname "$0")/../.."

[ -n "$RELEASE_TOKEN" ] || { echo "cut-release: RELEASE_TOKEN is not set."; exit 1; }

# The node:22-alpine image ships without git; this script (and the preversion
# preflight) need it to commit, tag, and push.
command -v git > /dev/null || apk add --no-cache git > /dev/null

# Bitbucket checks out a detached HEAD at the triggering commit; move onto main so
# the bump commit and tag land on the branch and can be pushed.
git config user.name "${RELEASE_GIT_NAME:-IDS Release Bot}"
git config user.email "${RELEASE_GIT_EMAIL:-ci@ids-group.co.uk}"
git remote set-url origin "https://x-token-auth:${RELEASE_TOKEN}@bitbucket.org/itband/ids-design-system.git"
git fetch origin main --quiet
git checkout -B main origin/main

# Bump: runs the preversion preflight (branch/clean/sync/changelog) + the version
# hook (CHANGELOG stamp + git add) + commit + tag.
if [ "$level" = "beta" ]; then
  npm version prerelease --preid=beta -m "release: %s"
else
  npm version "$level" -m "release: %s"
fi

new_version=$(node -p "require('./package.json').version")
echo "cut-release: tagged $new_version — pushing main + tag (the v* pipeline publishes)..."
git push origin main --follow-tags
