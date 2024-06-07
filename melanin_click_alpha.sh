#!/bin/bash

# ========================================================================
# melanin_click_alpha.sh
# This script installs the Whive wallet and Whive miner on a Linux system.
# It ensures necessary dependencies are installed, downloads the required
# files, and sets up the Whive wallet and miner.
# ========================================================================

set -e

LOGFILE="$HOME/whive_install.log"

# Function to log messages
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') : $1" | tee -a "$LOGFILE"
}

# Function to download and extract files
download_and_extract() {
    local url="$1"
    local tar_file="$2"
    local extract_dir="$3"
    log "Checking if $extract_dir already exists..."

    if [ -d "$extract_dir" ]; then
        log "$extract_dir already exists. Skipping download and extraction."
        return
    fi

    log "Downloading $url..."

    # Check if aria2 is installed, if not, install it
    if ! command -v aria2c &> /dev/null
    then
        log "aria2 not found, installing..."
        sudo apt update
        sudo apt install -y aria2
    fi

    # Download using aria2
    if ! aria2c -x 16 -s 16 -k 1M -o "$tar_file" "$url"; then
        log "Failed to download $url"
        echo "Failed to download $url"
        exit 1
    fi

    log "Extracting $tar_file..."
    if ! tar -zxvf "$tar_file"; then
        log "Failed to extract $tar_file"
        echo "Failed to extract $tar_file"
        exit 1
    fi
    rm "$tar_file"
}

# Welcome message
log "Welcome to Whive installation!"

# Disclaimer
echo "DISCLAIMER: This script will install software on your system. Ensure you have sufficient permissions and have backed up your important data. Proceeding indicates acceptance of any risks involved."
read -p "Do you agree to continue with the installation? (y/n) " answer
if [[ "$answer" != "y" ]]; then
    log "Installation canceled."
    echo "Installation canceled."
    exit 1
fi

# Check available disk space
disk_space=$(df -k / | awk 'NR==2 {print $4}')
required_space=5000000  # 5GB in kilobytes

if [[ "$disk_space" -lt "$required_space" ]]; then
    log "You do not have enough disk space to install Whive miner."
    echo "You do not have enough disk space to install Whive miner. Please free up at least 5GB of disk space and try again."
    exit 1
fi

# Prompt user for installation directory
read -p "Enter the directory to install Whive (default: $HOME/whive-core): " install_path
install_path=${install_path:-"$HOME/whive-core"}

read -p "Enter the directory to install Whive miner (default: $HOME/whive-cpuminer-mc-yespower): " miner_install_path
miner_install_path=${miner_install_path:-"$HOME/whive-cpuminer-mc-yespower"}

# Create the directories if they do not exist
mkdir -p "$install_path"
mkdir -p "$miner_install_path"

# Check dependencies
log "Checking dependencies..."
dependencies=("git" "build-essential" "libcurl4-openssl-dev")
missing=()
for dep in "${dependencies[@]}"; do
    if ! dpkg -l "$dep" &> /dev/null; then
        missing+=("$dep")
    fi
done

# If dependencies are missing, prompt to install them
if [[ ${#missing[@]} -gt 0 ]]; then
    log "The following dependencies are missing and need to be installed: ${missing[*]}"
    echo "The following dependencies are missing and need to be installed: ${missing[*]}"
    read -p "Do you want to install them now? (y/n) " dep_answer
    if [[ "$dep_answer" == "y" ]]; then
        sudo apt-get update && sudo apt-get install -y "${missing[@]}"
    else
        log "Installation canceled."
        echo "Installation canceled."
        exit 1
    fi
else
    log "All dependencies are satisfied."
fi

# Download, extract, and move Whive binary to installation directory
download_and_extract "https://github.com/whiveio/whive/releases/download/22.2.2/whive-22.2.2-x86_64-linux-gnu.tar.gz" "whive-22.2.2-x86_64-linux-gnu.tar.gz" "$install_path"

# Run Whive
log "Starting Whive..."
"$install_path/bin/whive-qt" &

# Wait for Whive to start
log "Waiting for Whive to start..."
sleep 30  # Adjust this sleep time if needed

# Load the default wallet
log "Loading default wallet..."
"$install_path/bin/whive-cli" loadwallet ""

# Prompt user for consent to install miner
read -p "This script will install Whive miner on your system. Do you wish to continue? (y/n) " consent
if [[ ! "$consent" =~ ^[Yy]$ ]]; then
    log "Installation cancelled."
    echo "Installation cancelled."
    exit 1
fi

# Install dependencies and build Whive miner
log "Installing miner dependencies..."
sudo apt update
sudo apt install -y build-essential git automake autoconf pkg-config libcurl4-openssl-dev libjansson-dev libssl-dev libgmp-dev zlib1g-dev

cd "$miner_install_path"
if [ ! -d "whive-cpuminer-mc-yespower" ]; then
    git clone https://github.com/whiveio/whive-cpuminer-mc-yespower.git
fi
cd whive-cpuminer-mc-yespower
./build.sh

# Generate new address for miner
log "Getting new Whive address for mining"
NEWADDRESS=$("$install_path/bin/whive-cli" getnewaddress)
log "Your new Whive address: $NEWADDRESS"
echo "Your new Whive address: $NEWADDRESS"

# Create desktop shortcut for the miner
log "Creating desktop shortcut for Whive miner..."
curl -o "$miner_install_path/whive-miner.png" https://raw.githubusercontent.com/whiveio/whive/master/src/qt/res/icons/whive-miner.png
cat > ~/Desktop/Whive-miner.desktop <<EOL
[Desktop Entry]
Name=Whive Miner
Comment=Whive Miner
Exec=gnome-terminal --working-directory="$miner_install_path" --title="$NEWADDRESS"  -e './minerd -a yespower -o stratum+tcp://206.189.2.17:3333 -u $NEWADDRESS'
Icon=$miner_install_path/whive-miner.png
Terminal=false
Type=Application
EOL
chmod +x ~/Desktop/Whive-miner.desktop

log "Installation completed successfully. You can start mining by running the Whive Miner."
echo "Installation completed successfully. You can start mining by running the Whive Miner."
