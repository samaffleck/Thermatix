#pragma once

// ImGui Includes
#include "hello_imgui/hello_imgui.h"

#include <imgui.h>
#include <imgui_internal.h> // For advanced features
#include <vector>
#include <string>
#include <unordered_map>
#include <memory>
#include <functional>

// Forward declarations
class Node;
class Connection;


static const ImGuiInputTextFlags_ inputDoubleFlags = ImGuiInputTextFlags_::ImGuiInputTextFlags_None; //ImGuiInputTextFlags_EnterReturnsTrue


static void ShowDoubleInput(double& val, const std::string& label, const std::string& unit, const std::string& format, bool* isSelected)
{
    ImGuiInputTextFlags_ flags = ImGuiInputTextFlags_::ImGuiInputTextFlags_ReadOnly;
    
    if (isSelected)
        flags = ImGuiInputTextFlags_::ImGuiInputTextFlags_None;
    
    if (ImGui::BeginTable("##table", 3, ImGuiTableFlags_SizingStretchSame))
    {
        ImGui::PushID(label.c_str());

        ImGui::TableNextColumn();
        ImGui::Checkbox("##check", isSelected);
        ImGui::SameLine();
        ImGui::Text(label.c_str());
        ImGui::TableNextColumn();
        ImGui::SetNextItemWidth(ImGui::GetContentRegionAvail().x);
        ImGui::InputDouble("##input", &val, 0.0f, 0.0f, format.c_str(), flags);
        ImGui::TableNextColumn();
        ImGui::Text(unit.c_str());

        ImGui::PopID();
        ImGui::EndTable();
    }
}


static void ShowIntInput(int& val, const std::string& label, const std::string& unit)
{
    if (ImGui::BeginTable("##table", 3, ImGuiTableFlags_SizingStretchSame))
    {
        ImGui::PushID(label.c_str());

        ImGui::TableNextColumn();
        ImGui::Text(label.c_str());
        ImGui::TableNextColumn();
        ImGui::SetNextItemWidth(ImGui::GetContentRegionAvail().x);
        ImGui::InputInt("##input", &val);
        ImGui::TableNextColumn();
        ImGui::Text(unit.c_str());

        ImGui::PopID();
        ImGui::EndTable();
    }
}

// Vector math helpers
struct Vec2 {
    float x, y;
    Vec2(float _x = 0.0f, float _y = 0.0f) : x(_x), y(_y) {}

    Vec2 operator+(const Vec2& other) const { return Vec2(x + other.x, y + other.y); }
    Vec2 operator-(const Vec2& other) const { return Vec2(x - other.x, y - other.y); }
    Vec2 operator*(float scalar) const { return Vec2(x * scalar, y * scalar); }
    float Length() const { return sqrt(x * x + y * y); }
    Vec2 Normalized() const {
        float len = Length();
        if (len < 1e-6f) return Vec2(0, 0);
        return Vec2(x / len, y / len);
    }
};

// Connection point (inlet/outlet)
struct ConnectionPoint {
    Vec2 pos;               // Position relative to node
    std::string name;       // Name of the connection point
    bool isInput;           // Is this an input or output
    Node* node;             // Parent node
    Connection* connection; // Connection attached to this point, nullptr if none

    ConnectionPoint(const std::string& _name, bool _isInput, const Vec2& _pos, Node* _node)
        : name(_name), isInput(_isInput), pos(_pos), node(_node), connection(nullptr) {
    }
};

// Base node class for all process elements
class Node {
public:
    std::string imagePath; 
    Vec2 pos;                                // Position in the canvas
    Vec2 size;                               // Size of the node
    std::string name;                        // Name of the node
    std::string type;                        // Type of the node (valve, compressor, etc.)
    bool isSelected;                         // Is the node currently selected
    bool isBeingDragged;                     // Is the node being dragged
    std::vector<ConnectionPoint> inputs;     // Input connection points
    std::vector<ConnectionPoint> outputs;    // Output connection points

    Node(const std::string& _name, const std::string& _type, const Vec2& _pos, const Vec2& _size)
        : name(_name), type(_type), pos(_pos), size(_size), isSelected(false), isBeingDragged(false) {}

    virtual ~Node() {}

