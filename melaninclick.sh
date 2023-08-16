#!/bin/bash

set -e

# Helper function to download and extract files
download_and_extract() {
    local url="$1"
    local tar_file="$2"
    echo "Downloading $url..."
    if ! curl -LJO "$url"; then
        echo "Failed to download $url"
        exit 1
    fi
    echo "Extracting $tar_file..."
    if ! tar -zxvf "$tar_file"; then
        echo "Failed to extract $tar_file"
        exit 1
    fi
    rm "$tar_file"
}

# Welcome message
echo "Welcome to Whive installation!"

# Prompt for user consent
read -p "Do you agree to continue with the installation? (y/n) " answer
if [[ "$answer" != "y" ]]; then
    echo "Installation canceled."
    exit 1
fi

# Check available disk space
disk_space=$(df -k / | awk 'NR==2 {print $4}')
required_space=5000000  # 5GB in kilobytes

if [[ "$disk_space" -lt "$required_space" ]]; then
    echo "You do not have enough disk space to install Whive miner."
    echo "Please free up at least 5GB of disk space and try again."
    exit 1
fi

# Determine OS type
os_type=$(uname)

# Prompt user for installation directory
read -p "Enter the directory to install Whive (default: $HOME/whive-core): " install_path
install_path=${install_path:-"$HOME/whive-core"}

read -p "Enter the directory to install Whive miner (default: $HOME/whive-cpuminer-mc-yespower): " miner_install_path
miner_install_path=${miner_install_path:-"$HOME/whive-cpuminer-mc-yespower"}

# Create the directories if they do not exist
mkdir -p "$install_path"
mkdir -p "$miner_install_path"

# Check dependencies
echo -n "Checking dependencies..."
if [[ "$os_type" == "Linux" ]]; then
    dependencies=("git" "build-essential" "libcurl4-openssl-dev")
    missing=()
    for dep in "${dependencies[@]}"; do
        if ! dpkg -l "$dep" &> /dev/null; then
            missing+=("$dep")
        fi
    done
elif [[ "$os_type" == "Darwin" ]]; then
    dependencies=("git" "brew" "autoconf" "automake" "curl")
    missing=()
    for dep in "${dependencies[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            missing+=("$dep")
        fi
    done
fi

# If dependencies are missing, prompt to install them
if [[ ${#missing[@]} -gt 0 ]]; then
    echo "The following dependencies are missing and need to be installed: ${missing[*]}"
    read -p "Do you want to install them now? (y/n) " dep_answer
    if [[ "$dep_answer" == "y" ]]; then
        if [[ "$os_type" == "Linux" ]]; then
            sudo apt-get update && sudo apt-get install -y "${missing[@]}"
        elif [[ "$os_type" == "Darwin" ]]; then
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            brew install "${missing[@]}"
        fi
    else
        echo "Installation canceled."
        exit 1
    fi
else
    echo "OK"
fi

# Download, extract, and move Whive binary to installation directory
if [[ "$os_type" == "Darwin" ]]; then
    download_and_extract "https://github.com/whiveio/whive/releases/download/v2.22.1/whive-2.22.1-osx64.tar.gz" "whive-2.22.1-osx64.tar.gz"
elif [[ "$os_type" == "Linux" ]]; then
    download_and_extract "https://github.com/whiveio/whive/releases/download/v2.22.1/whive-2.22.1-x86_64-linux-gnu.tar.gz" "whive-2.22.1-x86_64-linux-gnu.tar.gz"
else
    echo "Unsupported operating system. Please install Whive manually."
    exit 1
fi

mv whive/* "$install_path"

# Run Whive
"$install_path/bin/whive-qt" &

# Prompt user for consent to install miner
read -p "This script will install Whive miner on your system. Do you wish to continue? (y/n) " consent
if [[ ! "$consent" =~ ^[Yy]$ ]]; then
    echo "Installation cancelled."
    exit 1
fi

# Install dependencies and build Whive miner
if [[ "$os_type" == "Linux" ]]; then
    sudo apt update
    sudo apt install -y build-essential git automake autoconf pkg-config libcurl4-openssl-dev libjansson-dev libssl-dev libgmp-dev zlib1g-dev
elif [[ "$os_type" == "Darwin" ]]; then
    brew update
    brew install automake autoconf pkg-config libtool curl openssl@1.1 jansson gmp
else
    echo "Unsupported OS: $os_type"
    exit 1
fi

cd "$miner_install_path"
git clone https://github.com/whiveio/whive-cpuminer-mc-yespower.git
cd whive-cpuminer-mc-yespower
if [[ "$os_type" == "Linux" ]]; then
    ./build.sh
elif [[ "$os_type" == "Darwin" ]]; then
    git clone https://github.com/whiveio/MacOs-cpuminer-mc-yespower.git
    cd MacOs-cpuminer-mc-yespower
    ./autogen.sh
    ./nomacro.pl
    ./configure CFLAGS="-O3 -march=native -funroll-loops -fomit-frame-pointer"
    make
else
    echo "Unsupported OS: $os_type"
    exit 1
fi

# Generate new address for miner
echo "Getting new Whive address for mining"
NEWADDRESS=$("$install_path/bin/whive-cli" getnewaddress)
echo "You New whive Address: $NEWADDRESS"

# Create desktop shortcut for the miner
if [[ "$os_type" == "Linux" ]]; then
    curl -o "$miner_install_path/whive-miner.png" https://raw.githubusercontent.com/whiveio/whive/master/src/qt/res/icons/whive-miner.png
    cat > ~/Desktop/Whive-miner.desktop <<EOL
[Desktop Entry]
Name=Whive Miner
Comment=Whive Miner
Exec=gnome-terminal --working-directory="$miner_install_path" --title="$NEWADDRESS"  -e './minerd -a yespower -
o stratum+tcp://206.189.2.17:3333 -u $NEWADDRESS'
Icon=$miner_install_path/whive-miner.png
Terminal=false
Type=Application
EOL
chmod +x ~/Desktop/Whive-miner.desktop
elif [[ "$os_type" == "Darwin" ]]; then
    echo "Creating shortcut is not supported on macOS. You can run the miner from the terminal with the following command:"
    echo "cd $miner_install_path && ./minerd -a yespower -o stratum+tcp://206.189.2.17:3333 -u $NEWADDRESS"
else
    echo "Unsupported OS: $os_type"
    exit 1
fi

echo "Installation completed successfully. You can start mining by running the Whive Miner."

