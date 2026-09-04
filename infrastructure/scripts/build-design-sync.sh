#!/bin/sh
# Build the Claude Design bundle and the tree that is uploaded with it.
#
# After-release rather than per-PR: it is a second full Angular build and nothing on a PR consumes
# it.
set -e

cd "$(dirname "$0")/../.."
. infrastructure/scripts/_setup.sh

setup_bun
install_deps

echo "Bootstrapping design-sync deps..."
node .design-sync/tools/bootstrap.mjs

echo "Building design-sync bundle..."
CI=true bun run build:elements

[ -f .design-sync/elements/dist/ds-bundle.js ] || { echo "Expected artifact missing: .design-sync/elements/dist/ds-bundle.js"; exit 1; }

# What ships is the REWRITTEN stylesheet (config.json's cssEntry), not Angular's styles.css: its
# `./media/` font URLs resolve to nothing in the project. A silent no-op rewrite 404s every face.
[ -f .design-sync/elements/dist/ds-bundle.css ] || { echo "Expected artifact missing: .design-sync/elements/dist/ds-bundle.css (the file cssEntry names)"; exit 1; }
grep -q 'url("fonts/' .design-sync/elements/dist/ds-bundle.css || { echo "ds-bundle.css carries no fonts/ URL - the rewrite did not run"; exit 1; }
! grep -q './media/' .design-sync/elements/dist/ds-bundle.css || { echo "ds-bundle.css still points at ./media/ - the rewrite was incomplete"; exit 1; }

echo "Checking the hand-maintained surface..."
bun run check:manual-surface

# The docs are the agent's instructions, so a prop that no longer exists gets executed, not read.
echo "Checking the docs against the real surface..."
node .design-sync/tools/check-doc-api.mjs

# The publish itself cannot run here: finalize_plan is a permission gate bound to a claude.ai
# login.
echo "Building the upload artefacts..."
bun run build:upload

# The image ships without git, and this check ran `git status` anyway: empty output, test passed,
# nothing compared. A missing tool must never read as a pass.
command -v git > /dev/null || apk add --no-cache git > /dev/null 2>&1 || true
command -v git > /dev/null || { echo "git is not available, so the upload tree cannot be compared or committed"; exit 1; }

# The cards are committed FROZEN: `snapshot-cards` renders each one and writes the settled DOM
# back with the scripts stripped. Without a browser the build below leaves them LIVE, and a
# release commits that — which is how 0.12.0 shipped a thawed tree. So install one.
CHROME_BIN="$(command -v chromium-browser || command -v chromium || true)"
if [ -z "$CHROME_BIN" ]; then
  apk add --no-cache chromium nss freetype harfbuzz ttf-freefont > /dev/null
  CHROME_BIN="$(command -v chromium-browser || command -v chromium || true)"
fi
export CHROME_BIN
[ -n "$CHROME_BIN" ] || { echo "chromium is not available, so the cards cannot be frozen"; exit 1; }

# A card's height is measured from the rendered page, and the marker that carries it is written by
# build-upload — so the measurement sits between two builds, not after the last one.
echo "Measuring the card heights..."
node .design-sync/tools/measure-cards.mjs
bun run build:upload

echo "Freezing the cards..."
node .design-sync/tools/snapshot-cards.mjs
node .design-sync/tools/check-frozen.mjs

[ -f .design-sync/upload/_adherence.oxlintrc.json ] || { echo "Expected artifact missing: .design-sync/upload/_adherence.oxlintrc.json"; exit 1; }
[ -f .design-sync/upload/_ds_bundle.js ] || { echo "Expected artifact missing: .design-sync/upload/_ds_bundle.js"; exit 1; }
# The one artifact build-cards does NOT regenerate: it wipes the directory and only snapshot-cards
# writes the shared sheet. Every frozen card links it, so its absence unstyles 376 of them — and it
# did go missing in a working tree this cycle, noticed by eye rather than by a check.
[ -f .design-sync/upload/_ds_cards.css ] || { echo "Expected artifact missing: .design-sync/upload/_ds_cards.css — run 'node .design-sync/tools/snapshot-cards.mjs'"; exit 1; }

# The pane indexes from the manifest, so a card the manifest omits is not in the project at all.
[ -f .design-sync/upload/_ds_manifest.json ] || { echo "Expected artifact missing: .design-sync/upload/_ds_manifest.json"; exit 1; }
# `"path"` alone also matches brandFonts, which is how this first reported 316 against 314.
indexed=$(grep -cE '"path": "(components|guides)/' .design-sync/upload/_ds_manifest.json)
pages=$(find .design-sync/upload/components .design-sync/upload/guides -name '*.html' | wc -l)
[ "$indexed" = "$pages" ] || { echo "Manifest indexes $indexed card(s) against $pages page(s) in the tree"; exit 1; }
echo "Manifest indexes all $indexed card(s)"

