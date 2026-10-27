#!/bin/sh
# Build the Claude Design bundle and the tree that is uploaded with it.
#
# After-release rather than per-PR: it is a second full Angular build and nothing on a PR consumes
# it.
set -e

cd "$(dirname "$0")/../.."
. infrastructure/scripts/_setup.sh

setup_bun

# Ten phases, three of which take minutes on their own. Without a heading and a running clock the
# whole step reads as one silent twenty-minute hang, and there is no way to tell a slow build from a
# wedged one.
STEPS=10
STEP=0
STARTED=$(date +%s)
step() {
  STEP=$((STEP + 1))
  printf '\n=== [%s/%s] %s  (%ss elapsed)\n' "$STEP" "$STEPS" "$1" "$(($(date +%s) - STARTED))"
}

step "Installing dependencies"
install_deps

step "Bootstrapping design-sync deps"
node .design-sync/tools/bootstrap.mjs

step "Slicing the sections and building the design-sync bundle"
CI=true bun run build:elements

[ -f .design-sync/elements/dist/ds-bundle.js ] || { echo "Expected artifact missing: .design-sync/elements/dist/ds-bundle.js"; exit 1; }

# What ships is the REWRITTEN stylesheet (config.json's cssEntry), not Angular's styles.css: its
# `./media/` font URLs resolve to nothing in the project. A silent no-op rewrite 404s every face.
[ -f .design-sync/elements/dist/ds-bundle.css ] || { echo "Expected artifact missing: .design-sync/elements/dist/ds-bundle.css (the file cssEntry names)"; exit 1; }
grep -q 'url("fonts/' .design-sync/elements/dist/ds-bundle.css || { echo "ds-bundle.css carries no fonts/ URL - the rewrite did not run"; exit 1; }
! grep -q './media/' .design-sync/elements/dist/ds-bundle.css || { echo "ds-bundle.css still points at ./media/ - the rewrite was incomplete"; exit 1; }

step "Checking the hand-maintained surface"
node tools/check.mjs manual-surface

# The docs are the agent's instructions, so a prop that no longer exists gets executed, not read.
step "Checking the docs against the real surface"
node .design-sync/tools/check-doc-api.mjs

# The publish itself cannot run here: finalize_plan is a permission gate bound to a claude.ai
# login.
step "Building the upload artefacts"
bun run build:upload

# The image ships without git, and this check ran `git status` anyway: empty output, test passed,
# nothing compared. A missing tool must never read as a pass.
command -v git > /dev/null || apk add --no-cache git > /dev/null 2>&1 || true
command -v git > /dev/null || { echo "git is not available, so the upload tree cannot be compared or committed"; exit 1; }

# The cards are committed FROZEN: `snapshot-cards` renders each one and writes the settled DOM
# back with the scripts stripped. Without a browser the build below leaves them LIVE, and a
# release commits that — which is how 0.12.0 shipped a thawed tree. So install one.
step "Making a browser available"
CHROME_BIN="${CHROME_BIN:-$(command -v chromium-browser || command -v chromium || true)}"
if [ -z "$CHROME_BIN" ]; then
  # The packages come from the pipeline's apk cache; --update-cache keeps a stale index in it from
  # pinning an older chromium than a fresh install would get.
  mkdir -p "$HOME/.cache/apk"
  apk add --update-cache --cache-dir "$HOME/.cache/apk" chromium nss freetype harfbuzz ttf-freefont > /dev/null
  CHROME_BIN="$(command -v chromium-browser || command -v chromium || true)"
fi
export CHROME_BIN
[ -n "$CHROME_BIN" ] || { echo "chromium is not available, so the cards cannot be frozen"; exit 1; }

# One render per card yields both its height and its frozen DOM. The height lands in the card's
# `@dsCard viewport` marker, which build-upload writes, so when a height moved snapshot-cards rebuilds
# the tree before it writes the frozen cards over it.
step "Measuring and freezing the cards"
node .design-sync/tools/snapshot-cards.mjs
node .design-sync/tools/check-frozen.mjs

step "Verifying the upload tree"

[ -f .design-sync/upload/_adherence.oxlintrc.json ] || { echo "Expected artifact missing: .design-sync/upload/_adherence.oxlintrc.json"; exit 1; }
[ -f .design-sync/upload/_ds_bundle.js ] || { echo "Expected artifact missing: .design-sync/upload/_ds_bundle.js"; exit 1; }
# The one artifact build-cards does NOT regenerate: it wipes the directory and only snapshot-cards
# writes the shared sheet. Every frozen card links it, so its absence unstyles 376 of them — and it
# did go missing in a working tree this cycle, noticed by eye rather than by a check.
[ -f .design-sync/upload/_ds_cards.css ] || { echo "Expected artifact missing: .design-sync/upload/_ds_cards.css — run 'node .design-sync/tools/snapshot-cards.mjs'"; exit 1; }
# Present is not the same as populated: an empty sheet unstyles every frozen card, and -f passes on
# a one-byte file.
[ -s .design-sync/upload/_ds_cards.css ] || { echo ".design-sync/upload/_ds_cards.css is empty, so every frozen card would render unstyled"; exit 1; }
# Each card links this one level up from its own directory; the step gates its SOURCE above and used
# to leave the copy the cards actually load unchecked.
[ -s .design-sync/upload/_ds_bundle.css ] || { echo "Expected artifact missing or empty: .design-sync/upload/_ds_bundle.css"; exit 1; }

