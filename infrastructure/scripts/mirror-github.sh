#!/bin/sh
# The mirror-github pipeline: make github.com/ids-group/ids-design-system an exact copy of every
# branch and tag on Bitbucket, unless gitleaks finds a secret anywhere in their history. Started
# by the last step of after-release, so the mirror carries the regenerated design-sync tree and
# the back-merged dev. Runs in the gitleaks image, which brings git.
#
# Clones bare instead of reusing the pipeline checkout: that one is shallow and holds one branch.
# The scan and the push read the same clone, so a commit landing in between cannot skip the gate.
# --prune deletes on GitHub whatever was deleted here, so nothing may be committed there directly.
set -e

cd "$(dirname "$0")/../.."

[ -n "$RELEASE_TOKEN" ] || { echo "RELEASE_TOKEN is unset"; exit 1; }
[ -n "$GITHUB_MIRROR_TOKEN" ] || { echo "GITHUB_MIRROR_TOKEN is unset"; exit 1; }

work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

git clone --bare --quiet "https://x-token-auth:${RELEASE_TOKEN}@bitbucket.org/itband/ids-design-system.git" "$work"

# A false positive goes into .gitleaksignore as the fingerprint gitleaks prints for it.
gitleaks git "$work" --log-opts=--all --redact --no-banner --gitleaks-ignore-path .gitleaksignore \
  || { echo "gitleaks found a secret: the GitHub mirror is NOT updated."; exit 1; }

git -C "$work" push --prune \
  "https://x-access-token:${GITHUB_MIRROR_TOKEN}@github.com/ids-group/ids-design-system.git" \
  '+refs/heads/*:refs/heads/*' '+refs/tags/*:refs/tags/*'
echo "GitHub mirror updated"
