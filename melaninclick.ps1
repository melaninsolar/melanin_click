# Welcome message
Write-Host "Welcome to Whive installation!"

# Prompt for user consent
$answer = Read-Host "Do you agree to continue with the installation? (y/n)"
if ($answer -ne "y") {
    Write-Host "Installation canceled."
    exit 1
}

# Check available disk space
$disk_space = Get-WmiObject Win32_LogicalDisk | Where-Object {$_.DeviceID -eq 'C:'} | Select-Object FreeSpace
if ($disk_space.FreeSpace -lt 5GB) {
    Write-Host "You do not have enough disk space to install Whive miner."
    Write-Host "Please free up at least 5GB of disk space and try again."
    exit 1
}

# Prompt user for installation directory
$install_path = "$env:USERPROFILE\whive-core"
$custom_install_path = Read-Host "Enter the directory to install Whive (default: $install_path): "
if ($custom_install_path -ne "") {
    $install_path = $custom_install_path
}

$miner_install_path = "$env:USERPROFILE\whive-cpuminer-mc-yespower"
$custom_miner_install_path = Read-Host "Enter the directory to install Whive miner (default: $miner_install_path): "
if ($custom_miner_install_path -ne "") {
    $miner_install_path = $custom_miner_install_path
}

# Create the directories if they do not exist
New-Item -ItemType Directory -Path $install_path -ErrorAction SilentlyContinue | Out-Null
New-Item -ItemType Directory -Path $miner_install_path -ErrorAction SilentlyContinue | Out-Null

# Helper function to download and extract files
function DownloadAndExtract {
    param([string]$url, [string]$tar_file)
    Write-Host "Downloading $url..."
    (New-Object System.Net.WebClient).DownloadFile($url, $tar_file)
    Write-Host "Extracting $tar_file..."
    Expand-Archive -Path $tar_file -DestinationPath (Split-Path $tar_file -Parent)
    Remove-Item $tar_file
}

# Download, extract, and move Whive binary to installation directory
DownloadAndExtract "https://github.com/whiveio/whive/releases/download/v2.22.1/whive-2.22.1-win64.zip" "$env:TEMP\whive-2.22.1-win64.zip"
Move-Item -Path "$env:TEMP\whive\*" -Destination $install_path -Force
Remove-Item -Path "$env:TEMP\whive" -Recurse

# Run Whive
Start-Process -FilePath "$install_path\whive-qt.exe"

# Prompt user for consent to install miner
$consent = Read-Host "This script will install Whive miner on your system. Do you wish to continue? (y/n)"
if ($consent -ne "y") {
    Write-Host "Installation canceled."
    exit 1
}

# Generate new address for miner
Write-Host "Getting new Whive address for mining"
$NEWADDRESS = "$install_path\whive-cli.exe getnewaddress"
Write-Host "Your New Whive Address: $NEWADDRESS"

# Provide instructions for running the miner on Windows
Write-Host "To start mining with the Whive Miner, navigate to the Whive Miner directory ($miner_install_path) and run the following command:"
$miningCommand = "$miner_install_path\minerd.exe -a yespower -o stratum+tcp://206.189.2.17:3333 -u $NEWADDRESS"
Write-Host $miningCommand

Write-Host "Installation completed successfully. You can start mining by running the Whive Miner."

