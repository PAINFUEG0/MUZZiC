
step "Locating application"

APP="$(find "$PROJECT/out" -type d -name "MUZZiC.app" -print -quit)"
[[ -n "$APP" && -d "$APP" ]] || fail "MUZZiC.app was not generated."

echo "Found: $APP"

step "Signing application"

codesign --force --deep --sign - --timestamp=none "$APP"

step "Verifying signature"

codesign --verify --deep --strict --verbose=2 "$APP"

step "Rebuilding DMG"

DMG="$(find "$PROJECT/out/make" -type f -iname "*.dmg" -print -quit)"
[[ -n "$DMG" && -f "$DMG" ]] || fail "Generated DMG was not found."

TEMP_DMG="${DMG%.dmg}-signed.dmg"

rm -f "$TEMP_DMG"

hdiutil create \
    -volname "MUZZiC" \
    -srcfolder "$APP" \
    -format UDZO \
    -ov \
    "$TEMP_DMG"

mv -f "$TEMP_DMG" "$DMG"

step "Build completed"

echo "Application: $APP"
echo "DMG: $DMG"

open -R "$DMG"

echo ""
echo "MUZZiC DMG is ready!"