    // Get the absolute position of a connection point
    Vec2 GetConnectionPointPos(const ConnectionPoint& point) const {
        return pos + point.pos;
    }

    // Add an input connection point
    void AddInputPoint(const std::string& name, const Vec2& relPos) {
        inputs.emplace_back(name, true, relPos, this);
    }

    // Add an output connection point
    void AddOutputPoint(const std::string& name, const Vec2& relPos) {
        outputs.emplace_back(name, false, relPos, this);
    }

    // Find the nearest connection point to the given position
    ConnectionPoint* FindNearestConnectionPoint(const Vec2& testPos, float maxDist, bool inputsOnly = false, bool outputsOnly = false) {
        
        if (maxDist < 25.0f) maxDist = 25.0f;  // Ensure minimum snapping distance

        ConnectionPoint* nearest = nullptr;
        float minDist = maxDist;

        if (!inputsOnly) {
            for (auto& point : outputs) {
                Vec2 pointPos = GetConnectionPointPos(point);
                float dist = (pointPos - testPos).Length();
                if (dist < minDist) {
                    minDist = dist;
                    nearest = &point;
                }
            }
        }

        if (!outputsOnly) {
            for (auto& point : inputs) {
                Vec2 pointPos = GetConnectionPointPos(point);
                float dist = (pointPos - testPos).Length();
                if (dist < minDist) {
                    minDist = dist;
                    nearest = &point;
                }
            }
        }

        return nearest;
    }

    // Check if a point is inside the node
    bool Contains(const Vec2& point) const {
        return (point.x >= pos.x && point.x <= pos.x + size.x &&
            point.y >= pos.y && point.y <= pos.y + size.y);
    }

    // Render the node
    virtual void Render(const ImVec2& canvasPos) {
        ImDrawList* drawList = ImGui::GetWindowDrawList();

        // Convert position to screen coordinates
        ImVec2 nodePos = ImVec2(canvasPos.x + pos.x, canvasPos.y + pos.y);

        // Draw node name above the node box
        float textHeight = ImGui::GetTextLineHeight();
        float nameWidth = ImGui::CalcTextSize(name.c_str()).x;
        ImVec2 namePos = ImVec2(nodePos.x + (size.x - nameWidth) * 0.5f, nodePos.y - textHeight - 5);
        drawList->AddText(namePos, IM_COL32(220, 220, 220, 255), name.c_str());

        // Draw node background
        //ImU32 nodeColor = isSelected ? IM_COL32(100, 150, 250, 255) : IM_COL32(60, 60, 60, 255);
        //drawList->AddRectFilled(nodePos,
        //    ImVec2(nodePos.x + size.x, nodePos.y + size.y),
        //    nodeColor,
        //    4.0f);

        // Draw image using ImDrawList
        if (!imagePath.empty()) {
            ImTextureID texId = HelloImGui::ImageAndSizeFromAsset(imagePath.c_str()).textureId; // Returns ImTextureID
            if (texId)
                drawList->AddImage(texId, nodePos, ImVec2(nodePos.x + size.x, nodePos.y + size.y));
        }
        
        // Draw border (always show border)
        if (isSelected)
            drawList->AddRect(nodePos,
                ImVec2(nodePos.x + size.x, nodePos.y + size.y),
                IM_COL32(200, 200, 200, 255),
                4.0f,
                ImDrawFlags_None,
                2.0f);


        // Draw connection points
        const float pointRadius = 10.0f;
        for (const auto& input : inputs) {
            ImVec2 pointPos = ImVec2(nodePos.x + input.pos.x, nodePos.y + input.pos.y);
            drawList->AddCircleFilled(pointPos, pointRadius, IM_COL32(150, 150, 250, 255));

            // Draw connection point name
            float textWidth = ImGui::CalcTextSize(input.name.c_str()).x;
            ImVec2 textPos = ImVec2(pointPos.x + pointRadius - textWidth - 15, pointPos.y);
            drawList->AddText(textPos, IM_COL32(200, 200, 200, 255), input.name.c_str());
        }

        for (const auto& output : outputs) {
            ImVec2 pointPos = ImVec2(nodePos.x + output.pos.x, nodePos.y + output.pos.y);
            drawList->AddCircleFilled(pointPos, pointRadius, IM_COL32(250, 150, 150, 255));

            // Draw connection point name
            float textWidth = ImGui::CalcTextSize(output.name.c_str()).x;
            ImVec2 textPos = ImVec2(pointPos.x - pointRadius + 15, pointPos.y);
            drawList->AddText(textPos, IM_COL32(200, 200, 200, 255), output.name.c_str());
        }
    }

