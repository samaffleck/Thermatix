@echo off
setlocal enabledelayedexpansion

REM ---------------------------
REM 1. Navigate to the cpp folder
REM ---------------------------
cd /d "../gui"

REM ---------------------------
REM 2. Ensure build_wasm exists
REM ---------------------------
if not exist build_wasm (
    mkdir build_wasm
)

REM ---------------------------
REM 4. Run emcmake / cmake to configure
REM    Use 'call' so this script continues afterwards
REM ---------------------------
call emcmake cmake -S . -B build_wasm -DCMAKE_BUILD_TYPE=Release

REM Check errorlevel in case something failed
if errorlevel 1 (
    echo [ERROR] CMake configuration failed
    exit /b 1
)

REM ---------------------------
REM 5. Build with CMake
REM    Again, use 'call' so script doesn't exit
REM ---------------------------
call cmake --build build_wasm --config Release

if errorlevel 1 (
    echo [ERROR] Build failed
    exit /b 1
)

REM ---------------------------
REM 6. Copy necessary artifacts
REM ---------------------------
copy /Y "build_wasm\thermo_plot.html" "..\public\wasm_app\"
copy /Y "build_wasm\thermo_plot.js"   "..\public\wasm_app\"
copy /Y "build_wasm\thermo_plot.wasm" "..\public\wasm_app\"
copy /Y "build_wasm\thermo_plot.data" "..\public\wasm_app\"

echo Build and copy complete!

endlocal
