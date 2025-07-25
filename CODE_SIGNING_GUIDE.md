# macOS Code Signing Guide - Melanin Click

## The Problem

When distributing the Melanin Click DMG to other macOS machines, users see:
```
"Melanin Click" is damaged and can't be opened. You should move it to the Trash.
```

This happens because macOS Gatekeeper blocks unsigned applications for security reasons.

## Solutions

### 🚀 Quick Fix for Users (Recipients of the DMG)

If you received the DMG and see the "damaged" error:

**Option 1: Right-click to Open**
1. Right-click the app in Applications
2. Select "Open" from the context menu
3. Click "Open" when prompted

**Option 2: Remove Quarantine (Terminal)**
```bash
sudo xattr -rd com.apple.quarantine "/Applications/Melanin Click.app"
```

**Option 3: Disable Gatekeeper (Temporary)**
```bash
sudo spctl --master-disable
# Run the app, then re-enable:
sudo spctl --master-enable
```

### 🛠️ Development Builds (for testing)

For development and testing, you can use ad-hoc signing:

```bash
# Build normally - the app will be ad-hoc signed
./build_signed.sh
```

### 🏭 Production Builds (for distribution)

For apps you plan to distribute publicly, you need proper code signing:

#### Step 1: Get Apple Developer Account
1. Sign up for [Apple Developer Program](https://developer.apple.com/programs/) ($99/year)
2. Create a **Developer ID Application** certificate in Keychain Access

#### Step 2: Set Environment Variables
```bash
export APPLE_SIGNING_IDENTITY="Developer ID Application: Your Name (TEAM_ID)"
export APPLE_ID="your.apple.id@email.com"
export APPLE_PASSWORD="your-app-specific-password"
export APPLE_TEAM_ID="YOUR_TEAM_ID"
```

#### Step 3: Build and Sign
```bash
./build_signed.sh
```

This will:
- Code sign the app with your Developer ID
- Notarize the app with Apple (if credentials are set)
- Create a distribution-ready DMG

### 🔍 How to Find Your Signing Identity

```bash
# List all available signing identities
security find-identity -v -p codesigning

# Example output:
# 1) A1B2C3D4E5F6... "Developer ID Application: John Doe (ABCDE12345)"
```

### 📋 Manual Signing Process

If you prefer to sign manually:

```bash
# Build unsigned
cd melanin_click_tauri
npm run tauri build

# Sign the app bundle
codesign --deep --force --verify --verbose --sign "Developer ID Application: Your Name (TEAM_ID)" "src-tauri/target/release/bundle/macos/Melanin Click.app"

# Verify signing
codesign --verify --verbose "src-tauri/target/release/bundle/macos/Melanin Click.app"
spctl --assess --verbose "src-tauri/target/release/bundle/macos/Melanin Click.app"
```

### 🎯 Notarization (Optional but Recommended)

For the best user experience, also notarize your app:

```bash
# Create app-specific password in Apple ID settings
# Then notarize the DMG
xcrun notarytool submit "Melanin Click.dmg" \
  --apple-id "your.apple.id@email.com" \
  --password "your-app-specific-password" \
  --team-id "YOUR_TEAM_ID" \
  --wait
```

### 🔐 Security Best Practices

1. **Never share your signing certificates** - they're tied to your Apple ID
2. **Use app-specific passwords** - never use your main Apple ID password
3. **Test on clean machines** - always test signed apps on computers that don't have the certificates
4. **Keep certificates backed up** - store them securely in case you need to reinstall

### 💡 Alternative: Self-Signing for Internal Use

If you don't want to pay for Apple Developer Program but need to distribute internally:

```bash
# Create a self-signed certificate
security create-certificate \
  -c "MyCompany Code Signing" \
  -C 1 \
  -t "Code Signing" \
  -k ~/Library/Keychains/login.keychain
```

Note: Self-signed certificates still require users to manually approve the app.

### 📞 Support

If users still have issues:
1. Check System Preferences → Security & Privacy → General
2. Look for "Allow apps downloaded from" and ensure it's not set to "App Store"
3. Try running: `sudo xattr -rc "/Applications/Melanin Click.app"`

## Summary

- **For distribution**: Use proper Apple Developer ID signing
- **For testing**: Use the provided build script with ad-hoc signing
- **For users**: Right-click → Open or use the terminal command to remove quarantine

The `build_signed.sh` script handles all scenarios automatically based on your environment variables. 