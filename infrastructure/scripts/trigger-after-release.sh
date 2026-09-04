#!/bin/sh
# Last step of the tag (v*) pipeline: start the after-release pipeline over the REST API.
#
# DOCS_DEPLOY_TOKEN is scoped to pipeline:write only, so RELEASE_TOKEN can stay
# repository:write and neither token carries the other's rights.
set -e

cd "$(dirname "$0")/../.."

[ -n "$BITBUCKET_TAG" ] || { echo "trigger-after-release: BITBUCKET_TAG is not set — this runs from the tag pipeline."; exit 1; }

# Prereleases (e.g. v0.7.0-beta.0) publish under `next`; don't refresh the public docs.
case "$BITBUCKET_TAG" in
  *-*) echo "trigger-after-release: $BITBUCKET_TAG is a prerelease — skipping the after-release work."; exit 0 ;;
esac

[ -n "$DOCS_DEPLOY_TOKEN" ] || { echo "trigger-after-release: DOCS_DEPLOY_TOKEN is not set."; exit 1; }

# node:22-alpine ships without curl (only busybox wget); add it like cut-release adds git.
command -v curl > /dev/null || apk add --no-cache curl > /dev/null

api="https://api.bitbucket.org/2.0/repositories/itband/ids-design-system/pipelines"
body='{"target":{"type":"pipeline_ref_target","ref_type":"branch","ref_name":"main","selector":{"type":"custom","pattern":"after-release"}}}'

echo "trigger-after-release: starting after-release on main for $BITBUCKET_TAG..."
status=$(curl -sS -o /tmp/trigger-resp.json -w '%{http_code}' \
  -X POST "$api" \
  -H "Authorization: Bearer $DOCS_DEPLOY_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$body")

if [ "$status" -lt 200 ] || [ "$status" -ge 300 ]; then
  echo "trigger-after-release: API returned HTTP $status:"
  cat /tmp/trigger-resp.json
  exit 1
fi
echo "trigger-after-release: after-release started (HTTP $status)."
