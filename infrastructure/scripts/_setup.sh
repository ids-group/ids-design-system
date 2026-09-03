# Must be SOURCED (`. _setup.sh`), never executed: a child process cannot export PATH back.
#
# bun replaces `npm ci`, which fails on the @emnapi optional peer-deps of @napi-rs/wasm-runtime
# under alpine/musl.

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
  # --frozen-lockfile fails when package.json and bun.lock disagree, which is what keeps a
  # publish reproducible. Regenerate the lock with `bun install` when deps change.
  bun install --frozen-lockfile --no-progress
}
