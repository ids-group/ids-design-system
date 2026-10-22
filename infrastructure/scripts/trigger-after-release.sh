#!/bin/sh
# Last step of the tag (v*) pipeline: start the after-release pipeline over the REST API.
set -e

[ -n "$BITBUCKET_TAG" ] || { echo "trigger-after-release: BITBUCKET_TAG is not set — this runs from the tag pipeline."; exit 1; }

# Prereleases (e.g. v0.7.0-beta.0) publish under `next`; don't refresh the public docs.
case "$BITBUCKET_TAG" in
  *-*) echo "trigger-after-release: $BITBUCKET_TAG is a prerelease — skipping the after-release work."; exit 0 ;;
esac

sh "$(dirname "$0")/trigger-pipeline.sh" after-release main