    // Open the properties window for this node
    virtual void OpenPropertiesWindow() = 0;
};

struct DoubleDataVariable
{
    DoubleDataVariable(double& val, const std::string& param, const std::string& u, bool isSelected)
        : value(val), parameter(param), unit(u), isSelected(isSelected) {}

    bool isSelected = false;
    double& value;
    std::string parameter;
    std::string unit;
};

class Valve : public Node
{
public:
    Valve(const std::string& name, const Vec2& pos) : Node(name, "Valve", pos, Vec2(80,50))
    {
        AddInputPoint("In", Vec2(0, 25));
        AddOutputPoint("Out", Vec2(80, 25));
        imagePath = "icons/valve.png";

        // Register all the "double" data
        data.emplace_back(percentOpen, "Percent Open", "[-]", true);
        data.emplace_back(CV, "Flow Coefficient (CV)", "[USGPM]", true);
        data.emplace_back(dP, "Pressure Drop", "[bar]", false);
    }

    std::vector<DoubleDataVariable> data{};
    double percentOpen = 50.0;
    double CV = 100.0;
    double dP = 0.1;

    void OpenPropertiesWindow()
    {
        if (ImGui::Begin((name + " Properties###NodeProps").c_str(), nullptr, ImGuiWindowFlags_AlwaysAutoResize)) {
            ImGui::Text(type.c_str());

            char nameBuf[256];
            strcpy(nameBuf, name.c_str());
            if (ImGui::InputText("##Name", nameBuf, sizeof(nameBuf))) {
                name = nameBuf;
            }

            if (ImGui::CollapsingHeader("Properties"))
            {
                for (auto& parameter : data)
                {
                    ShowDoubleInput(parameter.value, parameter.parameter, parameter.unit, "%.6f", &parameter.isSelected);
                }
            }
        }

        ImGui::End();
    }

};

class Inlet : public Node
{
public:
    Inlet(const std::string& name, const Vec2& pos) : Node(name, "Inlet", pos, Vec2(40, 50))
    {
        AddInputPoint("In", Vec2(0, 25));
        AddOutputPoint("Out", Vec2(40, 25));
        imagePath = "icons/inlet.png";

        // Register all the "double" data
        data.emplace_back(pressure, "Pressure", "[bar]", true);
        data.emplace_back(massFlowRate, "Mass Flow Rate", "[kg/s]", false);
        data.emplace_back(temperature, "Temperature", "[K]", true);
    }

    std::vector<DoubleDataVariable> data{};
    double pressure = 1.01325;
    double massFlowRate = 1;
    double temperature = 298.0;

    void OpenPropertiesWindow()
    {
        if (ImGui::Begin((name + " Properties###NodeProps").c_str(), nullptr, ImGuiWindowFlags_AlwaysAutoResize)) {
            ImGui::Text(type.c_str());

            char nameBuf[256];
            strcpy(nameBuf, name.c_str());
            if (ImGui::InputText("##Name", nameBuf, sizeof(nameBuf))) {
                name = nameBuf;
            }

            if (ImGui::CollapsingHeader("Properties"))
            {
                for (auto& parameter : data)
                {
                    ShowDoubleInput(parameter.value, parameter.parameter, parameter.unit, "%.6f", &parameter.isSelected);
                }
            }
        }

        ImGui::End();
    }

};

// Connection between nodes
class Connection {
public:
    ConnectionPoint* from;
    ConnectionPoint* to;

    Connection(ConnectionPoint* _from, ConnectionPoint* _to) : from(_from), to(_to) {
        from->connection = this;
        to->connection = this;
    }

    ~Connection() {
        // Disconnect points
        if (from) from->connection = nullptr;
        if (to) to->connection = nullptr;
    }

