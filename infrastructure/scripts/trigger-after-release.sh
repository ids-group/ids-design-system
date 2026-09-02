#!/bin/sh
# Final step of the tag (v*) pipeline: after publish.sh, start the separate
# after-release custom pipeline via the Bitbucket REST API, so a release rebuilds and
# redeploys everything that is generated from source — the ds-docs showcase and the
# Claude Design bundle. Skipped for prereleases (public docs track latest stable).
# Auth: DOCS_DEPLOY_TOKEN — a dedicated repo access token scoped to pipeline:write
# only (least privilege; RELEASE_TOKEN keeps just repository:write). It is a
# repository variable, so it is visible to this tag pipeline.
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
