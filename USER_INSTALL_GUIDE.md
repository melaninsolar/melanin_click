# Melanin Click - Installation Guide for macOS

## If you see "Melanin Click is damaged and can't be opened"

Don't worry! This is a security feature in macOS. The app isn't actually damaged - it just needs to be approved.

### Quick Fix (30 seconds)

**Method 1: Right-click to Open**
1. Open **Applications** folder
2. **Right-click** on "Melanin Click" 
3. Select **"Open"** from the menu
4. Click **"Open"** when asked "Are you sure you want to open it?"

**Method 2: Terminal Command**
1. Open **Terminal** (search for it in Spotlight)
2. Copy and paste this command:
   ```bash
   sudo xattr -rd com.apple.quarantine "/Applications/Melanin Click.app"
   ```
3. Enter your password when prompted
4. Now you can open the app normally

### Why does this happen?

macOS has a security feature called "Gatekeeper" that blocks apps that aren't signed with an Apple Developer certificate. This is normal for many legitimate apps that don't go through Apple's expensive signing process.

### Is it safe?

Yes! This is a common issue with legitimate software. The app itself is perfectly safe - it's just not signed with Apple's expensive certificate.

### Still having issues?

If the app still won't open:

1. Check **System Preferences** → **Security & Privacy** → **General**
2. Make sure "Allow apps downloaded from" is set to **"App Store and identified developers"** (not "App Store")
3. Try the terminal command again

### Need help?

If you're still having trouble, contact the developer or check the full technical guide in `CODE_SIGNING_GUIDE.md`.

---

*This guide applies to Melanin Click v2.0 and later. For older versions, the process may be different.* 