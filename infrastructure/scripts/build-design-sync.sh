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

# The docs and previews ship as the agent's instructions and as the cards themselves, and esbuild
# does not type-check a preview — so a prop the component dropped renders an empty card in silence.
# Twenty of these were sitting in the tree, six of them in a single preview written for the deleted
# React port.
echo "Checking the docs and previews against the real surface..."
node .design-sync/tools/check-doc-api.mjs

# The type-level half, and the one that actually holds: names alone cannot see a wrong TYPE, and
# esbuild compiles a preview without checking anything. Run against the real wrappers it found 45
# errors in 19 previews, one of which crashed Angular by handing a React function to a TemplateRef.
echo "Type-checking the previews against the generated wrappers..."
node .design-sync/tools/check-previews.mjs

# Everything the upload publishes, built here so a broken generator fails the release rather than
# the person running the upload. The publish itself cannot run in a pipeline: finalize_plan is a
# permission gate bound to a claude.ai login and shows the path list for approval.
echo "Building the upload artefacts..."
bun run build:upload

# The tree is COMMITTED, so a stale copy in the repo is the failure to catch: the build above just
# regenerated it from source, and git is the comparator. Same idiom as `split-agent-catalogue
# --check`, except the comparison is free.
if [ -n "$(git status --porcelain .design-sync/upload)" ]; then
  echo "The committed upload tree is stale — this build regenerated different files:"
  git status --porcelain .design-sync/upload
  echo ""
  echo "Run 'npm run build:upload' and commit .design-sync/upload — it is what a publish"
  echo "sends, so a stale copy publishes the previous release's contract."
  exit 1
fi
echo "Committed upload tree matches the build"

[ -f .design-sync/upload/_adherence.oxlintrc.json ] || { echo "Expected artifact missing: .design-sync/upload/_adherence.oxlintrc.json"; exit 1; }
[ -f .design-sync/upload/_ds_bundle.js ] || { echo "Expected artifact missing: .design-sync/upload/_ds_bundle.js"; exit 1; }

# The project must hold nothing this repo cannot rebuild. Everything in this loop was left over
# from a hand-made upload until now, which is why a font could not be added and a wipe-and-reupload
# was unsafe: half the tree had no source.
for f in styles.css README.md _vendor/react.js _vendor/react-dom.js fonts/fonts.css; do
  [ -f ".design-sync/upload/$f" ] || { echo "Expected artifact missing: .design-sync/upload/$f"; exit 1; }
done
faces=$(find .design-sync/upload/fonts -name '*.woff2' | wc -l)
rules=$(grep -c '@font-face' .design-sync/upload/fonts/fonts.css)
[ "$faces" = "$rules" ] || { echo "Font mismatch: $faces face file(s) against $rules @font-face rule(s) - the missing side 404s silently"; exit 1; }
# fonts.css lives INSIDE fonts/, so the bundle's `fonts/` prefix has to be rewritten one level down.
grep -q 'url("./' .design-sync/upload/fonts/fonts.css || { echo "fonts.css still points outside its own directory"; exit 1; }
echo "Self-contained: $faces face(s), React vendored, styles.css and README generated"

cards=$(find .design-sync/upload/components -name '*.html' | wc -l)
previews=$(find .design-sync/upload/_preview -name '*.js' | wc -l)
[ "$cards" = "$previews" ] || { echo "Card/preview mismatch: $cards card(s) against $previews preview(s) - a card whose preview script is missing renders a warning, which is how nine of them shipped"; exit 1; }
echo "Upload artefacts: $cards card(s), $previews preview(s)"
