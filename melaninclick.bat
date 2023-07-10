@echo off
setlocal

REM Helper function to download and extract files
:download_and_extract
set url=%1
set tar_file=%2
echo Downloading %url%...
curl -LJO %url%
echo Extracting %tar_file%...
tar -zxvf %tar_file%
del %tar_file%
goto :eof

REM Welcome message
echo Welcome to Whive installation!

REM Prompt for user consent
set /p "answer=Do you agree to continue with the installation? (y/n) "
if /i "%answer%" neq "y" (
    echo Installation canceled.
    exit /b 1
)

REM Check available disk space
for /F "skip=1" %%G in ('wmic logicaldisk where "DeviceID='C:'" get FreeSpace /format:csv') do (
    set "disk_space=%%G"
    goto :check_space
)
:check_space
set disk_space=%disk_space:~0,-13%
if %disk_space% lss 5 (
    echo You do not have enough disk space to install Whive miner.
    echo Please free up at least 5GB of disk space and try again.
    exit /b 1
)

REM Prompt user for installation directory
set "install_path=%USERPROFILE%\whive-core"
set /p "custom_install_path=Enter the directory to install Whive (default: %install_path%): "
if "%custom_install_path%" neq "" (
    set "install_path=%custom_install_path%"
)

set "miner_install_path=%USERPROFILE%\whive-cpuminer-mc-yespower"
set /p "custom_miner_install_path=Enter the directory to install Whive miner (default: %miner_install_path%): "
if "%custom_miner_install_path%" neq "" (
    set "miner_install_path=%custom_miner_install_path%"
)

REM Create the directories if they do not exist
mkdir "%install_path%" 2>nul
mkdir "%miner_install_path%" 2>nul

REM Download, extract, and move Whive binary to installation directory
call :download_and_extract "https://github.com/whiveio/whive/releases/download/v2.22.1/whive-2.22.1-win64.zip" "whive-2.22.1-win64.zip"
move /Y "whive\*" "%install_path%"
rd /S /Q "whive"

REM Run Whive
start "" "%install_path%\whive-qt.exe"

REM Prompt user for consent to install miner
set /p "consent=This script will install Whive miner on your system. Do you wish to continue? (y/n) "
if /i "%consent%" neq "y" (
    echo Installation cancelled.
    exit /b 1
)

REM Install dependencies and build Whive miner (Not required for Windows)

cd "%miner_install_path%"
git clone https://github.com/whiveio/whive-cpuminer-mc-yespower.git
cd whive-cpuminer-mc-yespower
REM ./build.sh  (Not required for Windows)

REM Generate new address for miner
echo Getting new Whive address for mining
set "NEWADDRESS=%install_path%\whive-cli.exe getnewaddress"
echo Your New Whive Address: %NEWADDRESS%

REM Provide instructions for running the miner on Windows
echo To run the Whive Miner on Windows, navigate to the Whive Miner directory (%miner_install_path%) and run the following command:
echo minerd -a yespower -o stratum+tcp://206.189.2.17:3333 -u %NEWADDRESS%

echo Installation completed successfully. You can start mining by running the Whive Miner.

exit /b 0

:download_and_extract
set url=%~1
set tar_file=%~2
echo Downloading %url%...
curl -LJO %url%
echo Extracting %tar_file%...
tar -zxvf %tar_file%
del %tar_file%
goto :eof

