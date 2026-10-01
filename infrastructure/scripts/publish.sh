#!/bin/sh
# Publish dist/ds to npm with safety guards. The single publisher: the tag (v*)
# pipeline runs it after build-lib.sh, for both one-click (cut-release.sh) and local
# (`npm run release:*`) releases — both just push a vX.Y.Z tag. Guards: the tag must
# match the built version, and must not already be on npm. Prereleases (version
# contains '-') publish under `next` instead of `latest`; a stable release also moves an
# older `next` up to itself.
set -e

cd "$(dirname "$0")/../.."

[ -f dist/ds/package.json ] || { echo "publish: dist/ds/package.json missing — run build-lib.sh (bun run build:lib) first."; exit 1; }
[ -n "$NPM_TOKEN" ] || { echo "publish: NPM_TOKEN is not set."; exit 1; }
[ -n "$BITBUCKET_TAG" ] || { echo "publish: BITBUCKET_TAG is not set — this runs from the tag pipeline."; exit 1; }

pkg_name=$(node -p "require('./dist/ds/package.json').name")
pkg_version=$(node -p "require('./dist/ds/package.json').version")
tag_version=${BITBUCKET_TAG#v}

if [ "$pkg_version" != "$tag_version" ]; then
  echo "publish: tag ($tag_version) does not match dist/ds version ($pkg_version)."
  exit 1
fi

dist_tag=latest
case "$pkg_version" in
  *-*) dist_tag=next ;;
esac

echo '//registry.npmjs.org/:_authToken=${NPM_TOKEN}' > .npmrc

# `next` must never resolve older than `latest`. Non-fatal: the package is already on npm, and a
# failure here would stop the after-release trigger that follows in the same step.
move_next_up() {
  [ "$dist_tag" = latest ] || return 0
  next_version=$(npm view "$pkg_name" dist-tags.next 2> /dev/null || true)
  if [ -n "$next_version" ] && node --input-type=module -e "import { compareVersions } from './tools/release-tags.mjs'; process.exit(compareVersions(process.argv[1], process.argv[2]) < 0 ? 0 : 1)" "$next_version" "$pkg_version"; then
    npm dist-tag add "$pkg_name@$pkg_version" next \
      || echo "publish: could not move the next dist-tag from $next_version to $pkg_version — re-run this pipeline to retry."
  fi
}

# A re-run of an already published tag still repairs `next`, then refuses.
if npm view "$pkg_name@$pkg_version" version > /dev/null 2>&1; then
  move_next_up
  echo "publish: $pkg_name@$pkg_version is already published — refusing to republish."
  exit 1
fi

echo "publish: publishing $pkg_name@$pkg_version (dist-tag: $dist_tag)..."
npm publish ./dist/ds --tag "$dist_tag"
move_next_up
