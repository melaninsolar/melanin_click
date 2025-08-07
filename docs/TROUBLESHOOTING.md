# 🔧 Melanin Click Troubleshooting Guide

## Quick Start Issues

### Application Window Not Appearing

**Symptoms:**
- Tauri dev server starts successfully
- No application window visible
- Process appears in Activity Monitor but no GUI

**Solutions:**

1. **Use the Debug Startup Script:**
   ```bash
   cd melanin_click_tauri
   ./debug_startup.sh
   ```

2. **Manual Debug Mode:**
   ```bash
   cd melanin_click_tauri
   export RUST_LOG=debug
   export RUST_BACKTRACE=1
   npm run tauri:dev
   ```

3. **Check Window Focus (macOS):**
   - Look for the app in Dock
   - Use Cmd+Tab to cycle through applications
   - Check Mission Control (F3) for hidden windows
   - Try clicking on the Melanin Click icon in the Dock

4. **Force Window Creation:**
   ```bash
   # Kill any existing processes
   pkill -f melanin-click
   
   # Clear build cache
   cd melanin_click_tauri
   rm -rf src-tauri/target/debug
   npm run tauri:dev
   ```

### Common Error Messages

#### "Main window not found"
- **Cause:** Window configuration issue
- **Solution:** The app now includes fallback window creation
- **Check:** Look for "fallback_created" in logs

#### Rust Compilation Warnings
- **Warning:** `unused variable: config`
- **Status:** ✅ Fixed in troubleshooting branch
- **Impact:** Non-critical, app will still run

#### Port 1420 Already in Use
```bash
# Find and kill process using port 1420
lsof -ti:1420 | xargs kill -9

# Or use a different port
export VITE_PORT=1421
npm run tauri:dev
```

## Logging and Diagnostics

### Log File Locations
- **Development:** `melanin_click_tauri/logs/melanin_click.log`
- **Structured Logs:** Look for `component=window` entries
- **Troubleshooting Info:** Search for `component=troubleshooting`

### Debug Commands
```bash
# View live logs
tail -f melanin_click_tauri/logs/melanin_click.log

# Search for window events
grep "component=window" melanin_click_tauri/logs/melanin_click.log

# Check for errors
grep "ERROR" melanin_click_tauri/logs/melanin_click.log
```

## Platform-Specific Issues

### macOS
- **Gatekeeper:** First run might be blocked
  - Right-click app → Open → Open (bypass Gatekeeper)
  - Or: `sudo xattr -rd com.apple.quarantine "/path/to/app"`
- **Focus Issues:** App includes macOS-specific focus strategies
- **Permissions:** Check System Preferences → Security & Privacy

### Linux
- **Dependencies:** Ensure all system dependencies are installed
  ```bash
  sudo apt update
  sudo apt install libwebkit2gtk-4.0-dev build-essential curl wget libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
  ```

### Windows
- **WebView2:** Ensure Microsoft Edge WebView2 is installed
- **Visual Studio Build Tools:** Required for Rust compilation

## Development Environment

### Required Versions
- **Node.js:** 18+ (Check: `node --version`)
- **Rust:** 1.70+ (Check: `rustc --version`)
- **Tauri CLI:** 2.0+ (Check: `cargo tauri --version`)

### Clean Installation
```bash
# Full clean reinstall
rm -rf node_modules
rm -rf src-tauri/target
npm install
npm run tauri:dev
```

## Advanced Debugging

### Enable Maximum Logging
```bash
export RUST_LOG=trace
export TAURI_DEBUG=1
export WEBKIT_INSPECTOR=1
npm run tauri:dev
```

### WebView Debugging
- **Development Mode:** Press F12 or right-click → Inspect
- **Enable DevTools:** Set `WEBKIT_INSPECTOR=1`

### Process Monitoring
```bash
# Monitor all Melanin Click processes
watch -n 1 'ps aux | grep melanin'

# Check network connections
lsof -i :1420
```

## Getting Help

### Information to Provide
1. **Operating System:** `uname -a`
2. **Node.js Version:** `node --version`
3. **Rust Version:** `rustc --version`
4. **Tauri Version:** `cargo tauri --version`
5. **Error Logs:** Last 50 lines from log file
6. **Steps to Reproduce:** Exact commands run

### Log Collection Script
```bash
# Run this to collect all relevant information
./debug_startup.sh > debug_output.txt 2>&1
```

## Known Issues

### Fixed in Troubleshooting Branch
- ✅ Window visibility and focus issues
- ✅ Unused variable warnings
- ✅ Missing comprehensive logging
- ✅ Lack of startup diagnostics

### Current Limitations
- First compilation can take 3-5 minutes
- Large binary size in debug mode (normal)
- macOS may require manual focus on first run

## Success Indicators

**Application Running Successfully:**
- ✅ Vite dev server on http://localhost:1420
- ✅ Window appears and is focused
- ✅ No critical errors in logs
- ✅ Process visible in Activity Monitor
- ✅ Responsive UI

**Log Entries to Look For:**
```
INFO ThreadId(01) Tauri application setup complete
INFO component="window" event="shown" 
INFO component="window" event="focused"
INFO component="window" event="configuration_complete"
```