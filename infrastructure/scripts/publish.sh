#!/bin/sh
# Publish dist/ds to npm with safety guards. Called by the tag (v*) pipeline after
# build-lib.sh. Guards: the tag must match the built version, and the version must
# not already be on npm. Prereleases (version contains '-') publish under `next`.
set -e

cd "$(dirname "$0")/../.."

[ -f dist/ds/package.json ] || { echo "publish: dist/ds/package.json missing — run build-lib.sh first."; exit 1; }
[ -n "$NPM_TOKEN" ] || { echo "publish: NPM_TOKEN is not set."; exit 1; }
[ -n "$BITBUCKET_TAG" ] || { echo "publish: BITBUCKET_TAG is not set — this runs from a tag pipeline."; exit 1; }

pkg_name=$(node -p "require('./dist/ds/package.json').name")
pkg_version=$(node -p "require('./dist/ds/package.json').version")
tag_version=${BITBUCKET_TAG#v}

if [ "$pkg_version" != "$tag_version" ]; then
  echo "publish: tag ($tag_version) does not match dist/ds version ($pkg_version)."
  exit 1
fi

if npm view "$pkg_name@$pkg_version" version > /dev/null 2>&1; then
  echo "publish: $pkg_name@$pkg_version is already published — refusing to republish."
  exit 1
fi

dist_tag=latest
case "$pkg_version" in
  *-*) dist_tag=next ;;
esac

echo '//registry.npmjs.org/:_authToken=${NPM_TOKEN}' > .npmrc
echo "publish: publishing $pkg_name@$pkg_version (dist-tag: $dist_tag)..."
npm publish ./dist/ds --tag "$dist_tag"
