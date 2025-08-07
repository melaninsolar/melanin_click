#!/bin/bash

# Melanin Click Debug Startup Script
# This script provides enhanced debugging for Tauri application startup issues

set -e

echo "🔧 Melanin Click Debug Startup Script"
echo "======================================"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check port availability
check_port() {
    local port=$1
    if lsof -i :$port >/dev/null 2>&1; then
        echo "✅ Port $port is in use"
        lsof -i :$port
    else
        echo "❌ Port $port is not in use"
    fi
}

# Pre-flight checks
echo ""
echo "🔍 Pre-flight Checks:"
echo "----------------------"

# Check Node.js
if command_exists node; then
    echo "✅ Node.js: $(node --version)"
else
    echo "❌ Node.js not found"
    exit 1
fi

# Check npm
if command_exists npm; then
    echo "✅ npm: $(npm --version)"
else
    echo "❌ npm not found"
    exit 1
fi

# Check Rust
if command_exists rustc; then
    echo "✅ Rust: $(rustc --version)"
else
    echo "❌ Rust not found"
    exit 1
fi

# Check Cargo
if command_exists cargo; then
    echo "✅ Cargo: $(cargo --version)"
else
    echo "❌ Cargo not found"
    exit 1
fi

# Check Tauri CLI
if command_exists cargo-tauri; then
    echo "✅ Tauri CLI: $(cargo tauri --version)"
else
    echo "❌ Tauri CLI not found"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Not in Tauri project directory"
    echo "Please run this script from the melanin_click_tauri directory"
    exit 1
fi

echo "✅ Directory: $(pwd)"

# Check dependencies
echo ""
echo "📦 Dependency Checks:"
echo "--------------------"

if [ -d "node_modules" ]; then
    echo "✅ Node modules installed"
else
    echo "❌ Node modules missing, installing..."
    npm install
fi

if [ -d "src-tauri/target" ]; then
    echo "✅ Rust target directory exists"
else
    echo "ℹ️  Rust target directory will be created on first build"
fi

# Port checks
echo ""
echo "🌐 Port Status:"
echo "---------------"
check_port 1420

# Environment checks
echo ""
echo "🔧 Environment:"
echo "---------------"
echo "OS: $(uname -s)"
echo "Architecture: $(uname -m)"

if [ "$(uname -s)" = "Darwin" ]; then
    echo "Platform: macOS"
    echo "macOS Version: $(sw_vers -productVersion)"
fi

# Check for existing processes
echo ""
echo "🔄 Process Status:"
echo "------------------"
if pgrep -f "melanin-click" >/dev/null; then
    echo "⚠️  Existing melanin-click processes found:"
    pgrep -f "melanin-click" | while read pid; do
        echo "  PID: $pid - $(ps -p $pid -o comm=)"
    done
    echo "Killing existing processes..."
    pkill -f "melanin-click" || true
    sleep 2
else
    echo "✅ No existing melanin-click processes"
fi

# Set debug environment
export RUST_LOG=debug
export RUST_BACKTRACE=1

echo ""
echo "🚀 Starting Tauri Application with Debug Logging:"
echo "================================================="
echo "Environment variables set:"
echo "  RUST_LOG=debug"
echo "  RUST_BACKTRACE=1"
echo ""
echo "Logs will be written to: logs/melanin_click.log"
echo "Press Ctrl+C to stop the application"
echo ""

# Create logs directory
mkdir -p logs

# Start the application
npm run tauri:dev