    void Render(ImDrawList* drawList, ImVec2 offset) {
        if (!from || !to) return;

        Vec2 startPos = from->node->GetConnectionPointPos(*from);
        Vec2 endPos = to->node->GetConnectionPointPos(*to);

        // Convert to screen coordinates
        ImVec2 startPosScreen = ImVec2(offset.x + startPos.x, offset.y + startPos.y);
        ImVec2 endPosScreen = ImVec2(offset.x + endPos.x, offset.y + endPos.y);

        // Calculate control points for a bezier curve
        Vec2 delta = endPos - startPos;
        float curvature = std::min(100.0f, delta.Length() * 0.5f);

        ImVec2 cp1 = ImVec2(startPosScreen.x + curvature, startPosScreen.y);
        ImVec2 cp2 = ImVec2(endPosScreen.x - curvature, endPosScreen.y);

        // Draw the curve
        drawList->AddBezierCubic(
            startPosScreen, cp1, cp2, endPosScreen,
            IM_COL32(200, 200, 200, 255), 2.0f
        );

        // Draw arrow at the end
        Vec2 dir = ((endPos - startPos).Normalized());
        Vec2 normal = Vec2(-dir.y, dir.x) * 5.0f;
        Vec2 arrowEnd = endPos - dir * 10.0f;
        Vec2 arrowP1 = arrowEnd + normal;
        Vec2 arrowP2 = arrowEnd - normal;

        drawList->AddTriangleFilled(
            ImVec2(offset.x + endPos.x, offset.y + endPos.y),
            ImVec2(offset.x + arrowP1.x, offset.y + arrowP1.y),
            ImVec2(offset.x + arrowP2.x, offset.y + arrowP2.y),
            IM_COL32(200, 200, 200, 255)
        );
    }
};

// Factory for creating nodes
class NodeFactory {
private:
    std::unordered_map<std::string, std::function<std::unique_ptr<Node>(const std::string&, const Vec2&)>> factories;

public:
    NodeFactory() {
        // Register node types
        RegisterNodeType("Valve", [](const std::string& name, const Vec2& pos) -> std::unique_ptr<Node> 
        {
            return std::make_unique<Valve>(name, pos);
        });

        //RegisterNodeType("Compressor", [](const std::string& name, const Vec2& pos) -> std::unique_ptr<Node> {
        //    auto node = std::make_unique<Node>(name, "Compressor", pos, Vec2(140, 100));
        //    node->AddInputPoint("Suction", Vec2(0, 50));
        //    node->AddOutputPoint("Discharge", Vec2(140, 50));
        //    node->parameters["Pressure Ratio"] = 2.0f;
        //    node->parameters["Efficiency"] = 0.75f;
        //    node->parameters["Power"] = 100.0f;
        //    node->imagePath = "icons/valve.png";
        //
        //    return node;
        //});
        //
        //RegisterNodeType("Tank", [](const std::string& name, const Vec2& pos) -> std::unique_ptr<Node> {
        //    auto node = std::make_unique<Node>(name, "Tank", pos, Vec2(120, 160));
        //    node->AddInputPoint("In", Vec2(0, 60));
        //    node->AddOutputPoint("Out", Vec2(120, 100));
        //    node->parameters["Volume"] = 10.0f;
        //    node->parameters["Initial Level"] = 5.0f;
        //    node->parameters["Max Pressure"] = 100.0f;
        //    node->imagePath = "icons/tank.png";
        //
        //    return node;
        //});
        //
        //RegisterNodeType("Pipe", [](const std::string& name, const Vec2& pos) -> std::unique_ptr<Node> {
        //    auto node = std::make_unique<Node>(name, "Pipe", pos, Vec2(160, 70));
        //    node->AddInputPoint("In", Vec2(0, 35));
        //    node->AddOutputPoint("Out", Vec2(160, 35));
        //    node->parameters["Length"] = 10.0f;
        //    node->parameters["Diameter"] = 0.1f;
        //    node->parameters["Roughness"] = 0.001f;
        //    node->imagePath = "icons/pipe.png";
        //
        //    return node;
        //});
        //
        //RegisterNodeType("Inlet", [](const std::string& name, const Vec2& pos) -> std::unique_ptr<Node> {
        //    auto node = std::make_unique<Node>(name, "Inlet", pos, Vec2(100, 60));
        //    node->AddOutputPoint("Out", Vec2(100, 30));
        //    node->parameters["Flow Rate"] = 10.0f;
        //    node->parameters["Temperature"] = 25.0f;
        //    node->parameters["Pressure"] = 101.3f;
        //    node->imagePath = "icons/valve.png";
        //
        //    return node;
        //});
        //
        //RegisterNodeType("Outlet", [](const std::string& name, const Vec2& pos) -> std::unique_ptr<Node> {
        //    auto node = std::make_unique<Node>(name, "Outlet", pos, Vec2(100, 60));
        //    node->AddInputPoint("In", Vec2(0, 30));
        //    node->parameters["Pressure"] = 101.3f;
        //    node->imagePath = "icons/valve.png";
        //
        //    return node;
        //});
        //
        //RegisterNodeType("Splitter", [](const std::string& name, const Vec2& pos) -> std::unique_ptr<Node> {
        //    auto node = std::make_unique<Node>(name, "Splitter", pos, Vec2(120, 120));
        //    node->AddInputPoint("In", Vec2(0, 60));
        //    node->AddOutputPoint("Out1", Vec2(120, 30));
        //    node->AddOutputPoint("Out2", Vec2(120, 60));
        //    node->AddOutputPoint("Out3", Vec2(120, 90));
        //    node->parameters["Split Ratio 1"] = 0.33f;
        //    node->parameters["Split Ratio 2"] = 0.33f;
        //    node->parameters["Split Ratio 3"] = 0.34f;
        //    node->imagePath = "icons/splitter.png";
        //
        //    return node;
        //});
        //
        //RegisterNodeType("Mixer", [](const std::string& name, const Vec2& pos) -> std::unique_ptr<Node> {
        //    auto node = std::make_unique<Node>(name, "Mixer", pos, Vec2(120, 120));
        //    node->AddInputPoint("In1", Vec2(0, 30));
        //    node->AddInputPoint("In2", Vec2(0, 60));
        //    node->AddInputPoint("In3", Vec2(0, 90));
        //    node->AddOutputPoint("Out", Vec2(120, 60));
        //    node->parameters["Pressure Drop"] = 5.0f;
        //    node->parameters["Efficiency"] = 0.95f;
        //    node->imagePath = "icons/mixer.png";
        //
        //    return node;
        //});
    }

