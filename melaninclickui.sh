#!/bin/bash

# Check available disk space
available=$(df -Pk . | awk '{print $4}' | tail -n1)
if [[ "$available" -lt 5242880 ]]; then
    echo "You do not have enough disk space to proceed with the installation."
    exit 1
fi

# Prompt user for consent
zenity --question --title="Whive Miner Installation" --text="This script will install Whive miner on your system. Do you wish to continue?"
response=$?
if [[ $response -ne 0 ]]; then
  zenity --info --title="Installation Cancelled" --text="Installation cancelled."
  exit 1
fi

# Fetch terms and conditions from URL
terms_url="https://raw.githubusercontent.com/whiveio/whive/master/WHIVE_TERMS_AND_CONDITIONS.md"
terms=$(curl -s "$terms_url")

# Display terms and conditions in a scrollable dialog with checkbox
zenity --text-info --title="Whive Miner Installation" --checkbox="I agree to the terms and conditions" --width=700 --height=500 --ok-label="Install" --cancel-label="Cancel" --filename=<(echo -e "$terms")

# Check if user agreed to terms and conditions
if [[ $? -ne 0 ]]; then
  zenity --info --title="Installation Cancelled" --text="Installation cancelled."
  exit 1
fi

# Set installation path
INSTALL_PATH="$HOME/whive-core"

# Check if installation directory exists, create if it doesn't
if [ ! -d "$INSTALL_PATH" ]; then
    mkdir -p "$INSTALL_PATH"
fi

os_type=$(uname -s)

# Check the operating system
if [[ "$os_type" == "Darwin" ]]; then
    # macOS
    # Download and extract Whive binary for macOS
    zenity --info --text="Downloading Whive for macOS"
    curl -LJO https://github.com/whiveio/whive/releases/download/v2.22.1/whive-2.22.1-osx64.tar.gz | zenity --progress --pulsate --auto-close --no-cancel --title="Downloading Whive for macOS"
    zenity --info --text="Extracting Whive for macOS"
    tar -zxvf whive-2.22.1-osx64.tar.gz | zenity --progress --pulsate --auto-close --no-cancel --title="Extracting Whive for macOS"
    rm whive-2.22.1-osx64.tar.gz
    # Move Whive binary to installation directory
    mv whive/* "$INSTALL_PATH"
elif [[ "$os_type" == "Linux" ]]; then
    # Ubuntu
    #test for file existance
    FILE=whive-2.22.1-x86_64-linux-gnu.tar.gz
    if [ -f "$FILE" ]; then
       rm whive-2.22.1-x86_64-linux-gnu.tar.gz
    fi

    # Download and extract Whive binary for Linux/Ubuntu
    zenity --info --text="Downloading Whive for Linux/Ubuntu"
    curl -LJO https://github.com/whiveio/whive/releases/download/v2.22.1/whive-2.22.1-x86_64-linux-gnu.tar.gz | zenity --progress --pulsate --auto-close --no-cancel --title="Downloading Whive for Linux/Ubuntu"
    zenity --info --text="Extracting Whive for Linux/Ubuntu"
    tar -zxvf whive-2.22.1-x86_64-linux-gnu.tar.gz | zenity --progress --pulsate --auto-close --no-cancel --title="Extracting Whive for Linux/Ubuntu"
    rm whive-2.22.1-x86_64-linux-gnu.tar.gz
    # Move Whive binary to installation directory
    cp -r whive/* "$INSTALL_PATH"
else
    zenity --error --text="Unsupported operating system. Please install Whive manually."
    exit 1
fi

# Change directory to Whive installation path
cd "$INSTALL_PATH"

# Run Whive
$HOME/whive-core/bin/whive-qt &
