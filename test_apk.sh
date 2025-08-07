#!/bin/bash

# 🧪 Melanin Click APK Automated Testing Script
# This script automates the basic APK testing process

set -e

APK_PATH="melanin_click_tauri/src-tauri/gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk"
PACKAGE_NAME="com.melaninclick.app"
MAIN_ACTIVITY="$PACKAGE_NAME/.MainActivity"

echo "🧪 Melanin Click APK Testing Script"
echo "=================================="

# Check if APK exists
if [ ! -f "$APK_PATH" ]; then
    echo "❌ APK not found at: $APK_PATH"
    echo "   Please build the APK first with: npx tauri android build --apk --debug"
    exit 1
fi

echo "✅ APK found: $APK_PATH ($(du -h "$APK_PATH" | cut -f1))"

# Check if ADB is available
if ! command -v adb &> /dev/null; then
    echo "❌ ADB not found. Please install Android SDK Platform Tools"
    echo "   Or use Android Studio's integrated tools"
    exit 1
fi

# Check for connected devices/emulators
echo "📱 Checking for connected devices..."
DEVICES=$(adb devices | grep -v "List of devices" | grep "device$" | wc -l)

if [ "$DEVICES" -eq 0 ]; then
    echo "❌ No devices/emulators connected"
    echo "   Please start an Android emulator or connect a device"
    echo "   Then run: adb devices"
    exit 1
fi

echo "✅ Found $DEVICES connected device(s)"

# Install APK
echo "📦 Installing APK..."
if adb install -r "$APK_PATH"; then
    echo "✅ APK installed successfully"
else
    echo "❌ APK installation failed"
    exit 1
fi

# Launch app
echo "🚀 Launching Melanin Click..."
if adb shell am start -n "$MAIN_ACTIVITY"; then
    echo "✅ App launched successfully"
else
    echo "❌ Failed to launch app"
    exit 1
fi

# Wait for app to start
echo "⏳ Waiting 5 seconds for app to initialize..."
sleep 5

# Check if app is running
if adb shell pidof "$PACKAGE_NAME" > /dev/null; then
    PID=$(adb shell pidof "$PACKAGE_NAME")
    echo "✅ App is running (PID: $PID)"
else
    echo "❌ App is not running - possible crash on startup"
    echo "📄 Recent logs:"
    adb logcat -d | tail -20
    exit 1
fi

# Basic functionality tests
echo ""
echo "🧪 Running Basic Tests..."
echo "========================"

# Test 1: Check memory usage
echo "1️⃣ Memory Usage Test:"
MEMORY=$(adb shell dumpsys meminfo "$PACKAGE_NAME" | grep "TOTAL" | awk '{print $2}')
if [ -n "$MEMORY" ] && [ "$MEMORY" -lt 500000 ]; then
    echo "   ✅ Memory usage: ${MEMORY}KB (< 500MB limit)"
else
    echo "   ⚠️  Memory usage: ${MEMORY}KB (check if excessive)"
fi

# Test 2: Check if UI is responsive
echo "2️⃣ UI Responsiveness Test:"
echo "   📱 Please manually check if the app UI is responsive"
echo "   📱 Can you navigate between screens? (y/n)"

# Test 3: Battery simulation
echo "3️⃣ Battery Management Test:"
echo "   🔋 Simulating low battery (15%)..."
adb shell dumpsys battery set level 15
sleep 2
echo "   🔋 Simulating normal battery (80%)..."
adb shell dumpsys battery set level 80
echo "   ✅ Battery simulation complete - check app response"

# Test 4: Background/Resume test
echo "4️⃣ Background/Resume Test:"
echo "   📱 Sending app to background..."
adb shell input keyevent KEYCODE_HOME
sleep 3
echo "   📱 Resuming app..."
adb shell am start -n "$MAIN_ACTIVITY"
sleep 2

if adb shell pidof "$PACKAGE_NAME" > /dev/null; then
    echo "   ✅ App survived background/resume cycle"
else
    echo "   ❌ App crashed during background/resume"
fi

# Test 5: Basic mining test
echo "5️⃣ Mining Interface Test:"
echo "   📱 Please manually test:"
echo "   • Can you access Solo Mining settings?"
echo "   • Do the mining controls respond?"
echo "   • Are there any crashes when starting/stopping mining?"

# Start log monitoring
echo ""
echo "📄 Starting Log Monitor..."
echo "========================="
echo "   📱 Use the app now - logs will appear below"
echo "   📱 Press Ctrl+C to stop logging and see summary"
echo ""

# Monitor logs with filtering
trap 'echo ""; echo "🏁 Testing Complete!"; cleanup_and_summary' INT

cleanup_and_summary() {
    # Reset battery to normal
    echo "🔋 Resetting battery simulation..."
    adb shell dumpsys battery reset
    
    echo ""
    echo "📊 Test Summary:"
    echo "==============="
    echo "✅ APK Installation: SUCCESS"
    echo "✅ App Launch: SUCCESS"
    echo "✅ Basic Functionality: MANUAL VERIFICATION NEEDED"
    echo ""
    echo "📄 To view detailed logs later, run:"
    echo "   adb logcat -s MelaninClick"
    echo ""
    echo "🎯 Next Steps:"
    echo "   1. Test mobile mining dashboard"
    echo "   2. Test battery management features"
    echo "   3. Test solo mining RPC connectivity"
    echo "   4. Test background services"
    echo ""
    echo "📋 For comprehensive testing, see: ANDROID_TESTING_SETUP.md"
    exit 0
}

# Live log monitoring
echo "🔍 Live Logs (MelaninClick + Errors):"
adb logcat | grep -E "(MelaninClick|Mining|Battery|ERROR|FATAL|AndroidRuntime)" --color=auto