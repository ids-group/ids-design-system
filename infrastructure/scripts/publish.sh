#!/bin/sh
# Publish dist/ds to npm with safety guards. Called by the tag (v*) pipeline and by
# ci-release.sh after build-lib.sh. The expected version comes from BITBUCKET_TAG
# (tag pipeline) or RELEASE_VERSION (custom release pipeline). Guards: that version
# must match the built version, and must not already be on npm. Prereleases
# (version contains '-') publish under `next` instead of `latest`.
set -e

cd "$(dirname "$0")/../.."

[ -f dist/ds/package.json ] || { echo "publish: dist/ds/package.json missing — run build-lib.sh first."; exit 1; }
[ -n "$NPM_TOKEN" ] || { echo "publish: NPM_TOKEN is not set."; exit 1; }

pkg_name=$(node -p "require('./dist/ds/package.json').name")
pkg_version=$(node -p "require('./dist/ds/package.json').version")

if [ -n "$BITBUCKET_TAG" ]; then
  expected_version=${BITBUCKET_TAG#v}
elif [ -n "$RELEASE_VERSION" ]; then
  expected_version=$RELEASE_VERSION
else
  echo "publish: set BITBUCKET_TAG (tag pipeline) or RELEASE_VERSION (release pipeline)."
  exit 1
fi

if [ "$pkg_version" != "$expected_version" ]; then
  echo "publish: expected version ($expected_version) does not match dist/ds version ($pkg_version)."
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