# The pane indexes from the manifest, so a card the manifest omits is not in the project at all.
[ -f .design-sync/upload/_ds_manifest.json ] || { echo "Expected artifact missing: .design-sync/upload/_ds_manifest.json"; exit 1; }
# `"path"` alone also matches brandFonts, which is how this first reported 316 against 314.
# `|| true` because zero matches is the case the next line reports, and `grep -c` exits 1 on it —
# which under `set -e` killed the run before it could say so.
indexed=$(grep -cE '"path": "(components|guides)/' .design-sync/upload/_ds_manifest.json || true)
pages=$(find .design-sync/upload/components .design-sync/upload/guides -name '*.html' | wc -l)
# Both zero compares equal, and `|| true` above is what makes that reachable: an empty tree would
# report "indexes all 0 card(s)" as a pass.
[ "$pages" -gt 0 ] || { echo "No card pages in the upload tree at all"; exit 1; }
[ "$indexed" = "$pages" ] || { echo "Manifest indexes $indexed card(s) against $pages page(s) in the tree"; exit 1; }
echo "Manifest indexes all $indexed card(s)"

# A card with no viewport silently loses everything below the fold.
# `-exec ... +` rather than `$(find)`: card names carry spaces and word-splitting invents paths.
unsized=$(find .design-sync/upload/components .design-sync/upload/guides -name '*.html' -exec grep -L 'viewport="' {} + | wc -l)
[ "$unsized" = "0" ] || {
  echo "$unsized card(s) carry no viewport in their @dsCard marker:"
  find .design-sync/upload/components .design-sync/upload/guides -name '*.html' -exec grep -L 'viewport="' {} +
  echo ""
  echo "snapshot-cards.mjs measured above, so this means it skipped them."
  exit 1
}
echo "Every card carries a measured viewport"

# The project must hold nothing this repo cannot rebuild, or a wipe-and-reupload loses it.
for f in styles.css README.md _vendor/react.js _vendor/react-dom.js fonts/fonts.css; do
  [ -f ".design-sync/upload/$f" ] || { echo "Expected artifact missing: .design-sync/upload/$f"; exit 1; }
done
sources=$(find .design-sync/assets/uploads -type f | wc -l)
copies=$(find .design-sync/upload/uploads -type f | wc -l)
# `find | wc -l` yields 0 when find itself fails, so both sides vanishing compares equal.
[ "$sources" -gt 0 ] || { echo "No pasted images found under .design-sync/assets/uploads"; exit 1; }
[ "$sources" = "$copies" ] || { echo "Pasted-image mismatch: $sources source(s) against $copies in the upload tree"; exit 1; }
[ -f .design-sync/upload/.thumbnail ] || { echo "Expected artifact missing: .design-sync/upload/.thumbnail — it is copied from .design-sync/assets/thumbnail.webp"; exit 1; }
faces=$(find .design-sync/upload/fonts -name '*.woff2' | wc -l)
rules=$(grep -c '@font-face' .design-sync/upload/fonts/fonts.css || true)
[ "$faces" -gt 0 ] || { echo "No font files in the upload tree at all"; exit 1; }
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
# A chapter that opts a block into Claude Design and backs no card lost the mark somewhere;
# see .design-sync/CARDS.md.
node .design-sync/tools/check-section-coverage.mjs
sections=$(grep -ho 'ds-docs-[a-z0-9-]*' .design-sync/upload/components/*/*/*.html .design-sync/upload/guides/*/*/*.html | sort -u | wc -l)
echo "Upload artefacts: $cards card(s) for $declarations component(s) over $sections ds-docs section(s)"

step "Committing what the release regenerated"
GENERATED=".design-sync/upload .design-sync/viewports.json .design-sync/live-cards.txt"

# A release bumps the version, DS_VERSION carries it into the bundle, and the bundle is committed
# — so every release leaves this tree a version behind. In CI that is committed; run by hand it
# fails, because a script must not push on a developer's behalf.
# Captured with its status checked: git writes its diagnostics to stderr and nothing to stdout, so
# a `fatal:` of any kind used to arrive here as an empty string and read as "the tree matches".
if ! CHANGED=$(git status --porcelain $GENERATED); then
  echo "git status failed, so the upload tree could not be compared — refusing to call it unchanged"
  exit 1
fi

if [ -z "$CHANGED" ]; then
  echo "Committed upload tree matches the build"
elif [ -z "$BITBUCKET_BUILD_NUMBER" ]; then
  echo "The committed upload tree is stale — this build regenerated different files:"
  echo "$CHANGED"
  echo ""
  echo "Commit what this run regenerated — it is what a publish sends, so a stale copy"
  echo "publishes the previous release's contract."
  exit 1
else
  [ -n "$RELEASE_TOKEN" ] || { echo "the upload tree needs committing but RELEASE_TOKEN is unset"; exit 1; }
  echo "The upload tree changed; committing it as the release bot..."
  echo "$CHANGED"

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

printf '\n=== done in %ss: the Claude Design bundle, %s card(s) and the tree they ship with\n' \
  "$(($(date +%s) - STARTED))" "$cards"
