#!/bin/bash

# Melanin Click Development Launch Script
# This script sets up the environment and launches the application

echo "🚀 Launching Melanin Click Development Server..."
echo ""

# Add Rust to PATH if it exists
if [ -d "$HOME/.cargo/bin" ]; then
    export PATH="$HOME/.cargo/bin:$PATH"
fi

# Set required environment variables
export BITCOIN_RPC_PASSWORD="melanin_secure_2025_dev"
export RUST_LOG="info"

echo "✅ Environment variables set"
echo "   BITCOIN_RPC_PASSWORD: ${BITCOIN_RPC_PASSWORD:0:20}..."
echo "   RUST_LOG: $RUST_LOG"
echo ""

# Check if required tools are available
echo "🔧 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

if ! command -v cargo &> /dev/null; then
    echo "❌ Rust/Cargo is not installed"
    exit 1
fi

echo "✅ Node.js $(node --version) available"
echo "✅ Cargo $(cargo --version | cut -d' ' -f2) available"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

echo "🎯 Starting Tauri development server..."
echo ""
echo "The application will open automatically when ready."
echo "Press Ctrl+C to stop the development server."
echo ""

# Launch the application
npm run tauri:dev