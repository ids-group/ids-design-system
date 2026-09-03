#!/bin/sh
# Build the Claude Design bundle: generated custom-element registrations + React
# wrappers, the Angular AOT output they upgrade into, and the IIFE that assigns
# them to window.IdsDs.
#
# Runs in the after-release pipeline rather than on a PR because it is the slow
# half (a second full Angular build) and nothing on a PR consumes it. It is here
# at all because until this step existed no pipeline built the bundle: it shipped
# a react `external` that throws before window.IdsDs is assigned, and no green
# build anywhere could see it.
set -e

cd "$(dirname "$0")/../.."
. infrastructure/scripts/_setup.sh

setup_bun
install_deps

# esbuild + sass + the React the wrapper types compile against, into .ds-sync.
echo "Bootstrapping design-sync deps..."
node .design-sync/tools/bootstrap.mjs

echo "Building design-sync bundle..."
CI=true bun run build:elements

[ -f .design-sync/elements/dist/ds-bundle.js ] || { echo "Expected artifact missing: .design-sync/elements/dist/ds-bundle.js"; exit 1; }

# The bundle is useless to the design host without its stylesheet, and the file that ships is the
# REWRITTEN copy named by config.json's cssEntry — not Angular's own styles.css, whose `./media/`
# font URLs resolve to nothing in the project. Assert the copy, and assert the rewrite actually
# happened: a silent no-op there leaves a byte-identical file and 404s every face.
[ -f .design-sync/elements/dist/ds-bundle.css ] || { echo "Expected artifact missing: .design-sync/elements/dist/ds-bundle.css (the file cssEntry names)"; exit 1; }
grep -q 'url("fonts/' .design-sync/elements/dist/ds-bundle.css || { echo "ds-bundle.css carries no fonts/ URL - the rewrite did not run"; exit 1; }
! grep -q './media/' .design-sync/elements/dist/ds-bundle.css || { echo "ds-bundle.css still points at ./media/ - the rewrite was incomplete"; exit 1; }

echo "Checking the hand-maintained surface..."
bun run check:manual-surface

# The docs ship as the agent's instructions, so a prop that no longer exists is executed rather than
# read. Twenty of these were sitting in the tree. The showcase itself needs no such gate any more:
# it IS the ds-docs sections, which the Angular build type-checks.
echo "Checking the docs against the real surface..."
node .design-sync/tools/check-doc-api.mjs

# Everything the upload publishes, built here so a broken generator fails the release rather than
# the person running the upload. The publish itself cannot run in a pipeline: finalize_plan is a
# permission gate bound to a claude.ai login and shows the path list for approval.
echo "Building the upload artefacts..."
bun run build:upload

# The node:22-alpine image ships without git, and this check used to run `git status` anyway: the
# substitution came back empty, the emptiness test passed, and the step printed "Committed upload
# tree matches the build" having compared nothing. It had never once run. Install git first, and
# refuse to continue without it — a missing tool must never read as a pass.
command -v git > /dev/null || apk add --no-cache git > /dev/null 2>&1 || true
command -v git > /dev/null || { echo "git is not available, so the upload tree cannot be compared or committed"; exit 1; }

# A release bumps the version, DS_VERSION carries it into the bundle, and the bundle is part of the
# committed tree — so every release leaves this tree one version behind. In the pipeline the answer
# is to commit the rebuild, not to fail on it; run by hand, the answer is the opposite, because a
# script must not push on a developer's behalf.
if [ -z "$(git status --porcelain .design-sync/upload)" ]; then
  echo "Committed upload tree matches the build"
elif [ -z "$BITBUCKET_BUILD_NUMBER" ]; then
  echo "The committed upload tree is stale — this build regenerated different files:"
  git status --porcelain .design-sync/upload
  echo ""
  echo "Run 'npm run build:upload' and commit .design-sync/upload — it is what a publish"
  echo "sends, so a stale copy publishes the previous release's contract."
  exit 1
else
  [ -n "$RELEASE_TOKEN" ] || { echo "the upload tree needs committing but RELEASE_TOKEN is unset"; exit 1; }
  echo "The upload tree changed; committing it as the release bot..."
  git status --porcelain .design-sync/upload

  # Same identity and token route cut-release.sh uses, so the two bot commits are indistinguishable.
  git config user.name "${RELEASE_GIT_NAME:-IDS Release Bot}"
  git config user.email "${RELEASE_GIT_EMAIL:-ci@ids-group.co.uk}"
  git remote set-url origin "https://x-token-auth:${RELEASE_TOKEN}@bitbucket.org/itband/ids-design-system.git"
  git remote set-branches origin main dev
  if [ -f "$(git rev-parse --git-dir)/shallow" ]; then
    git fetch --unshallow origin --quiet
  else
    git fetch origin --quiet
  fi

  # trigger-after-release.sh starts this pipeline on main, so the checkout is already there and the
  # rebuilt files are sitting in the working tree. `-B main HEAD` only names the branch; resetting
  # it to origin/main instead would throw the rebuild away and the commit would be empty.
  git checkout -B main HEAD --quiet
  git add .design-sync/upload
  git commit --quiet -m "chore(design-sync): rebuild the upload tree for $(node -p "require('./package.json').version")"
  git push origin main

  git checkout -B dev origin/dev
  git merge --no-edit --no-ff main || {
    git merge --abort 2>/dev/null || true
    echo "main does not merge cleanly into dev — the docs are already deployed, but the upload"
    echo "tree on dev is one version behind. Merge main into dev by hand."
    exit 1
  }
  git push origin dev
  git checkout main --quiet
  echo "Upload tree committed to main and merged into dev"
