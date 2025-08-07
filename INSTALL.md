# 📦 Melanin Click Installation Guide

Complete installation guide for Melanin Click cryptocurrency mining platform across all supported platforms.

## 🚀 Quick Installation (Recommended)

### Download Pre-built Releases

1. **Visit our [Releases Page](https://github.com/xyephy/melanin_click/releases)**
2. **Download for your platform:**
   - **Windows**: `melanin-click-windows.msi`
   - **macOS**: `melanin-click-macos.dmg`
   - **Linux**: `melanin-click-linux.deb` or `melanin-click-linux.AppImage`
   - **Android**: `melanin-click-android.apk`
3. **Install and run** following platform-specific instructions below

---

## 🖥️ Platform-Specific Installation

### Windows Installation

#### Option 1: MSI Installer (Recommended)
1. **Download** `melanin-click-windows.msi`
2. **Double-click** the installer
3. **Follow the setup wizard**
4. **Launch** from Start Menu or Desktop shortcut

#### Option 2: Portable Executable
1. **Download** `melanin-click-windows.exe`
2. **Run directly** - no installation required
3. **Optional**: Create shortcut for easier access

**Windows Requirements:**
- Windows 10 version 1809 or later
- Microsoft Visual C++ Redistributable (usually pre-installed)

### macOS Installation

#### DMG Installation
1. **Download** `melanin-click-macos.dmg`
2. **Double-click** to mount the disk image
3. **Drag** Melanin Click to Applications folder
4. **Launch** from Applications or Launchpad

**First Launch:** If you see "damaged and can't be opened" error:
- **Right-click** the app → **Open** → **Open** (bypass Gatekeeper)
- Or use terminal: `sudo xattr -rd com.apple.quarantine "/Applications/Melanin Click.app"`

**macOS Requirements:**
- macOS 10.13 High Sierra or later
- Both Intel and Apple Silicon (M1/M2) supported

### Linux Installation

#### Option 1: DEB Package (Ubuntu/Debian)
```bash
# Download the .deb file
wget https://github.com/xyephy/melanin_click/releases/latest/download/melanin-click-linux.deb

# Install
sudo dpkg -i melanin-click-linux.deb

# If dependencies missing, fix with:
sudo apt-get install -f

# Launch
melanin-click
```

#### Option 2: AppImage (Universal)
```bash
# Download AppImage
wget https://github.com/xyephy/melanin_click/releases/latest/download/melanin-click-linux.AppImage

# Make executable
chmod +x melanin-click-linux.AppImage

# Run
./melanin-click-linux.AppImage
```

**Linux Requirements:**
- Ubuntu 20.04+ or equivalent
- `libwebkit2gtk-4.1-0` (usually pre-installed)
- `libssl3` for HTTPS connections

### Android Installation

#### APK Installation
1. **Enable Unknown Sources:**
   - Settings → Security → Install Unknown Apps → Enable for your file manager
   - Or Settings → Apps & notifications → Special app access → Install unknown apps

2. **Download APK:**
   ```bash
   # Download directly on device
   wget https://github.com/xyephy/melanin_click/releases/latest/download/melanin-click-android.apk
   
   # Or via ADB from computer
   adb install melanin-click-android.apk
   ```

3. **Install APK:**
   - **Method 1**: Tap downloaded APK file → Install
   - **Method 2**: Use file manager → navigate to APK → Install
   - **Method 3**: Via ADB: `adb install melanin-click-android.apk`

4. **Launch Application:**
   - Find "Melanin Click" in app drawer
   - Tap to launch mobile mining interface

**Android Requirements:**
- Android 7.0 (API level 24) or higher
- 2GB RAM minimum, 4GB recommended
- 100MB free storage space
- ARM64 or ARMv7 processor architecture
- Network connectivity for mining pool connections

**Performance Notes:**
- Mobile mining is optimized for battery efficiency
- Thermal management prevents device overheating  
- Background mining requires battery optimization exemption
- Solo mining works with local or remote Bitcoin/Whive nodes

---

## 🛠️ Development Installation

### Prerequisites

Install these tools for development:

- **Node.js** 18+ and npm: [nodejs.org](https://nodejs.org)
- **Rust** 1.70+: [rustup.rs](https://rustup.rs)
- **Git**: [git-scm.com](https://git-scm.com)

#### Platform-Specific Dev Dependencies

**macOS:**
```bash
xcode-select --install  # Xcode Command Line Tools
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install build-essential curl wget file libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
```

**Windows:**
- Install [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022)
- Or Visual Studio Community with C++ tools

**Android Development (Optional):**
- **Android Studio**: [developer.android.com](https://developer.android.com/studio)
- **Android SDK**: API level 24+ (Android 7.0+)
- **Android NDK**: Version 29.0.13846066 or later
- **Java**: OpenJDK 17 or later

### Development Setup

1. **Clone the repository:**
```bash
git clone https://github.com/xyephy/melanin_click.git
cd melanin_click
```

2. **Set up environment:**
```bash
# Copy environment template
cp .env .env.local

# Edit .env.local with your configuration
nano .env.local  # or your preferred editor
```

3. **Navigate to Tauri project:**
```bash
cd melanin_click_tauri
```

4. **Install dependencies:**
```bash
npm install
```

5. **Run development server:**
```bash
npm run tauri:dev
```

6. **Build for production:**
```bash
npm run tauri:build
```

### Mobile Development Setup

**Android Development:**
```bash
# Install Android targets for Rust
rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android

# Install Tauri mobile CLI
cargo install tauri-cli --version "^2.0" --features=mobile

# Initialize Android project (if not already done)
npm run tauri android init

# Run on Android emulator
npm run tauri android dev

# Build Android APK
npm run tauri android build
```

**Android Environment Setup:**
```bash
# Set required environment variables
export ANDROID_HOME="$HOME/Android/Sdk"
export NDK_HOME="$ANDROID_HOME/ndk/29.0.13846066"
export PATH="$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools"
```

---

## ⚙️ Configuration & Environment Variables

### Required Environment Variables

Create `.env` file in project root with:

```bash
# Bitcoin Node RPC Configuration
BITCOIN_RPC_USER=melanin_rpc_user
BITCOIN_RPC_PASSWORD=your_secure_bitcoin_rpc_password_here
BITCOIN_RPC_HOST=127.0.0.1
BITCOIN_RPC_PORT=8332

# Whive Node RPC Configuration  
WHIVE_RPC_USER=whive_rpc_user  
WHIVE_RPC_PASSWORD=your_secure_whive_rpc_password_here
WHIVE_RPC_HOST=127.0.0.1
WHIVE_RPC_PORT=9332

# Application Security
APP_SECRET_KEY=your_app_secret_key_32_chars_long
SESSION_TIMEOUT=3600

# Mining Configuration
DEFAULT_MINING_THREADS=2
MAX_MINING_THREADS=8
MINING_INTENSITY=85

# Logging Configuration
LOG_LEVEL=info
LOG_FILE_PATH=logs/melanin_click.log
MAX_LOG_SIZE_MB=50
```

**⚠️ Security Note:** Never commit `.env` files to version control. Use unique passwords for production.

**📱 Mobile Note:** Android APK includes mobile-friendly default configuration values. Environment variables are optional on mobile devices and will use secure defaults if not provided.

### Data Directories

Melanin Click creates these directories:

- **Windows**: `%APPDATA%\Melanin Click\`
- **macOS**: `~/Library/Application Support/Melanin Click/`
- **Linux**: `~/.local/share/melanin-click/`
- **Android**: `/data/data/com.melaninclick.app/files/`

Directory contents:
- `logs/` - Application logs with rotation
- `miners/` - Downloaded mining executables
- `nodes/` - Bitcoin/Whive node data
- `config/` - User configuration files

---

## 🚀 Deployment

### Production Deployment

#### Automated Release Build
```bash
# Run comprehensive tests
./tests/run_tests.sh

# Build release version
cd melanin_click_tauri
npm run tauri:build:release

# Installers created in:
# - src-tauri/target/release/bundle/
```

#### Manual Deployment Steps

1. **Environment Setup:**
   - Set production environment variables
   - Configure secure RPC passwords
   - Set appropriate logging levels

2. **Build Process:**
   - Run full test suite
   - Build with production optimizations
   - Generate platform-specific installers

3. **Code Signing (Optional but Recommended):**
   - **macOS**: Sign with Apple Developer ID
   - **Windows**: Sign with Authenticode certificate
   - **Linux**: Sign with GPG key

4. **Distribution:**
   - Upload to GitHub Releases
   - Update download links
   - Test on clean systems

### CI/CD Pipeline

Our GitHub Actions automatically:
- ✅ Run tests on all platforms
- ✅ Build release binaries
- ✅ Generate installers
- ✅ Create GitHub releases

Pipeline triggers:
- **Push to `main`**: Development builds
- **Git tags**: Production releases
- **Pull requests**: Validation builds

---

## 🔧 Troubleshooting

### Common Installation Issues

#### "App is damaged" (macOS)
**Cause:** Unsigned application blocked by Gatekeeper
**Solution:** 
```bash
sudo xattr -rd com.apple.quarantine "/Applications/Melanin Click.app"
```

#### "DLL missing" (Windows)
**Cause:** Missing Visual C++ Redistributable
**Solution:** Install [Microsoft Visual C++ Redistributable](https://docs.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist)

#### "libwebkit2gtk not found" (Linux)
**Cause:** Missing WebKit2GTK dependency
**Solution:**
```bash
# Ubuntu/Debian
sudo apt install libwebkit2gtk-4.1-0

# Fedora
sudo dnf install webkit2gtk3

# Arch
sudo pacman -S webkit2gtk
```

#### "App not installed" (Android)
**Cause:** Architecture mismatch or insufficient storage
**Solution:**
```bash
# Check device architecture
adb shell getprop ro.product.cpu.abi

# Clear space and retry
adb shell pm clear com.melaninclick.app
adb install -r melanin-click-android.apk
```

#### "Parse error" (Android)
**Cause:** Corrupted APK download or incompatible Android version
**Solution:**
- Re-download APK from official releases
- Verify device meets Android 7.0+ requirement
- Check available storage space (100MB minimum)

### Development Issues

#### Rust compilation fails
```bash
# Update Rust toolchain
rustup update

# Clear cache
cargo clean

# Rebuild
cargo build
```

#### Node modules issues
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

#### Tests failing
```bash
# Run specific test categories
./tests/run_tests.sh

# Check test requirements
cargo test --verbose
npm run type-check
```

### Getting Help

- **GitHub Issues**: [Report bugs](https://github.com/xyephy/melanin_click/issues)
- **Documentation**: Check [README.md](README.md) and [docs/](docs/)
- **Contributing**: See [CONTRIBUTING.md](docs/CONTRIBUTING.md)
- **Security**: Report privately to maintainers

---

## 🎯 Post-Installation

### First Launch

1. **Complete onboarding wizard**
2. **Configure mining addresses**
3. **Select preferred mining pools**
4. **Test system connectivity**
5. **Start mining with one click!**

### Recommended Settings

- **Threads**: Start with 2 threads, adjust based on performance
- **Intensity**: 85% for balanced performance/temperature
- **Pool**: Use CKPool Solo for Bitcoin, Official pool for Whive
- **Monitoring**: Enable real-time statistics

### Next Steps

- **Read**: [Quick Start Guide](STARTUP_GUIDE.md)
- **Plan**: Review [Sprint Roadmap](TODO.md)
- **Contribute**: See [Contributing Guidelines](docs/CONTRIBUTING.md)

---

**Installation complete!** 🎉 Welcome to the Melanin Click mining community! ⛏️🚀