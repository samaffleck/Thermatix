cmake_minimum_required(VERSION 3.12)
project(Thermatix)
set(CMAKE_CXX_STANDARD 17)


if(EMSCRIPTEN)
    # Create a list of Emscripten-specific flags
    set(EMSCRIPTEN_FLAGS
        "-fexceptions"
        "-sNO_DISABLE_EXCEPTION_CATCHING=1"
        "-sALLOW_MEMORY_GROWTH=1"
        "-sUSE_GLFW=3"
        "-sUSE_WEBGL2=1"
        "-sNO_EXIT_RUNTIME=1"
        "-sFULL_ES3=1"
        "-sASSERTIONS=2"
    )
    
    # Convert the list to space-separated string
    string(JOIN " " EMSCRIPTEN_FLAGS_STR ${EMSCRIPTEN_FLAGS})
    
    # Set the flags globally
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} ${EMSCRIPTEN_FLAGS_STR}")
    set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} ${EMSCRIPTEN_FLAGS_STR}")
endif()

set(HELLOIMGUI_USE_FREETYPE OFF)

# Build hello_imgui
if(IS_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/external/hello_imgui)
    add_subdirectory(external/hello_imgui)
endif()

# Add ImPlot
# Specify the include directory for ImPlot
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/external/implot)

# Add include directory
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/include)

if(EMSCRIPTEN)
set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} -sWASM=1 -sASSERTIONS=1 -sFORCE_FILESYSTEM=1")
endif()

# Collect all .cpp files from ImPlot and add them to the build
file(GLOB IMPlot_SOURCES ${CMAKE_CURRENT_SOURCE_DIR}/external/implot/*.cpp)

# Collect all .cpp files from src and add them to the build
file(GLOB SRC_FILES ${CMAKE_CURRENT_SOURCE_DIR}/src/*.cpp)

# Build the app
# ==============
hello_imgui_add_app(Thermatix ThermatixMain.cpp ${IMPlot_SOURCES} ${SRC_FILES})

if(EMSCRIPTEN)
    target_compile_options(Thermatix PRIVATE ${EMSCRIPTEN_FLAGS})
    target_link_options(Thermatix PRIVATE ${EMSCRIPTEN_FLAGS})
endif()


target_link_options(
    Thermatix
  PUBLIC
    "SHELL:-sDISABLE_EXCEPTION_CATCHING=0"
    "SHELL:-sASSERTIONS=2"
)


# ==== BUILD INSTRUCTIONS ====
# ==== NATIVE WINDOWS BUILD ====
# mkdir build  
# cd build 
# cmake ..          -> This will generate the visual studio file

# ==== WASM BUILD ====
# Add emscripten tools to your path
#   Go to root directory.
# Add emscripten tools to your path
#  "C:/Program Files/emsdk/emsdk_env.bat"                                   *Only required once per terminal session
#   mkdir build_wasm                                                        *Only required once
#   emcmake cmake -S . -B build_wasm -DCMAKE_BUILD_TYPE=Release
#   emmake cmake --build build_wasm --config Release
# launch a webserver
#   cd build_wasm
#   python3 -m http.server
