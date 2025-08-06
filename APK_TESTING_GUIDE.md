# 📱 Melanin Click APK Testing Guide

## 🔧 **Building the APK**

### Prerequisites Complete ✅
- Android SDK installed and configured
- Java 17 JDK available
- Rust Android targets installed
- Frontend built successfully

### Build Commands (Once NDK is ready)
```bash
# Set environment variables
export ANDROID_HOME=~/Library/Android/sdk
export NDK_HOME=~/Library/Android/sdk/ndk-bundle
export JAVA_HOME=/Applications/Android\ Studio.app/Contents/jbr/Contents/Home

# Initialize Android project
npx tauri android init

# Build APK
npx tauri android build --apk --target aarch64

# Build for multiple architectures
npx tauri android build --apk --target aarch64,armv7
```

### APK Location
```
melanin_click_tauri/src-tauri/gen/android/app/build/outputs/apk/
├── universal/
│   └── release/
│       └── app-universal-release-unsigned.apk
└── arm64-v8a/
    └── release/
        └── app-arm64-v8a-release-unsigned.apk
```

## 📱 **Testing Methods**

### Method 1: Physical Android Device (Recommended)
```bash
# Enable Developer Options on device:
# Settings > About Phone > Tap "Build Number" 7 times

# Enable USB Debugging:
# Settings > Developer Options > USB Debugging

# Install APK via ADB
adb devices                    # Verify device connected
adb install app-release.apk   # Install APK
adb shell am start -n com.melaninclick.app/.MainActivity  # Launch app
```

### Method 2: Android Emulator
```bash
# Start emulator (Android Studio)
emulator -avd Pixel_6_API_34

# Install APK
adb install app-release.apk

# Launch app
adb shell monkey -p com.melaninclick.app -c android.intent.category.LAUNCHER 1
```

### Method 3: Manual Installation (Sideloading)
1. Transfer APK to device via USB/email/cloud
2. Enable "Install from Unknown Sources"
3. Tap APK file and install
4. Launch from app drawer

## 🧪 **Test Cases**

### Core Functionality Tests
```
✅ App launches successfully
✅ UI loads without crashes
✅ Mobile settings screen accessible
✅ Solo mining configuration works
✅ Battery status displays correctly
✅ Temperature monitoring active
✅ Background service starts/stops
✅ Mining controls respond properly
```

### Battery Management Tests
```
✅ Battery level displays accurately
✅ Charging status updates correctly
✅ Low battery protection triggers
✅ Battery threshold settings save
✅ Mining stops below threshold
✅ Charging-only mode works
```

### Thermal Protection Tests
```
✅ Temperature readings display
✅ Thermal protection activates
✅ Mining stops when overheating
✅ Temperature threshold configurable
✅ Cooling down resumes mining
```

### Background Service Tests
```
✅ Foreground service starts
✅ Notification appears correctly
✅ Mining continues in background
✅ Service survives app minimize
✅ Service stops when requested
✅ Battery optimization bypass works
```

## 📊 **Performance Testing**

### Battery Drain Test (24 hours)
```bash
# Before testing
adb shell dumpsys battery | grep level
adb shell dumpsys battery | grep temperature

# Start mining and monitor
# Check every 4 hours:
adb shell dumpsys battery
adb shell top -n 1 | grep melanin

# Log results:
# Hour 0: 100% battery, 35°C
# Hour 4: X% battery, Y°C
# Hour 8: X% battery, Y°C
# etc.
```

### Memory Usage Test
```bash
# Check memory usage
adb shell dumpsys meminfo com.melaninclick.app

# Monitor over time
adb shell top -n 1 | grep melanin

# Look for memory leaks
adb shell dumpsys meminfo com.melaninclick.app | grep TOTAL
```

### CPU Usage Test
```bash
# Monitor CPU usage during mining
adb shell top -n 1 | grep melanin

# Expected: 15-25% CPU usage during mining
# Expected: <5% CPU usage when idle
```

