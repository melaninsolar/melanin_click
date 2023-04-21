#!/bin/bash

# Welcome message
echo "Welcome to Whive installation!"

# Prompt for user consent
read -p "Do you agree to continue with the installation? (y/n) " answer
if [[ "$answer" != "y" ]]; then
    echo "Installation canceled."
    exit 1
fi

# Check available disk space
disk_space=$(df -BG --output=avail / | awk 'NR==2 {print $1}' | sed 's/G//')
if [[ "$disk_space" -lt "5" ]]; then
    echo "You do not have enough disk space to install Whive miner."
    echo "Please free up at least 5GB of disk space and try again."
    exit 1
fi

# Determine OS type
os_type=$(uname)

# Determine installation path
install_path="$HOME/whive-core"
mkdir -p "$install_path"

# Check dependencies
echo "Checking dependencies..."
if [[ "$os_type" == "Linux" ]]; then
    dependencies=("git" "build-essential" "libcurl4-openssl-dev")
    missing=()
    for dep in "${dependencies[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            missing+=("$dep")
        fi
    done
    if [[ ${#missing[@]} -gt 0 ]]; then
        echo "The following dependencies are missing and need to be installed: ${missing[*]}"
        read -p "Do you want to install them now? (y/n) " dep_answer
        if [[ "$dep_answer" == "y" ]]; then
            sudo apt-get update && sudo apt-get install -y "${missing[@]}"
        else
            echo "Installation canceled."
            exit 1
        fi
    fi
elif [[ "$os_type" == "Darwin" ]]; then
    dependencies=("git" "brew" "autoconf" "automake" "curl")
    missing=()
    for dep in "${dependencies[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            missing+=("$dep")
        fi
    done
    if [[ ${#missing[@]} -gt 0 ]]; then
        echo "The following dependencies are missing and need to be installed: ${missing[*]}"
        read -p "Do you want to install them now? (y/n) " dep_answer
        if [[ "$dep_answer" == "y" ]]; then
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            brew install "${missing[@]}"
        else
            echo "Installation canceled."
            exit 1
        fi
    fi
else
    echo "Unsupported OS: $os_type"
    exit 1
fi

# Check the operating system
if [[ "$($os_type)" == "Darwin" ]]; then
    # macOS
    # Download and extract Whive binary for macOS
    curl -LJO https://github.com/whiveio/whive/releases/download/v2.22.1/whive-2.22.1-osx64.tar.gz
    tar -zxvf whive-2.22.1-osx64.tar.gz
    rm whive-2.22.1-osx64.tar.gz
    # Move Whive binary to installation directory
    mv whive/* "$install_path"
elif [[ "$($os_type)" == "Linux" ]]; then
    # Ubuntu
    #test for file existance
    FILE=whive-2.22.1-x86_64-linux-gnu.tar.gz
    if [ -f "$FILE" ]; then
       rm whive-2.22.1-x86_64-linux-gnu.tar.gz
    fi

    # Download and extract Whive binary for Linux/Ubuntu
    curl -LJO https://github.com/whiveio/whive/releases/download/v2.22.1/whive-2.22.1-x86_64-linux-gnu.tar.gz
    tar -zxvf whive-2.22.1-x86_64-linux-gnu.tar.gz
    rm whive-2.22.1-x86_64-linux-gnu.tar.gz
    # Move Whive binary to installation directory
    cp -r whive/* "$install_path"

else
    echo "Unsupported operating system. Please install Whive manually."
    exit 1
fi

# Run Whive
$HOME/whive-core/bin/whive-qt &

# Note: Update the command to run Whive based on your specific requirements
# For example, you may need to use a different binary or options depending on your setup

# Create desktop shortcut
if [[ "$(uname -s)" == "Linux" ]]; then
    curl -o "$install_path/whive.png" https://raw.githubusercontent.com/whiveio/whive/master/src/qt/res/icons/whive.png
    # Create .desktop file for Linux
    echo -e "[Desktop Entry]\nType=Application\nName=Whive\nExec=$install_path/bin/whive-qt\nIcon=$install_path/whive.png\nTerminal=false" > "$HOME/Desktop/whive.desktop"
    gio set  "$HOME/Desktop/whive.desktop" metadata::trusted true
    chmod +x "$HOME/Desktop/whive.desktop"
elif [[ "$(uname)" == "Darwin" ]]; then
    # Download whive.icns file from GitHub repository into install directory
    curl -o "$install_path/whive.icns" https://raw.githubusercontent.com/whiveio/whive/master/src/qt/res/icons/whive.icns

    # Create Whive.app file for macOS
    mkdir -p "$HOME/Desktop/Whive.app/Contents/MacOS"
    mkdir -p "$HOME/Desktop/Whive.app/Contents/Resources"
    echo -e "#!/bin/bash\n$install_path/bin/whive-qt &" > "$HOME/Desktop/Whive.app/Contents/MacOS/Whive"
    chmod +x "$HOME/Desktop/Whive.app/Contents/MacOS/Whive"
    cp "$install_path/whive.icns" "$HOME/Desktop/Whive.app/Contents/Resources/Icon.icns"

    # Set icon for .app file
    /usr/bin/SetFile -a C "$HOME/Desktop/Whive.app"

    # Cleanup
    rm "$install_path/whive.icns"
    # Create .command file for macOS
    #echo -e "#!/bin/bash\n$install_path/bin/whive-qt &" > "$HOME/Desktop/whive.command"
    #chmod +x "$HOME/Desktop/whive.command"
fi

# Prompt user for consent
read -p "This script will install Whive miner on your system. Do you wish to continue? (y/n) " consent
if [[ ! "$consent" =~ ^[Yy]$ ]]; then
    echo "Installation cancelled."
    exit 1
fi

# Determine operating system
os_type=$(uname -s)
if [[ "$os_type" == "Linux" ]]; then
    # Install dependencies on Ubuntu/Linux
    sudo apt update
    sudo apt install -y build-essential git automake autoconf pkg-config libcurl4-openssl-dev libjansson-dev libssl-dev libgmp-dev zlib1g-dev
elif [[ "$os_type" == "Darwin" ]]; then
    # Install dependencies on macOS
    brew update
    brew install automake autoconf pkg-config libtool curl openssl@1.1 jansson gmp
else
    echo "Unsupported OS: $os_type"
    exit 1
fi

# Download and build Whive miner
cd ~
if [[ ! -d "whive-cpuminer-mc-yespower" ]]; then
    git clone https://github.com/whiveio/whive-cpuminer-mc-yespower.git
fi
cd whive-cpuminer-mc-yespower
if [[ "$os_type" == "Linux" ]]; then
    # Ubuntu/Linux
    ./build.sh
elif [[ "$os_type" == "Darwin" ]]; then
    # macOS
    if [[ ! -d "MacOs-cpuminer-mc-yespower" ]]; then
        git clone https://github.com/whiveio/MacOs-cpuminer-mc-yespower.git
    fi
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
echo " Getting new Whive address for mining"
nwd="$install_path/bin/whive-cli"
NEWADDRESS=`$nwd getnewaddress`
echo "You New whive Address: "$NEWADDRESS


# Create desktop shortcut for the miner
if [[ "$os_type" == "Linux" ]]; then
    # Ubuntu/Linux
    cat > ~/Desktop/Whive.desktop <<EOL
[Desktop Entry]
Name=Whive Miner
Comment=Whive Miner
Exec=gnome-terminal --working-directory=$HOME/whive-cpuminer-mc-yespower -e './minerd -a yespower -o stratum+tcp://206.189.2.17:3333 -u $NEWADDRESS.w1 -t 1'
Icon=$HOME/whive-cpuminer-mc-yespower/miner_icon.png
Terminal=false
Type=Application
EOL
    chmod +x ~/Desktop/Whive.desktop
    echo "Desktop shortcut created at ~/Desktop/Whive.desktop"
elif [[ "$os_type" == "Darwin" ]]; then
    # macOS
    cat > ~/Desktop/Whive.command <<EOL
#!/bin/bash
cd ~/whive-cpuminer-mc-yespower/MacOs-cpuminer-mc-yespower
./minerd -a yespower -o stratum+tcp://206.189.2.17:3333 -u $NEWADDRESS.w1 -t 1
EOL
    chmod +x ~/Desktop/Whive.command
    echo "Desktop shortcut created at ~/Desktop/Whive.command"
fi

# Clean up binaries
#cd ~/whive-cpuminer-mc-yes

echo "Whive and the miner have been successfully installed."
echo "You can run Whive by using the desktop shortcut created on your desktop."