    // Register a new node type
    void RegisterNodeType(const std::string& type, std::function<std::unique_ptr<Node>(const std::string&, const Vec2&)> factory) {
        factories[type] = factory;
    }

    // Create a node of the specified type
    std::unique_ptr<Node> CreateNode(const std::string& type, const std::string& name, const Vec2& pos) {
        if (factories.find(type) != factories.end()) {
            return factories[type](name, pos);
        }
        return nullptr;
    }

    std::string NodeFactory::GetImagePathForType(const std::string& type) {
        auto tempNode = CreateNode(type, "temp", Vec2(0, 0));
        return tempNode ? tempNode->imagePath : "icons/valve.png";
    }

    // Get all registered node types
    std::vector<std::string> GetNodeTypes() const {
        std::vector<std::string> types;
        for (const auto& pair : factories) {
            types.push_back(pair.first);
        }
        return types;
    }
};

// Main application state
class FlowsheetEditor {
private:
    std::vector<std::unique_ptr<Node>> nodes;
    std::vector<std::unique_ptr<Connection>> connections;
    NodeFactory nodeFactory;
    std::unordered_map<std::string, ImTextureID> textureCache;

    // UI State
    Vec2 canvasOffset;
    float canvasScale;
    bool isDraggingCanvas;
    Vec2 dragStartPos;

    // Drag state for connections
    bool isCreatingConnection;
    ConnectionPoint* connectionStartPoint;
    Vec2 connectionEndPos;

    // Node state
    Node* selectedNode;
    bool showPropertiesWindow;

    // Double-click detection
    float lastClickTime;
    Node* lastClickedNode;

public:
    FlowsheetEditor()
        : canvasOffset(0, 0), canvasScale(1.0f), isDraggingCanvas(false), isCreatingConnection(false),
        connectionStartPoint(nullptr), selectedNode(nullptr), showPropertiesWindow(false),
        lastClickTime(0), lastClickedNode(nullptr) {
    }

