#!/bin/sh
# Cut a release from CI: merge dev into main (main is release-only), bump the
# version, stamp the CHANGELOG, commit, tag, push main, then back-merge main into
# dev so it carries the bump. It does NOT publish — pushing the vX.Y.Z tag triggers
# the `tags: v*` pipeline, which publishes and then deploys the docs.
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

# Bitbucket clones ONE branch, shallow: `--branch dev --depth 50`. So remote.origin.fetch
# maps dev only — naming a branch on the fetch command line writes FETCH_HEAD but creates
# no refs/remotes/origin/main (hence "fatal: 'origin/main' is not a commit") — and dev's
# truncated history need not even reach the last tag, leaving the dev->main merge with no
# merge base. Widen the refspec to both release branches, then deepen to full history.
git remote set-branches origin main dev
if [ -f "$(git rev-parse --git-dir)/shallow" ]; then
  git fetch --unshallow origin --quiet
else
  git fetch origin --quiet
fi
git checkout -B main origin/main

# Fold dev's work (incl. the ## Unreleased notes + migrations/unreleased.json) into
# main before bumping — this merge IS the release. --no-ff because main is normally a
# strict ancestor of dev, so a default merge would fast-forward and leave no release
# boundary in main's history. A conflict means dev must be reconciled first, so fail
# rather than guess.
git merge --no-edit --no-ff origin/dev || {
  git merge --abort 2>/dev/null || true
  echo "cut-release: merge of origin/dev into main conflicts — resolve on dev first."
  exit 1
}

# Bump: runs the preversion preflight (branch/clean/ancestor/changelog) + the
# version hook (CHANGELOG stamp + migration promote + git add) + commit + tag.
if [ "$level" = "beta" ]; then
  npm version prerelease --preid=beta -m "release: %s"
else
  npm version "$level" -m "release: %s"
fi

new_version=$(node -p "require('./package.json').version")
echo "cut-release: tagged $new_version — pushing main + tag (the v* pipeline publishes + deploys docs)..."
git push origin main --follow-tags

# Back-sync dev with the bump commit (new version, emptied ## Unreleased, promoted
# migration) so the next release doesn't re-emit the same notes. The release already
# published; a conflict here is fix-forward on dev, not a rollback.
git checkout -B dev origin/dev
git merge --no-edit --no-ff main || {
  git merge --abort 2>/dev/null || true
  echo "cut-release: back-merge of main into dev conflicts — reconcile dev manually (the release itself succeeded)."
  exit 1
}
git push origin dev
echo "cut-release: dev synced to $new_version."
