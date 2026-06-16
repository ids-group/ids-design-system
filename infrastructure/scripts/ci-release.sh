#!/bin/sh
# One-click release from CI: bump the version, stamp the CHANGELOG, commit, tag,
# push to main, build, and publish to npm — all in one step. Triggered by the
# custom release-{patch,minor,major,beta} pipelines (Bitbucket UI -> Run pipeline).
#
# Local `npm run release:*` remains the fallback; this just runs the same flow
# server-side so no local node is needed.
#
# Secured repository variables required:
#   RELEASE_TOKEN — Bitbucket Repository Access Token (repository:write) to push
#                   the bump commit + tag back to main.
#   NPM_TOKEN     — npm granular token (read+write on @ids-group-ltd) to publish.
#
# The maintainer must fill the `## Unreleased` CHANGELOG section before running;
# preflight (the preversion hook) fails the pipeline early otherwise.
set -e

level="$1"
case "$level" in
  patch | minor | major | beta) ;;
  *) echo "ci-release: unknown level '$level' (expected patch|minor|major|beta)."; exit 1 ;;
esac

cd "$(dirname "$0")/../.."
. infrastructure/scripts/_setup.sh

[ -n "$RELEASE_TOKEN" ] || { echo "ci-release: RELEASE_TOKEN is not set."; exit 1; }
[ -n "$NPM_TOKEN" ] || { echo "ci-release: NPM_TOKEN is not set."; exit 1; }

setup_bun
install_deps

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
# hook (CHANGELOG stamp + git add) + commit + tag. `[skip ci]` keeps the auto
# `tags: v*` pipeline from double-firing on the tag we push below; if it fires
# anyway, publish.sh's double-publish guard fails it safely.
if [ "$level" = "beta" ]; then
  npm version prerelease --preid=beta -m "release: %s [skip ci]"
else
  npm version "$level" -m "release: %s [skip ci]"
fi

new_version=$(node -p "require('./package.json').version")
echo "ci-release: released $new_version — pushing main + tag..."
git push origin main --follow-tags

sh infrastructure/scripts/build-lib.sh
RELEASE_VERSION="$new_version" sh infrastructure/scripts/publish.sh