    void Render() 
    {
        ImGui::Begin("Toolbar", nullptr);
        RenderToolbar();
        ImGui::End();

        if (ImGui::Begin("Process Flow Editor", nullptr)) {
            // Handle keyboard shortcuts
            HandleKeyboardShortcuts();

            // Calculate the canvas area
            ImVec2 canvasSize = ImGui::GetContentRegionAvail();

            // Begin canvas
            ImGui::BeginChild("Canvas", canvasSize, true, ImGuiWindowFlags_NoScrollbar | ImGuiWindowFlags_NoMove);

            // Get canvas position and draw list
            ImVec2 canvasPos = ImGui::GetCursorScreenPos();
            ImDrawList* drawList = ImGui::GetWindowDrawList();

            // Draw grid
            DrawGrid(drawList, canvasPos, canvasSize);

            // Draw existing connections
            for (const auto& connection : connections) {
                connection->Render(drawList, canvasPos);
            }

            // Draw new connection if creating one
            if (isCreatingConnection && connectionStartPoint) {
                Vec2 startPos = connectionStartPoint->node->GetConnectionPointPos(*connectionStartPoint);
                ImVec2 startPosScreen = ImVec2(canvasPos.x + startPos.x, canvasPos.y + startPos.y);
                ImVec2 endPosScreen = ImVec2(canvasPos.x + connectionEndPos.x, canvasPos.y + connectionEndPos.y);

                // Calculate control points
                Vec2 delta = connectionEndPos - startPos;
                float curvature = std::min(100.0f, delta.Length() * 0.5f);

                ImVec2 cp1 = ImVec2(startPosScreen.x + curvature, startPosScreen.y);
                ImVec2 cp2 = ImVec2(endPosScreen.x - curvature, endPosScreen.y);

                // Draw the curve
                drawList->AddBezierCubic(
                    startPosScreen, cp1, cp2, endPosScreen,
                    IM_COL32(200, 200, 200, 128), 2.0f
                );
            }

            // Draw all nodes
            for (const auto& node : nodes) {
                node->Render(canvasPos);
            }

            // Handle canvas interactions
            HandleCanvasInteractions();

            ImGui::EndChild(); // End canvas
        }
        ImGui::End(); // End main window

        // Show properties window if needed
        if (showPropertiesWindow && selectedNode) {
            selectedNode->OpenPropertiesWindow();
        }
    }

private:
    void DrawGrid(ImDrawList* drawList, ImVec2 canvasPos, ImVec2 canvasSize) {
        const float gridSize = 20.0f;

        // Calculate grid bounds
        float startX = canvasPos.x + canvasOffset.x;
        float startY = canvasPos.y + canvasOffset.y;
        float endX = canvasPos.x + canvasSize.x;
        float endY = canvasPos.y + canvasSize.y;

        // Calculate grid lines starting positions
        float gridOffsetX = fmodf(canvasOffset.x, gridSize);
        float gridOffsetY = fmodf(canvasOffset.y, gridSize);

        // Draw minor grid lines
        for (float x = startX + gridOffsetX; x < endX; x += gridSize) {
            drawList->AddLine(ImVec2(x, startY), ImVec2(x, endY), IM_COL32(50, 50, 50, 40));
        }

        for (float y = startY + gridOffsetY; y < endY; y += gridSize) {
            drawList->AddLine(ImVec2(startX, y), ImVec2(endX, y), IM_COL32(50, 50, 50, 40));
        }

        // Draw major grid lines
        const float majorGridSize = gridSize * 5;
        float majorGridOffsetX = fmodf(canvasOffset.x, majorGridSize);
        float majorGridOffsetY = fmodf(canvasOffset.y, majorGridSize);

        for (float x = startX + majorGridOffsetX; x < endX; x += majorGridSize) {
            drawList->AddLine(ImVec2(x, startY), ImVec2(x, endY), IM_COL32(50, 50, 50, 80));
        }

        for (float y = startY + majorGridOffsetY; y < endY; y += majorGridSize) {
            drawList->AddLine(ImVec2(startX, y), ImVec2(endX, y), IM_COL32(50, 50, 50, 80));
        }
    }

