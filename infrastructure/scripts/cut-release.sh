#!/bin/sh
# Cut a release: merge dev into main, bump, stamp the CHANGELOG, commit, tag, push main, then
# back-merge main into dev. It does NOT publish — the pushed vX.Y.Z tag does, via `tags: v*`.
#
# Needs RELEASE_TOKEN (repository:write). `## Unreleased` must be filled first; the preversion
# preflight fails the pipeline early otherwise.
#
# It installs because one of preflight's gates compiles the Sass to read colour roles out of the
# compiled CSS.
set -e

level="$1"
case "$level" in
  patch | minor | major | beta) ;;
  *) echo "cut-release: unknown level '$level' (expected patch|minor|major|beta)."; exit 1 ;;
esac

cd "$(dirname "$0")/../.."

[ -n "$RELEASE_TOKEN" ] || { echo "cut-release: RELEASE_TOKEN is not set."; exit 1; }

# The image ships without git.
command -v git > /dev/null || apk add --no-cache git > /dev/null

# Bitbucket checks out a detached HEAD, so the bump commit would land on no branch.
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

# This merge IS the release. --no-ff because main is normally a strict ancestor of dev, so a
# default merge would fast-forward and leave no release boundary in main's history.
git merge --no-edit --no-ff origin/dev || {
  git merge --abort 2>/dev/null || true
  echo "cut-release: merge of origin/dev into main conflicts — resolve on dev first."
  exit 1
}

. infrastructure/scripts/_setup.sh
setup_bun
install_deps

# No Claude Design build here. The release commit no longer carries a rebuilt upload tree, so the
# bundle this used to produce had no consumer: it was stamped with the OUTGOING version, and
# after-release rebuilds the bundle and the tree with a browser and commits the result to main.
# That leaves this script on one job — merge, bump, tag, push — with nothing in it that can fail
# on an install or a build a few lines before it pushes main.

# Runs preflight, then the version hook (tools/prepare-release-commit.mjs), then commit + tag.
if [ "$level" = "beta" ]; then
  npm version prerelease --preid=beta -m "release: %s"
else
  npm version "$level" -m "release: %s"
fi

new_version=$(node -p "require('./package.json').version")
echo "cut-release: tagged $new_version — pushing main + tag (the v* pipeline publishes + deploys docs)..."
git push origin main --follow-tags

# Back-sync dev so the next release does not re-emit the same notes. A conflict here is
# fix-forward on dev: the release has already published.
git checkout -B dev origin/dev
git merge --no-edit --no-ff main || {
  git merge --abort 2>/dev/null || true
  echo "cut-release: back-merge of main into dev conflicts — reconcile dev manually (the release itself succeeded)."
  exit 1
}
git push origin dev
echo "cut-release: dev synced to $new_version."
