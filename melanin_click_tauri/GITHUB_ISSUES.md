# 🐛 GitHub Issues to Create

Please create these issues in the GitHub repository to track the problems we've identified:

## Issue #1: macOS Security Restrictions Prevent Direct App Launch

**Title:** `[Bug] macOS app cannot launch directly due to code signing issues`

**Labels:** `bug`, `macos`, `security`, `high-priority`

**Description:**
```
## Problem
The Melanin Click.app cannot be launched by double-clicking due to macOS Gatekeeper security restrictions.

## Current Behavior
- Double-clicking the app results in no response or security warnings
- Users must use Terminal or override security settings to launch

## Expected Behavior
- App should launch directly when double-clicked
- No security warnings for legitimate users

## Root Cause
- App is adhoc signed, not signed with Apple Developer certificate
- No notarization by Apple
- Gatekeeper blocks unsigned applications

## Workaround
Use Terminal launch:
```bash
export BITCOIN_RPC_PASSWORD="melanin_secure_2025_prod_password"
open "Melanin Click.app"
```

## Solution Needed
1. Obtain Apple Developer certificate
2. Sign the application properly  
3. Notarize with Apple
4. Update build process to handle signing automatically

## Priority
High - Affects user experience significantly
```

---

## Issue #2: Environment Variable Dependency Breaks User Experience

**Title:** `[UX] App requires environment variable setup before launch`

**Labels:** `enhancement`, `ux`, `configuration`

**Description:**
```
## Problem
The application requires `BITCOIN_RPC_PASSWORD` environment variable to be set before launch, causing crashes if not configured.

## Current Behavior
- App crashes with panic if password not set or less than 16 characters
- Users must manually configure environment each time
- No user-friendly setup process

## Expected Behavior
- App should guide users through initial setup
- Environment should be managed internally
- Graceful handling of missing configuration

## Error Message
```
thread 'main' panicked at src/lib.rs:152:27:
Failed to initialize configuration: Config("BITCOIN_RPC_PASSWORD must be at least 16 characters long")
```

## Solution Needed
1. Create first-run setup wizard
2. Store configuration securely (keychain/credential store)
3. Provide configuration UI within the app
4. Better error handling with user guidance

## Priority
Medium - Affects first-time user experience
```

---

## Issue #3: Mining Executables Only Available for Windows

**Title:** `[Feature] Add cross-platform mining executable support`

**Labels:** `enhancement`, `mining`, `cross-platform`

**Description:**
```
## Problem
CPU mining functionality only works on Windows due to binary availability limitations.

## Current Behavior
- Windows: ✅ Pre-compiled cpuminer-multi binaries work
- macOS/Linux: ❌ Users get error messages, must compile manually

## Expected Behavior
- All platforms should support mining out of the box
- Automatic binary download and setup

## Current Implementation
Points to cpuminer-multi v1.3.1 which only has Windows binaries.

## Solution Options
1. **Pre-compile binaries**: Build cpuminer-multi for all platforms
2. **Alternative miner**: Switch to cpuminer-opt (more actively maintained)
3. **Build automation**: Auto-compile on first run
4. **Hybrid approach**: Binaries where available, compilation fallback

## Recommended Solution
Switch to cpuminer-opt with pre-compiled binaries for all platforms.

## Priority
Medium - Expands platform support significantly
```

---

## Issue #4: Production Build Resource Bundle Issues

**Title:** `[Build] App bundle has resource validation problems`

**Labels:** `bug`, `build`, `tauri`

**Description:**
```
## Problem
The production app bundle has resource signature issues that may cause launch failures.

## Current Behavior
```
spctl -a -t exec -vv "Melanin Click.app"
# Output: code has no resources but signature indicates they must be present
```

## Expected Behavior
- Clean bundle validation
- Proper resource embedding
- Reliable launch across all systems

## Root Cause
- Tauri bundling configuration may be incomplete
- Frontend resources not properly embedded
- Bundle verification failing

## Solution Needed
1. Review Tauri configuration (tauri.conf.json)
2. Ensure frontend build is properly embedded
3. Fix resource bundling process
4. Test bundle validation on clean systems

## Priority
Low - App works but may have reliability issues
```

---

## Issue #5: Improve Development Experience

**Title:** `[DX] Streamline development setup and build process`

**Labels:** `enhancement`, `developer-experience`, `documentation`

**Description:**
```
## Problem
Development setup has multiple manual steps and potential failure points.

## Current Issues
- Multiple environment variables to configure
- Platform-specific setup requirements
- Complex build process
- Development vs production configuration differences

## Improvements Needed
1. **Single command setup**: `npm run setup` handles everything
2. **Better error messages**: Guide users through fixes
3. **Development/production parity**: Consistent behavior
4. **Automated testing**: CI/CD pipeline for builds
5. **Hot reload issues**: Better development server integration

## Solution
- Create setup automation scripts
- Improve documentation
- Add development utilities
- Streamline build pipeline

## Priority
Low - Affects developer experience
```

---

# 📝 How to Create These Issues

1. Go to your GitHub repository
2. Click "Issues" tab
3. Click "New Issue"  
4. Copy and paste each issue above
5. Add appropriate labels
6. Assign to relevant team members
7. Set milestones if needed

This will help track and resolve all the identified problems systematically!