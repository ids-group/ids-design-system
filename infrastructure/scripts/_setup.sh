# Sourced helper (do not execute directly): puts bun on PATH and installs deps.
#
# bun replaces `npm ci` because npm ci fails on the @emnapi optional peer-deps of
# @napi-rs/wasm-runtime under alpine/musl. The bun binary is cached in ~/.bun/bin
# so the npm bootstrap only runs on a cold cache.
#
# Must be sourced (`. _setup.sh`), not run: an executed child cannot export PATH
# back into the calling shell.

setup_bun() {
  export BUN_INSTALL="$HOME/.bun"
  export PATH="$BUN_INSTALL/bin:$PATH"
  if ! command -v bun > /dev/null; then
    echo "Installing bun..."
    npm i -g bun
    mkdir -p "$BUN_INSTALL/bin"
    cp "$(which bun)" "$BUN_INSTALL/bin/bun"
  fi
}

install_deps() {
  bun install --no-save --no-progress
}
