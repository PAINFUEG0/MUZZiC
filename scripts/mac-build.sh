
#!/bin/bash
set -Eeuo pipefail

REPO="https://github.com/PAINFUEG0/MUZZiC.git"
PROJECT="$HOME/MUZZiC-build"

trap 'echo ""; echo "Error: Command failed at line $LINENO. Build aborted."; exit 1' ERR
trap 'echo ""; echo "Build interrupted."; exit 130' INT TERM

step() {
    echo ""
    echo "==> $1"
}

fail() {
    echo "Error: $1" >&2
    exit 1
}

step "Checking system"

[[ "$(uname -s)" == "Darwin" ]] || fail "This script requires macOS."

ARCH="$(uname -m)"
[[ "$ARCH" == "arm64" || "$ARCH" == "x86_64" ]] || fail "Unsupported architecture: $ARCH"

echo "Architecture: $ARCH"

step "Checking Xcode Command Line Tools"

if ! xcode-select -p >/dev/null 2>&1; then
    xcode-select --install || true
    fail "Install Xcode Command Line Tools, then run this script again."
fi

step "Installing NVM"

export NVM_DIR="$HOME/.nvm"

if [[ ! -s "$NVM_DIR/nvm.sh" ]]; then
    curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.41.0/install.sh | bash
fi

[[ -s "$NVM_DIR/nvm.sh" ]] || fail "NVM installation failed."

source "$NVM_DIR/nvm.sh"

step "Installing Node.js 22"

nvm install 22
nvm use 22
nvm alias default 22

echo "Node.js: $(node -v)"
echo "npm: $(npm -v)"

step "Preparing repository"

if [[ -d "$PROJECT/.git" ]]; then
    cd "$PROJECT"
    git pull --ff-only
else
    git clone "$REPO" "$PROJECT"
    cd "$PROJECT"
fi

step "Installing dependencies"

npm install

step "Building MUZZiC"

npm run make

step "Locating application"

APP="$(find "$PROJECT/out" -type d -name "MUZZiC.app" -print -quit)"
[[ -n "$APP" && -d "$APP" ]] || fail "MUZZiC.app was not generated."

echo "Found: $APP"

step "Signing application"

codesign \
    --force \
    --deep \
    --sign - \
    --timestamp=none \
    "$APP"

step "Verifying signature"

codesign \
    --verify \
    --deep \
    --strict \
    --verbose=2 \
    "$APP"

step "Rebuilding DMG"

MAKE_DIR="$PROJECT/out/make"
mkdir -p "$MAKE_DIR"

DMG="$MAKE_DIR/MUZZiC.dmg"
TEMP_DMG="$MAKE_DIR/MUZZiC-signed.dmg"

rm -f "$TEMP_DMG"

hdiutil create \
    -volname "MUZZiC" \
    -srcfolder "$APP" \
    -format UDZO \
    -ov \
    "$TEMP_DMG"

mv -f "$TEMP_DMG" "$DMG"

step "Verifying DMG"

[[ -s "$DMG" ]] || fail "DMG creation failed."

hdiutil verify "$DMG"

step "Build completed"

echo "Application: $APP"
echo "DMG: $DMG"

open -R "$DMG"

echo ""
echo "MUZZiC DMG is ready!"
