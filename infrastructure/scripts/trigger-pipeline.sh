#!/bin/sh
# Start a custom pipeline over the Bitbucket REST API: trigger-pipeline.sh <pattern> <branch>.
#
# DOCS_DEPLOY_TOKEN is scoped to pipeline:write only, so RELEASE_TOKEN can stay
# repository:write and neither token carries the other's rights.
set -e

pattern=$1
branch=$2
[ -n "$pattern" ] && [ -n "$branch" ] || { echo "usage: trigger-pipeline.sh <pattern> <branch>"; exit 1; }
[ -n "$DOCS_DEPLOY_TOKEN" ] || { echo "trigger-pipeline: DOCS_DEPLOY_TOKEN is not set."; exit 1; }

# node:22-alpine ships without curl (only busybox wget); add it like cut-release adds git.
command -v curl > /dev/null || apk add --no-cache curl > /dev/null

api="https://api.bitbucket.org/2.0/repositories/itband/ids-design-system/pipelines"
body="{\"target\":{\"type\":\"pipeline_ref_target\",\"ref_type\":\"branch\",\"ref_name\":\"$branch\",\"selector\":{\"type\":\"custom\",\"pattern\":\"$pattern\"}}}"

echo "trigger-pipeline: starting $pattern on $branch..."
status=$(curl -sS -o /tmp/trigger-resp.json -w '%{http_code}' \
  -X POST "$api" \
  -H "Authorization: Bearer $DOCS_DEPLOY_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$body")

if [ "$status" -lt 200 ] || [ "$status" -ge 300 ]; then
  echo "trigger-pipeline: API returned HTTP $status:"
  cat /tmp/trigger-resp.json
  exit 1
fi
echo "trigger-pipeline: $pattern started (HTTP $status)."
