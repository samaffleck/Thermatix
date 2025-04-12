#!/bin/bash

# Get the absolute path to the script's directory and the project root
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# ---------------------------
# 1. Navigate to the cpp folder
# ---------------------------
cd "$PROJECT_ROOT/gui" || exit 1

# ---------------------------
# 2. Clean up / create build_wasm
# ---------------------------
if [ -d "build_wasm" ]; then
    rm -rf build_wasm
fi
mkdir build_wasm

# ---------------------------
# 3. Activate Emscripten environment (if needed)
#    Adjust these calls to match your Emscripten setup.
# ---------------------------
source ~/emsdk/emsdk_env.sh

# ---------------------------
# 4. Run emcmake / cmake to configure
# ---------------------------
emcmake cmake -S . -B build_wasm -DCMAKE_BUILD_TYPE=Release

# Check if cmake configuration failed
if [ $? -ne 0 ]; then
    echo "[ERROR] CMake configuration failed"
    exit 1
fi

# ---------------------------
# 5. Build with CMake
# ---------------------------
cmake --build build_wasm --config Release

if [ $? -ne 0 ]; then
    echo "[ERROR] Build failed"
    exit 1
fi

# ---------------------------
# 6. Copy necessary artifacts
# ---------------------------
cp -f build_wasm/thermo_plot.html "$PROJECT_ROOT/public/wasm_app/"
cp -f build_wasm/thermo_plot.js   "$PROJECT_ROOT/public/wasm_app/"
cp -f build_wasm/thermo_plot.wasm "$PROJECT_ROOT/public/wasm_app/"
cp -f build_wasm/thermo_plot.data "$PROJECT_ROOT/public/wasm_app/"

echo "Build and copy complete!"