# A card with no viewport silently loses everything below the fold.
# `-exec ... +` rather than `$(find)`: card names carry spaces and word-splitting invents paths.
unsized=$(find .design-sync/upload/components .design-sync/upload/guides -name '*.html' -exec grep -L 'viewport="' {} + | wc -l)
[ "$unsized" = "0" ] || {
  echo "$unsized card(s) carry no viewport in their @dsCard marker:"
  find .design-sync/upload/components .design-sync/upload/guides -name '*.html' -exec grep -L 'viewport="' {} +
  echo ""
  echo "measure-cards.mjs ran above, so this means it skipped them."
  exit 1
}
echo "Every card carries a measured viewport"

# The project must hold nothing this repo cannot rebuild, or a wipe-and-reupload loses it.
for f in styles.css README.md _vendor/react.js _vendor/react-dom.js fonts/fonts.css; do
  [ -f ".design-sync/upload/$f" ] || { echo "Expected artifact missing: .design-sync/upload/$f"; exit 1; }
done
sources=$(find .design-sync/assets/uploads -type f | wc -l)
copies=$(find .design-sync/upload/uploads -type f | wc -l)
[ "$sources" = "$copies" ] || { echo "Pasted-image mismatch: $sources source(s) against $copies in the upload tree"; exit 1; }
[ -f .design-sync/upload/.thumbnail ] || { echo "Expected artifact missing: .design-sync/upload/.thumbnail — it is copied from .design-sync/assets/thumbnail.webp"; exit 1; }
faces=$(find .design-sync/upload/fonts -name '*.woff2' | wc -l)
rules=$(grep -c '@font-face' .design-sync/upload/fonts/fonts.css)
[ "$faces" = "$rules" ] || { echo "Font mismatch: $faces face file(s) against $rules @font-face rule(s) - the missing side 404s silently"; exit 1; }
# fonts.css lives INSIDE fonts/, so the bundle's `fonts/` prefix has to be rewritten one level down.
grep -q 'url("./' .design-sync/upload/fonts/fonts.css || { echo "fonts.css still points outside its own directory"; exit 1; }
echo "Self-contained: $faces face(s), React vendored, styles.css and README generated"

# Cards outnumber components — one per documented block — but a component with none is invisible.
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
# A chapter compiled into the bundle and shown on no card costs its bytes and is reachable
# from nothing.
node .design-sync/tools/check-section-coverage.mjs
sections=$(grep -ho 'ds-docs-[a-z0-9-]*' .design-sync/upload/components/*/*/*.html .design-sync/upload/guides/*/*/*.html | sort -u | wc -l)
echo "Upload artefacts: $cards card(s) for $declarations component(s) over $sections ds-docs section(s)"

GENERATED=".design-sync/upload .design-sync/viewports.json .design-sync/live-cards.txt .design-sync/cards.lock.json"

# A release bumps the version, DS_VERSION carries it into the bundle, and the bundle is committed
# — so every release leaves this tree a version behind. In CI that is committed; run by hand it
# fails, because a script must not push on a developer's behalf.
if [ -z "$(git status --porcelain $GENERATED)" ]; then
  echo "Committed upload tree matches the build"
elif [ -z "$BITBUCKET_BUILD_NUMBER" ]; then
  echo "The committed upload tree is stale — this build regenerated different files:"
  git status --porcelain $GENERATED
  echo ""
  echo "Commit what this run regenerated — it is what a publish sends, so a stale copy"
  echo "publishes the previous release's contract."
  exit 1
else
  [ -n "$RELEASE_TOKEN" ] || { echo "the upload tree needs committing but RELEASE_TOKEN is unset"; exit 1; }
  echo "The upload tree changed; committing it as the release bot..."
  git status --porcelain $GENERATED

  git config user.name "${RELEASE_GIT_NAME:-IDS Release Bot}"
  git config user.email "${RELEASE_GIT_EMAIL:-ci@ids-group.co.uk}"
  git remote set-url origin "https://x-token-auth:${RELEASE_TOKEN}@bitbucket.org/itband/ids-design-system.git"
  git remote set-branches origin main dev
  if [ -f "$(git rev-parse --git-dir)/shallow" ]; then
    git fetch --unshallow origin --quiet
  else
    git fetch origin --quiet
  fi

  # `-B main HEAD` only names the branch. Resetting it to origin/main would throw the rebuild away
  # and commit nothing.
  git checkout -B main HEAD --quiet
  git add $GENERATED
  git commit --quiet -m "chore(design-sync): rebuild the upload tree for $(node -p "require('./package.json').version")"
  git push origin main
  echo "Upload tree committed to main; sync-dev.sh carries it to dev"
fi
