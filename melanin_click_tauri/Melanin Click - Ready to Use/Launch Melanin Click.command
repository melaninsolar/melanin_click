#!/bin/bash

# Melanin Click Production Launcher
# Double-click this file to launch Melanin Click

echo "🚀 Starting Melanin Click..."

# Set required environment variable for Bitcoin RPC security (minimum 16 characters)
export BITCOIN_RPC_PASSWORD="melanin_secure_2025_prod_password"

# Get the directory where this script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Launch the application
echo "✅ Environment configured"
echo "🎯 Launching application..."

# Use 'open' command to launch the app bundle properly
open "$DIR/Melanin Click.app"

# Keep terminal open briefly to show success message
echo "✨ Melanin Click launched successfully!"
echo "You can now close this terminal window."
echo ""
echo "The application is running independently."

# Wait a few seconds so user can see the message
sleep 3