## 🔍 **Debugging Tools**

### ADB Logging
```bash
# View app logs
adb logcat | grep melanin

# Clear logs and start fresh
adb logcat -c
adb logcat -s "MelaninClick"

# Save logs to file
adb logcat > melanin_test_log.txt
```

### Performance Monitoring
```bash
# Real-time performance stats
adb shell dumpsys cpuinfo | grep melanin
adb shell dumpsys batterystats | grep melanin

# Network usage
adb shell dumpsys netstats | grep melanin
```

### Crash Investigation
```bash
# Check for crashes
adb logcat | grep -E "(FATAL|AndroidRuntime)"

# Generate bug report
adb bugreport melanin_bugreport.zip
```

## 📝 **Test Results Template**

### Device Information
```
Device: [Model/Manufacturer]
Android Version: [Version]
RAM: [Amount]
Storage Available: [Amount]
Battery Capacity: [mAh]
CPU: [Type/Cores]
```

### Test Results
```
✅/❌ App Installation: [Success/Failed]
✅/❌ First Launch: [Success/Failed]  
✅/❌ UI Responsiveness: [Good/Slow/Crashes]
✅/❌ Mining Setup: [Success/Failed]
✅/❌ Battery Management: [Working/Not Working]
✅/❌ Background Service: [Working/Not Working]
✅/❌ 24h Stability: [Stable/Crashes]

Battery Drain: [X% per hour during mining]
Temperature Rise: [Starting temp -> Peak temp]
Memory Usage: [Peak memory consumption]
CPU Usage: [Average CPU % during mining]
```

### Issues Found
```
Issue 1: [Description]
- Reproduction: [Steps to reproduce]
- Expected: [Expected behavior]  
- Actual: [Actual behavior]
- Severity: [High/Medium/Low]

Issue 2: [Description]
...
```

## 🎯 **Success Criteria**

### Must Pass (Critical)
- ✅ App installs and launches on target devices
- ✅ Solo mining configuration completes successfully
- ✅ Battery protection prevents device damage
- ✅ Thermal protection prevents overheating
- ✅ Background service maintains mining operation
- ✅ No memory leaks during 24-hour operation

### Should Pass (Important)
- ✅ Smooth UI performance (60fps)
- ✅ Battery drain <20% per hour during mining
- ✅ Memory usage <500MB during operation
- ✅ CPU usage <30% during mining
- ✅ App survives device sleep/wake cycles

### Nice to Have (Optional)
- ✅ Mining statistics accuracy
- ✅ UI animations smooth
- ✅ Quick app startup (<3 seconds)
- ✅ Efficient background processing

## 🚀 **Quick Test Script**

```bash
#!/bin/bash
# Quick APK test script

APK_PATH="app-release.apk"
PACKAGE_NAME="com.melaninclick.app"

echo "🔧 Installing APK..."
adb install $APK_PATH

echo "🚀 Launching app..."
adb shell am start -n $PACKAGE_NAME/.MainActivity

echo "📊 Monitoring for 60 seconds..."
timeout 60 adb logcat | grep -i melanin

echo "🔋 Battery status:"
adb shell dumpsys battery | grep -E "(level|temperature)"

echo "💾 Memory usage:"
adb shell dumpsys meminfo $PACKAGE_NAME | grep TOTAL

echo "✅ Test complete!"
```

## 📞 **Support & Reporting**

### For Testing Issues
- **GitHub Issues**: Report bugs with logs and device info
- **Discord**: #alpha-testing channel for quick questions
- **Email**: testing@melaninclick.app for sensitive reports

### Required Information for Bug Reports
1. Device model and Android version
2. APK version and build info
3. Steps to reproduce the issue
4. Expected vs actual behavior
5. Logs (adb logcat output)
6. Screenshots/screen recordings if UI issue

---

**Ready to test as soon as APK build completes!** 🚀📱

*This guide will be updated as we gather more testing data and feedback.*