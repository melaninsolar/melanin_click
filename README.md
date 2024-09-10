
# Melanin Click: Your All-In-One Node & Miner Installer

Welcome to **Melanin Click**, a tool designed to simplify the setup process for running Whive, Bitcoin, and Lightning nodes and miners across multiple platforms. This guide will help you install and run Melanin Click on macOS, Linux, or Windows.

## Key Features

- **Easy Installation**: Run Whive, Bitcoin, and Lightning effortlessly with a single click.
- **Automatic Updates**: Keeps your cryptocurrency software up-to-date.
- **Enhanced Error Handling**: Comprehensive logging and robust error handling for seamless troubleshooting.
- **Performance Monitoring**: Provides real-time feedback on your Whive mining performance.
- **Interactive User Interface**: User-friendly GUI designed for users of all skill levels.
- **Cross-Platform**: Supports macOS, Linux, and Windows.

---

## Prerequisites

Ensure you have **Python 3.x** installed on your system. Instructions for installing Python and required dependencies are provided below.

### macOS

1. **Install Python**:
   - Download and install Python from [python.org](https://www.python.org/downloads/macos/), or use Homebrew:
     ```bash
     brew install python
     ```

2. **Install Homebrew** (if not already installed):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

3. **Install Tkinter and Dependencies**:
   ```bash
   brew install tcl-tk
   ```

4. **Set Environment Variables for Tkinter** (if necessary):
   ```bash
   export PATH="/usr/local/opt/tcl-tk/bin:$PATH"
   export LDFLAGS="-L/usr/local/opt/tcl-tk/lib"
   export CPPFLAGS="-I/usr/local/opt/tcl-tk/include"
   export PKG_CONFIG_PATH="/usr/local/opt/tcl-tk/lib/pkgconfig"
   ```

### Linux

1. **Install Python**:
   - For **Debian-based distributions** (e.g., Ubuntu):
     ```bash
     sudo apt update
     sudo apt install python3 python3-venv python3-pip
     ```

   - For **Red Hat-based distributions** (e.g., Fedora):
     ```bash
     sudo dnf install python3 python3-venv python3-pip
     ```

2. **Install Tkinter** (if not already installed):
   - On Ubuntu:
     ```bash
     sudo apt install python3-tk
     ```
   - On Fedora:
     ```bash
     sudo dnf install python3-tkinter
     ```

3. **Install Additional Dependencies**:
   ```bash
   sudo apt install wget zenity
   ```

### Windows

1. **Install Python**:
   - Download and install Python from [python.org](https://www.python.org/downloads/windows/).
   - Ensure you select "Add Python to PATH" during installation.

2. **Install Tkinter**:
   - Tkinter is usually included with Python on Windows. If not, you may need to run:
     ```bash
     pip install tk
     ```

3. **Install Additional Dependencies**:
   ```bash
   pip install wget
   ```

---

## Set Up the Environment

1. **Clone or Download Melanin Click Repository**

   - Clone the repository from GitHub:
     ```bash
     git clone https://github.com/melaninsolar/melanin_click.git
     ```
   - Navigate to the cloned directory:
     ```bash
     cd melanin_click
     ```

2. **(Optional) Set Up a Virtual Environment**

   It's recommended to use a virtual environment to manage dependencies.

   - **Create the virtual environment**:
     ```bash
     python3 -m venv venv
     ```
   - **Activate the virtual environment**:
     - On macOS and Linux:
       ```bash
       source venv/bin/activate
       ```
     - On Windows:
       ```bash
       venv\Scripts\activate
       ```

---

## Install Dependencies

Install the required Python packages directly, since there is no `requirements.txt` file.

1. **Install Required Python Packages**:

   ```bash
   pip install tkinter
   pip install pillow
   pip install wget
   pip install zenity
   ```

   - **Note for Windows Users**: If `zenity` is not available, you may need to adjust the script or use an alternative for dialog boxes.

---

## Run the Script

Once you've installed the dependencies and set up your environment, you can run the appropriate script for your operating system.

### macOS

```bash
python melaninclick_macos.py
```

### Linux

```bash
python melaninclick_linux.py
```

### Windows

```bash
python melaninclick_windows.py
```

---

## Create a Binary (Executable) for Various Platforms

If you want to create a standalone executable for your platform, you can use **PyInstaller**.

### Install PyInstaller

Install PyInstaller by running the following command (after activating your virtual environment, if applicable):

```bash
pip install pyinstaller
```

### Create a Binary for macOS

```bash
pyinstaller --onefile --icon=assets/icons/myicon.icns melaninclick_macos.py
```

### Create a Binary for Linux

```bash
pyinstaller --onefile --icon=assets/icons/myicon.png melaninclick_linux.py
```

### Create a Binary for Windows

```bash
pyinstaller --onefile --icon=assets/icons/myicon.ico melaninclick_windows.py
```

### Generated Executables

After running the appropriate command, the executable will be placed in the `dist` directory within your project folder.

---

## Troubleshooting

### Common Issues and Solutions

- **Tkinter Installation Issues**:
  - If Tkinter is not found, install `tk-dev` on Linux:
    ```bash
    sudo apt install tk-dev
    ```
  - On macOS, ensure that you have the correct paths set if you installed `tcl-tk` via Homebrew.

- **Permission Denied**:
  - If you encounter a "Permission Denied" error while running the script, make sure it is executable:
    ```bash
    chmod +x melaninclick_*.py
    ```

- **Pillow Compatibility**:
  - If Pillow (used for image handling in the GUI) is causing issues, try installing a specific version:
    ```bash
    pip install Pillow==8.0
    ```

- **Zenity Issues on Windows**:
  - Since `zenity` is not natively available on Windows, consider using an alternative like `tkinter` message boxes or `pywin32`.

---

## Contribution

We welcome contributions! If you want to contribute to the development of **Melanin Click**, please:

1. **Fork the Repository**:

   Click the "Fork" button at the top right corner of the repository page to create a copy in your GitHub account.

2. **Create a New Branch**:

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Your Changes**:

   Implement your feature or fix bugs.

4. **Commit and Push**:

   ```bash
   git add .
   git commit -m "Description of your changes"
   git push origin feature/your-feature-name
   ```

5. **Submit a Pull Request**:

   Go to your forked repository on GitHub and click "Compare & pull request".

If you have questions or suggestions, open an issue on GitHub or contact us via our community channels.

---

## Contact Us

If you encounter any issues or have questions, feel free to reach out through:

- **GitHub Issues**: [Create an issue](https://github.com/melaninsolar/melanin_click/issues)
- **Telegram Group**: [Join our community](https://t.me/melaninsolar)

Thank you for using **Melanin Click**! Happy mining!

---



**Disclaimer**: Please ensure you have read and agreed to the terms and conditions of each software before running this installation script. The software is provided "as is", without warranty of any kind.