    void HandleCanvasInteractions() {

        if (ImGui::IsPopupOpen("AddNodePopup") || !ImGui::IsWindowHovered())
            return;

        // Get canvas position and mouse position
        ImVec2 canvasPos = ImGui::GetCursorScreenPos();
        ImVec2 mousePos = ImGui::GetMousePos();
        Vec2 mouseCanvasPos = Vec2(mousePos.x - canvasPos.x, mousePos.y - canvasPos.y);

        // Handle mouse dragging (panning)
        if (ImGui::IsMouseDragging(ImGuiMouseButton_Middle)) {
            if (!isDraggingCanvas) {
                isDraggingCanvas = true;
                dragStartPos = Vec2(mousePos.x, mousePos.y);
            }
            else {
                ImVec2 dragDelta = ImGui::GetMouseDragDelta(ImGuiMouseButton_Middle);
                canvasOffset.x += dragDelta.x;
                canvasOffset.y += dragDelta.y;
                ImGui::ResetMouseDragDelta(ImGuiMouseButton_Middle);
            }
        }
        else {
            isDraggingCanvas = false;
        }

        // Handle zooming (for future implementation)
        //float wheel = ImGui::GetIO().MouseWheel;
        //if (wheel != 0) {
        //    canvasScale = ImClamp(canvasScale + wheel * 0.1f, 0.1f, 3.0f);
        //}

        // Handle node selection
        if (ImGui::IsMouseClicked(ImGuiMouseButton_Left)) {
            // Check if clicked on a node
            Node* clickedNode = nullptr;
            float minDistSq = 999999.0f;
            const float SNAP_RADIUS = 20.0f;

            for (auto it = nodes.rbegin(); it != nodes.rend(); ++it) {
                Node* node = it->get();
                if (node->Contains(mouseCanvasPos)) {
                    // Direct hit, prioritize this
                    clickedNode = node;
                    break;
                }
                else {
                    // Calculate distance from mouse to node center
                    ImVec2 center = ImVec2(node->pos.x + node->size.x,
                        node->pos.y + node->size.y * 0.5f);
                    float dx = center.x - mouseCanvasPos.x;
                    float dy = center.y - mouseCanvasPos.y;
                    float distSq = dx * dx + dy * dy;

                    if (distSq < SNAP_RADIUS * SNAP_RADIUS && distSq < minDistSq) {
                        minDistSq = distSq;
                        clickedNode = node;
                    }
                }
            }

            // If a node was clicked
            if (clickedNode) {
                // Handle double click
                float currentTime = ImGui::GetTime();
                if (clickedNode == lastClickedNode && currentTime - lastClickTime < 0.3f) {
                    // Double click detected
                    selectedNode = clickedNode;
                    showPropertiesWindow = true;
                }

                lastClickedNode = clickedNode;
                lastClickTime = currentTime;

                // Check if clicked on a connection point
                ConnectionPoint* clickedPoint = clickedNode->FindNearestConnectionPoint(mouseCanvasPos, 25.0f);
                if (clickedPoint) {
                    // Start creating a new connection
                    isCreatingConnection = true;
                    connectionStartPoint = clickedPoint;
                    connectionEndPos = mouseCanvasPos;
                }
                else {
                    // Select the node
                    if (!(ImGui::GetIO().KeyCtrl || ImGui::GetIO().KeyShift)) {
                        // Deselect all nodes first if not multi-selecting
                        for (const auto& node : nodes) {
                            node->isSelected = false;
                        }
                    }

                    clickedNode->isSelected = true;
                    selectedNode = clickedNode;
                    clickedNode->isBeingDragged = true;
                }
            }
            else {
                // Clicked on empty space, deselect all if not holding Ctrl
                if (!(ImGui::GetIO().KeyCtrl || ImGui::GetIO().KeyShift)) {
                    for (const auto& node : nodes) {
                        node->isSelected = false;
                    }
                    selectedNode = nullptr;
                }
            }
        }

        // Handle node dragging
        if (ImGui::IsMouseDragging(ImGuiMouseButton_Left)) {
            // Update connection endpoint if creating a connection
            if (isCreatingConnection) {
                connectionEndPos = mouseCanvasPos;
            }
            else {
                // Drag selected nodes
                ImVec2 dragDelta = ImGui::GetMouseDragDelta(ImGuiMouseButton_Left);

                for (auto& node : nodes) {
                    if (node->isBeingDragged) {
                        node->pos.x += dragDelta.x;
                        node->pos.y += dragDelta.y;
                    }
                }

                ImGui::ResetMouseDragDelta(ImGuiMouseButton_Left);
            }
        }

        // Handle mouse release
        if (ImGui::IsMouseReleased(ImGuiMouseButton_Left)) {
            // Finish node dragging
            for (auto& node : nodes) {
                node->isBeingDragged = false;
            }

            // Finish connection creation
            if (isCreatingConnection && connectionStartPoint) {
                // Find connection point under mouse
                ConnectionPoint* endPoint = nullptr;

                for (const auto& node : nodes) {
                    // Don't connect to the same node
                    if (node.get() == connectionStartPoint->node) continue;

                    // Find nearest connection point
                    ConnectionPoint* point = node->FindNearestConnectionPoint(
                        mouseCanvasPos,
                        15.0f,
                        !connectionStartPoint->isInput,  // If starting point is output, only look for inputs
                        connectionStartPoint->isInput    // If starting point is input, only look for outputs
                    );

                    if (point) {
                        endPoint = point;
                        break;
                    }
                }

                // If found a valid end point, create the connection
                if (endPoint) {
                    // Make sure one is an input and one is an output
                    ConnectionPoint* from = connectionStartPoint->isInput ? endPoint : connectionStartPoint;
                    ConnectionPoint* to = connectionStartPoint->isInput ? connectionStartPoint : endPoint;

                    // Check if points are already connected
                    if (!from->connection && !to->connection) {
                        connections.push_back(std::make_unique<Connection>(from, to));
                    }
                }

                isCreatingConnection = false;
                connectionStartPoint = nullptr;
            }
        }
    }

