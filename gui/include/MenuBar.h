#pragma once

// ImGui Includes
#include "hello_imgui/hello_imgui.h"

bool _ShowThemeSelector(ImGuiTheme::ImGuiTheme_* theme)
{
    bool changed = false;

    // List only the themes you want to show (in the desired order):
    static ImGuiTheme::ImGuiTheme_ allowedThemes[] = {
        ImGuiTheme::ImGuiTheme_Darcula,
        ImGuiTheme::ImGuiTheme_DarculaDarker,
        ImGuiTheme::ImGuiTheme_ImGuiColorsClassic,
        ImGuiTheme::ImGuiTheme_ImGuiColorsDark,
        ImGuiTheme::ImGuiTheme_PhotoshopStyle,
        ImGuiTheme::ImGuiTheme_BlackIsBlack,
        ImGuiTheme::ImGuiTheme_SoDark_AccentBlue,
        ImGuiTheme::ImGuiTheme_SoDark_AccentRed,
        ImGuiTheme::ImGuiTheme_SoDark_AccentYellow
    };

    ImGui::Text("Available Themes");

    // For a simple vertical list (no bounding box), just iterate:
    for (auto t : allowedThemes)
    {
        const bool is_selected = (*theme == t);
        if (ImGui::Selectable(ImGuiTheme::ImGuiTheme_Name(t), is_selected))
        {
            changed = true;
            *theme = t;
        }
        if (is_selected)
            ImGui::SetItemDefaultFocus();
    }

    return changed;
}

bool ShowMyThemeTweakGui(ImGuiTheme::ImGuiTweakedTheme* tweaked_theme)
{
    bool changed = false;

    if (_ShowThemeSelector(&tweaked_theme->Theme))
        changed = true;

    return changed;
}

void ShowThemeSelector(bool* p_open)
{
    auto& tweakedTheme = HelloImGui::GetRunnerParams()->imGuiWindowParams.tweakedTheme;
    ImGui::SetNextWindowSize(HelloImGui::EmToVec2(20.f, 46.f), ImGuiCond_FirstUseEver);
    if (ShowMyThemeTweakGui(&tweakedTheme))
    {
        ApplyTweakedTheme(tweakedTheme);
    }
}

void HelpMarker(const char* desc)
{
    ImGui::TextDisabled("(?)");
    if (ImGui::BeginItemTooltip())
    {
        ImGui::PushTextWrapPos(ImGui::GetFontSize() * 35.0f);
        ImGui::TextUnformatted(desc);
        ImGui::PopTextWrapPos();
        ImGui::EndTooltip();
    }
}

void ShowErrorMessage(const std::string& errorMessage)
{
    ImGui::Begin("Error Message");
    ImGui::TextUnformatted(errorMessage.c_str());
    ImGui::End();
}

void ShowModalPopUp(const std::string& message, bool& open)
{
    ImGui::OpenPopup("Message");

    if (ImGui::BeginPopupModal("Message", nullptr, ImGuiWindowFlags_AlwaysAutoResize))
    {
        ImGui::TextUnformatted(message.c_str());
        if (ImGui::Button("OK"))
        {
            ImGui::CloseCurrentPopup();
            open = false;
        }
        ImGui::EndPopup();
    }
}

void ShowConfirmationPopUp(const std::string& message, bool& open, bool& confirm)
{
    ImGui::OpenPopup("Confirmation");

    if (ImGui::BeginPopupModal("Confirmation", nullptr, ImGuiWindowFlags_AlwaysAutoResize))
    {
        ImGui::TextUnformatted(message.c_str());

        if (ImGui::BeginTable("##StepSelectionTable", 2, ImGuiTableFlags_SizingStretchSame))
        {
            ImGui::TableNextColumn();
            if (ImGui::Button("Yes", ImVec2(-1, 0)))
            {
                ImGui::CloseCurrentPopup();
                confirm = true;
                open = false;
            }

            ImGui::TableNextColumn();
            ImGui::SetNextItemWidth(ImGui::GetContentRegionAvail().x);
            if (ImGui::Button("No", ImVec2(-1, 0)))
            {
                ImGui::CloseCurrentPopup();
                confirm = false;
                open = false;
            }

            ImGui::EndTable();
        }
        ImGui::EndPopup();
    }
}

void ShowMainMenuBar()
{
    static bool showLoadPopUp = false;
    static bool showLoadExamplePopUp = false;
    static bool showSavePopUp = false;
    static bool showExitPopUp = false;

    static bool confirmExit = false;

    static bool showThemeSelector = false;

    if (ImGui::BeginMenu("Window"))
    {
        ShowThemeSelector(&showThemeSelector);
        ImGui::EndMenu();
    }

    if (ImGui::MenuItem("Exit"))
    {
        showExitPopUp = true;
    }

    if (showExitPopUp)
    {
        ShowConfirmationPopUp("You are about to leave the simulation environment. Would you still like to exit?\n", showExitPopUp, confirmExit);

        if (confirmExit)
        {
#ifdef EMSCRIPTEN
            RedirectToDashboard();
#else
            HelloImGui::GetRunnerParams()->appShallExit = true;
#endif
        }
    }

}