fi

[ -f .design-sync/upload/_adherence.oxlintrc.json ] || { echo "Expected artifact missing: .design-sync/upload/_adherence.oxlintrc.json"; exit 1; }
[ -f .design-sync/upload/_ds_bundle.js ] || { echo "Expected artifact missing: .design-sync/upload/_ds_bundle.js"; exit 1; }

# The pane indexes from the manifest and reads a card only for its content, so a manifest that
# lists fewer cards than the tree holds publishes a project missing those cards entirely - which is
# how a stale copy written by the retired CLI kept showing 79 components, AppShell among them,
# after the tree had moved on to 85.
[ -f .design-sync/upload/_ds_manifest.json ] || { echo "Expected artifact missing: .design-sync/upload/_ds_manifest.json"; exit 1; }
# `"path"` alone also matches brandFonts, which is how this first reported 316 against 314.
indexed=$(grep -cE '"path": "(components|guides)/' .design-sync/upload/_ds_manifest.json)
pages=$(find .design-sync/upload/components .design-sync/upload/guides -name '*.html' | wc -l)
[ "$indexed" = "$pages" ] || { echo "Manifest indexes $indexed card(s) against $pages page(s) in the tree"; exit 1; }
echo "Manifest indexes all $indexed card(s)"

# A card with no `viewport` takes the pane's default and loses everything below the fold, which is
# silent - so the numbers are a build input, not an optional refinement. They come from
# `node .design-sync/tools/measure-cards.mjs`, which needs a browser and therefore runs locally;
# this only checks that somebody ran it for every card.
# `-exec ... +` rather than `$(find)`: card names carry spaces, and word-splitting the list turns
# one card into three paths that do not exist.
unsized=$(find .design-sync/upload/components .design-sync/upload/guides -name '*.html' -exec grep -L 'viewport="' {} + | wc -l)
[ "$unsized" = "0" ] || {
  echo "$unsized card(s) carry no viewport in their @dsCard marker:"
  find .design-sync/upload/components .design-sync/upload/guides -name '*.html' -exec grep -L 'viewport="' {} +
  echo ""
  echo "Run 'node .design-sync/tools/measure-cards.mjs' and commit .design-sync/viewports.json."
  exit 1
}
echo "Every card carries a measured viewport"

# The project must hold nothing this repo cannot rebuild. Everything in this loop was left over
# from a hand-made upload until now, which is why a font could not be added and a wipe-and-reupload
# was unsafe: half the tree had no source.
for f in styles.css README.md _vendor/react.js _vendor/react-dom.js fonts/fonts.css; do
  [ -f ".design-sync/upload/$f" ] || { echo "Expected artifact missing: .design-sync/upload/$f"; exit 1; }
done
sources=$(find .design-sync/assets/uploads -type f | wc -l)
copies=$(find .design-sync/upload/uploads -type f | wc -l)
[ "$sources" = "$copies" ] || { echo "Pasted-image mismatch: $sources source(s) against $copies in the upload tree"; exit 1; }
# The project's cover image. Rendered locally by build-thumbnail.mjs (it needs a browser), so all
# CI can do is refuse to publish a tree that would blank the project tile.
[ -f .design-sync/upload/.thumbnail ] || { echo "Expected artifact missing: .design-sync/upload/.thumbnail — it is copied from .design-sync/assets/thumbnail.webp"; exit 1; }
faces=$(find .design-sync/upload/fonts -name '*.woff2' | wc -l)
rules=$(grep -c '@font-face' .design-sync/upload/fonts/fonts.css)
[ "$faces" = "$rules" ] || { echo "Font mismatch: $faces face file(s) against $rules @font-face rule(s) - the missing side 404s silently"; exit 1; }
# fonts.css lives INSIDE fonts/, so the bundle's `fonts/` prefix has to be rewritten one level down.
grep -q 'url("./' .design-sync/upload/fonts/fonts.css || { echo "fonts.css still points outside its own directory"; exit 1; }
echo "Self-contained: $faces face(s), React vendored, styles.css and README generated"

# A component publishes one card per documented block, so cards outnumber components — but every
# component must still have at least one, and a declaration beside it. Eleven shipped with no card
# at all under the design before last.
cards=$(find .design-sync/upload/components .design-sync/upload/guides -name '*.html' | wc -l)
declarations=$(find .design-sync/upload/components -name '*.d.ts' | wc -l)
cardless=0
for decl in $(find .design-sync/upload/components -name '*.d.ts'); do
  dir=$(dirname "$decl")
  if [ -z "$(find "$dir" -name '*.html' -print -quit)" ]; then
    echo "No card for $(basename "$dir")"
    cardless=$((cardless + 1))
  fi
done
[ "$cardless" = "0" ] || { echo "$cardless component(s) would ship with no card at all"; exit 1; }
# Every chapter the bundle compiles must be on a card. Twenty-seven were not - all of Foundations,
# Patterns and Practice - so the colour ramps, the spacing scale and the do/don't shipped inside the
# bundle and were reachable from nothing.
node .design-sync/tools/check-section-coverage.mjs
sections=$(grep -ho 'ds-docs-[a-z0-9-]*' .design-sync/upload/components/*/*/*.html .design-sync/upload/guides/*/*/*.html | sort -u | wc -l)
echo "Upload artefacts: $cards card(s) for $declarations component(s) over $sections ds-docs section(s)"
