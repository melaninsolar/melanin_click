#!/bin/bash

# Set installation path
INSTALL_PATH="$HOME/whive-core"

# Check if installation directory exists, create if it doesn't
if [ ! -d "$INSTALL_PATH" ]; then
    mkdir -p "$INSTALL_PATH"
fi

# Check the operating system
if [[ "$(uname)" == "Darwin" ]]; then
    # macOS
    # Download and extract Whive binary for macOS
    curl -LJO https://github.com/whiveio/whive/releases/download/v2.22.1/whive-2.22.1-osx64.tar.gz
    tar -zxvf whive-2.22.1-osx64.tar.gz
    rm whive-2.22.1-osx64.tar.gz
    # Move Whive binary to installation directory
    mv whive/* "$INSTALL_PATH"

    # Install CPU miner for macOS
    git clone https://github.com/whiveio/MacOs-cpuminer-mc-yespower
    brew install curl autoconf automake
    cd MacOs-cpuminer-mc-yespower
    ./autogen.sh
    ./nomacro.pl
    ./configure CFLAGS="-O3 -march=native -funroll-loops -fomit-frame-pointer"
    make
    # Move CPU miner to installation directory
    mv cpuminer "$INSTALL_PATH"

elif [[ "$(uname -s)" == "Linux" ]]; then
    # Ubuntu
    # Download and extract Whive binary for Linux/Ubuntu
    curl -LJO https://github.com/whiveio/whive/releases/download/v2.22.1/whive-2.22.1-x86_64-linux-gnu.tar.gz
    tar -zxvf whive-2.22.1-x86_64-linux-gnu.tar.gz
    rm whive-2.22.1-x86_64-linux-gnu.tar.gz
    # Move Whive binary to installation directory
    mv whive/* "$INSTALL_PATH"

    # Install CPU miner for Ubuntu/Linux
    cd && \
    git clone https://github.com/whiveio/whive-cpuminer-mc-yespower.git && \
    cd whive-cpuminer-mc-yespower && \
    sudo apt-get install build-essential libcurl4-openssl-dev && \
    ./build.sh
    # Move CPU miner to installation directory
    mv cpuminer "$INSTALL_PATH"

else
    echo "Unsupported operating system. Please install Whive and the CPU miner manually."
    exit 1
fi

# Change directory to Whive installation path
cd "$INSTALL_PATH"

# Run Whive
./whive-core/bin/whive-qt &

# Note: Update the command to run Whive based on your specific requirements
# For example, you may need to use a different binary or options depending on your setup

# Create desktop shortcut
if [[ "$(uname -s)" == "Linux" ]]; then
    # Create .desktop file for Linux
    echo -e "[Desktop Entry]\nType=Application\nName=Whive\nExec=$INSTALL_PATH/whive-core/bin/whive-qt\nIcon=$INSTALL_PATH/whive-core/share/pixmaps/whive.png\nTerminal=false" > "$HOME/Desktop/whive.desktop"
    chmod +x "$HOME/Desktop/whive.desktop"
elif [[ "$(uname)" == "Darwin" ]]; then
    # Create .command file for macOS
    echo -e "#!/bin/bash\n$INSTALL_PATH/whive-core/bin/whive-qt &" > "$HOME/Desktop/whive.command"
    chmod +x "$HOME/Desktop/whive.command"
fi
