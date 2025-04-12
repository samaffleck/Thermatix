/**
*** Origional Author:       Sam Affleck
*** Created:                07.01.2025
**/

#include "DragAndDrop.h"
#include "MenuBar.h"

// ImGui Includes
#include "hello_imgui/hello_imgui.h"

// ImPlot Includes
#include "implot.h"
#include "implot_internal.h"

// STL Includes
#include <vector>
#include <string>
#include <algorithm>
#include <functional> // for std::hash
#include <thread>
#include <atomic>
#include <chrono>

// Emscripten Includes
#ifdef EMSCRIPTEN
#include <emscripten.h>
#include <emscripten/bind.h>
#endif


std::vector<HelloImGui::DockingSplit> CreateThreeColumnDockingSplits()
{
    // 1. Split off the left column from the "MainDockSpace":
    HelloImGui::DockingSplit splitLeft;
    splitLeft.initialDock = "MainDockSpace";  // Start splitting from the main space
    splitLeft.newDock = "LeftSpace";          // Create a new dock called "LeftSpace"
    splitLeft.direction = ImGuiDir_Left;      // Dock to the left
    splitLeft.ratio = 0.25f;                  // 25% width on the left

    // 2. Split off the right column from the "MainDockSpace":
    //    (after the left column has already been carved out)
    HelloImGui::DockingSplit splitRight;
    splitRight.initialDock = "MainDockSpace";
    splitRight.newDock = "RightSpace";
    splitRight.direction = ImGuiDir_Right;
    splitRight.ratio = 0.5f;

    // After these two splits, "MainDockSpace" remains in the middle.

    // Combine your splits into a vector
    std::vector<HelloImGui::DockingSplit> splits{
        splitLeft,
        splitRight
    };
    return splits;
}

void InitializeImGuiFonts()
{
    ImGuiIO& io = ImGui::GetIO();
    io.Fonts->AddFontDefault(); // Optional: add default font
    //Fonts::fontLarge = io.Fonts->AddFontFromFileTTF("C:/Users/samaf/Documents/stokesim/gui/assets/fonts/fontawesome-webfont.ttf", 36.0f);
    //Fonts::fontLarge = io.Fonts->AddFontFromFileTTF("assets/fonts/NotoEmoji-VariableFont_wght.ttf", 36.0f);
    //Fonts::fontLarge = io.Fonts->AddFontFromFileTTF("assets/fonts/DroidSans.ttf", 36.0f);
}

HelloImGui::DockingParams CreateDefaultLayout()
{
    HelloImGui::DockingParams dockingParams;
    dockingParams.dockingSplits = CreateThreeColumnDockingSplits();

    // Now assign your windows to either "LeftSpace", "MainDockSpace" (the middle), or "RightSpace".
    dockingParams.dockableWindows = {
        // Left column:
        { "Adsorption Model",               "LeftSpace",         []() {}, false, true },

        // Middle column ("MainDockSpace" is now the center):
        { "Reactor Properties",             "MainDockSpace",     []() {}, false, true },

        // Right column:
        { "Results",                        "RightSpace",        []() {}, false, true }
    };

    return dockingParams;
}

static void CreateMainWorkSpace()
{
    ImGuiIO& io = ImGui::GetIO();
    io.ConfigFlags |= ImGuiConfigFlags_DockingEnable;

    static FlowsheetEditor editor;
    
    editor.Render();
}


int main(int , char *[])
{
    std::string appName = "Stokesian";

    ImPlot::CreateContext();

    HelloImGui::RunnerParams params;
    params.callbacks.SetupImGuiStyle = InitializeImGuiFonts;
    params.callbacks.ShowGui = []() { CreateMainWorkSpace(); };
    params.appWindowParams.windowTitle = appName;
    params.imGuiWindowParams.defaultImGuiWindowType = HelloImGui::DefaultImGuiWindowType::ProvideFullScreenDockSpace;
    params.imGuiWindowParams.enableViewports = true;
    params.dockingParams = CreateDefaultLayout();
    
    params.imGuiWindowParams.showMenuBar = true;
    params.imGuiWindowParams.showMenu_App = false;
    params.imGuiWindowParams.showMenu_View = false;
    params.callbacks.ShowMenus = []() { ShowMainMenuBar(); };

    HelloImGui::SetAssetsFolder("C:/Users/samaf/Documents/Thermatix/gui/assets/");

    HelloImGui::Run(params);

    ImPlot::DestroyContext();

    return 0;
}