    void RenderToolbar() 
    {
        ImGui::PushStyleVar(ImGuiStyleVar_ItemSpacing, ImVec2(10, 10));

        if (ImGui::Button("Add Unit")) {
            ImGui::OpenPopup("AddNodePopup");
        }

        // Add node popup
        if (ImGui::BeginPopup("AddNodePopup")) {
            ImGui::Text("Select node type:");
            ImGui::Separator();

            for (const auto& type : nodeFactory.GetNodeTypes()) {
                if (ImGui::MenuItem(type.c_str())) {
                    // Create a new node at the center of the view
                    ImVec2 viewCenter = ImGui::GetWindowSize();
                    viewCenter.x *= 0.5f;
                    viewCenter.y *= 0.5f;

                    std::string newName = type + " " + std::to_string(nodes.size() + 1);
                    auto node = nodeFactory.CreateNode(type, newName, Vec2(viewCenter.x, viewCenter.y));

                    if (node) {
                        nodes.push_back(std::move(node));
                    }
                }
            }

            ImGui::EndPopup();
        }


        ImGui::PopStyleVar();
        ImGui::Separator();
    }

    void HandleKeyboardShortcuts() {
        // Delete selected nodes with Delete key
        if (ImGui::IsKeyPressed(ImGuiKey_Delete)) {
            DeleteSelectedNodes();
        }

        // Properties with Enter key
        if (ImGui::IsKeyPressed(ImGuiKey_Enter) && selectedNode) {
            showPropertiesWindow = true;
        }
    }

    void DeleteSelectedNodes() {
        // First collect all nodes to delete
        std::vector<Node*> nodesToDelete;
        for (const auto& node : nodes) {
            if (node->isSelected) {
                nodesToDelete.push_back(node.get());
            }
        }

        // Remove all connections connected to these nodes
        auto connIt = connections.begin();
        while (connIt != connections.end()) {
            bool connected = false;
            for (Node* node : nodesToDelete) {
                if ((*connIt)->from->node == node || (*connIt)->to->node == node) {
                    connected = true;
                    break;
                }
            }

            if (connected) {
                connIt = connections.erase(connIt);
            }
            else {
                ++connIt;
            }
        }

        // Now remove the nodes
        auto nodeIt = nodes.begin();
        while (nodeIt != nodes.end()) {
            if ((*nodeIt)->isSelected) {
                if (selectedNode == nodeIt->get()) {
                    selectedNode = nullptr;
                    showPropertiesWindow = false;
                }
                nodeIt = nodes.erase(nodeIt);
            }
            else {
                ++nodeIt;
            }
        }
    }
};
