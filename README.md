

# Getting started

## Initial Setup

Install dependencies:

```bash
npm install
```

Added .env.local file


## Initialize and update git submodules for C++ dependencies
```bash
git submodule update --init --recursive
```


## Compiling C++ Code into WebAssembly

For Windows:
   ```bash
   npm run build:wasm:windows   # This runs scripts/build_wasm.bat
   ```

For Linux/MacOS:
   ```bash
   npm run build:wasm:unix   # This runs scripts/build_wasm.sh
   ```

These scripts will compile the C++ source files into WebAssembly modules that can be used by the web application. Make sure you have the following prerequisites installed:

- Emscripten SDK (emsdk)
- A C++ compiler (gcc/clang)

The compiled WASM files will be placed in the appropriate directory for the Next.js application to use.


Run the Next.js local development server:

   ```bash
   npm run dev
   ```
   App should now be running on [localhost:3000](http://localhost:3000/).

