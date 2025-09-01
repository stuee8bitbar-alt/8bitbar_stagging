import React, { useState, useRef, useEffect } from "react"; // Modified: Imported useRef, useEffect
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Circle,
  Rect,
  Text,
} from "react-konva";
import useImage from "use-image";
import Toolbar from "./Toolbar";
import StageArea from "./StageArea";
import ShapeRenderer from "./ShapeRenderer";
import api from "../../utils/axios";
import EditorSettings from "./EditorSettings";
import TemplateManager from "./TemplateManager";

const DEFAULT_MAP_URL =
  "https://8bitbar.com.au/wp-content/uploads/2025/06/map-layout-0-resturant-scaled.jpg";
const DEFAULT_CANVAS_WIDTH = 1000;
const DEFAULT_CANVAS_HEIGHT = 2400;

// --- Initial Data ---
const initialShapes = [
  // Round Tables
  { id: "t1", type: "round-table", x: 200, y: 200, radius: 40 },
  { id: "t2", type: "round-table", x: 400, y: 300, radius: 40 },
  { id: "t3", type: "round-table", x: 600, y: 500, radius: 40 },
  // Chairs
  { id: "c1", type: "chair", x: 170, y: 170, width: 32, height: 32 },
  { id: "c2", type: "chair", x: 230, y: 170, width: 32, height: 32 },
  { id: "c3", type: "chair", x: 170, y: 230, width: 32, height: 32 },
  { id: "c4", type: "chair", x: 230, y: 230, width: 32, height: 32 },
  { id: "c5", type: "chair", x: 370, y: 270, width: 32, height: 32 },
  { id: "c6", type: "chair", x: 430, y: 330, width: 32, height: 32 },
];

// --- Default Styles ---
const DEFAULT_TABLE_COLOR = "#228B22"; // ForestGreen
const DEFAULT_CHAIR_COLOR = "#A0522D"; // Sienna
const DEFAULT_TEXT_COLOR = "#000000";
const FONT_SIZE = 22;

const DEVICE_TYPES = [
  { label: "Desktop", value: "desktop" },
  { label: "Mobile", value: "mobile" },
];

const MOBILE_SCALE = 0.7; // scale down bg image for mobile
const MOBILE_TABLE_RADIUS = 36;
const MOBILE_TABLE_SIZE = 60;
const MOBILE_CHAIR_SIZE = 28;

const BarMapEditor = () => {
  const [shapes, setShapes] = useState(initialShapes);
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [scale, setScale] = useState(1);
  const [mapUrl, setMapUrl] = useState(DEFAULT_MAP_URL);
  const [canvasWidth, setCanvasWidth] = useState(DEFAULT_CANVAS_WIDTH);
  const [canvasHeight, setCanvasHeight] = useState(DEFAULT_CANVAS_HEIGHT);
  const [mapImage] = useImage(mapUrl);

  const [tableColor, setTableColor] = useState(DEFAULT_TABLE_COLOR);
  const [chairColor, setChairColor] = useState(DEFAULT_CHAIR_COLOR);
  const [textColor, setTextColor] = useState(DEFAULT_TEXT_COLOR);
  const [deviceType, setDeviceType] = useState("desktop"); // Layout type being edited
  const [actualDeviceType, setActualDeviceType] = useState("desktop"); // Actual device being used
  const [currentTemplate, setCurrentTemplate] = useState("Template 1"); // Current template

  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  const stageContainerRef = useRef(null); // Added: Ref for the stage container

  // Detect actual device type for responsive canvas (separate from layout being edited)
  useEffect(() => {
    const checkActualDevice = () => {
      setActualDeviceType(window.innerWidth <= 768 ? "mobile" : "desktop");
    };

    checkActualDevice();
    window.addEventListener("resize", checkActualDevice);
    return () => window.removeEventListener("resize", checkActualDevice);
  }, []);

  // Helper to get initial shapes based on device type
  const getInitialShapes = (type) => {
    if (type === "mobile") {
      return [
        // Round Tables
        {
          id: "t1",
          type: "round-table",
          x: 120,
          y: 120,
          radius: MOBILE_TABLE_RADIUS,
        },
        {
          id: "t2",
          type: "round-table",
          x: 220,
          y: 180,
          radius: MOBILE_TABLE_RADIUS,
        },
        {
          id: "t3",
          type: "round-table",
          x: 320,
          y: 300,
          radius: MOBILE_TABLE_RADIUS,
        },
        // Chairs
        {
          id: "c1",
          type: "chair",
          x: 100,
          y: 100,
          width: MOBILE_CHAIR_SIZE,
          height: MOBILE_CHAIR_SIZE,
        },
        {
          id: "c2",
          type: "chair",
          x: 140,
          y: 100,
          width: MOBILE_CHAIR_SIZE,
          height: MOBILE_CHAIR_SIZE,
        },
        {
          id: "c3",
          type: "chair",
          x: 100,
          y: 140,
          width: MOBILE_CHAIR_SIZE,
          height: MOBILE_CHAIR_SIZE,
        },
        {
          id: "c4",
          type: "chair",
          x: 140,
          y: 140,
          width: MOBILE_CHAIR_SIZE,
          height: MOBILE_CHAIR_SIZE,
        },
        {
          id: "c5",
          type: "chair",
          x: 200,
          y: 160,
          width: MOBILE_CHAIR_SIZE,
          height: MOBILE_CHAIR_SIZE,
        },
        {
          id: "c6",
          type: "chair",
          x: 240,
          y: 200,
          width: MOBILE_CHAIR_SIZE,
          height: MOBILE_CHAIR_SIZE,
        },
      ];
    }
    return initialShapes;
  };

  // Load layout from backend
  useEffect(() => {
    const fetchLayout = async () => {
      setLoading(true);
      try {
        const response = await api.get(
          `/admin/cafe/cafe-layout?deviceType=${deviceType}&templateName=${currentTemplate}`
        );
        const layout = response.data.layout;
        if (layout) {
          // Convert backend format to shapes array
          const loadedShapes = [
            ...(layout.tables || []).map((table) => ({
              ...table,
              type: table.type,
              id: table.id,
              x: table.x,
              y: table.y,
              radius:
                deviceType === "mobile" ? MOBILE_TABLE_RADIUS : table.radius,
              width: deviceType === "mobile" ? MOBILE_TABLE_SIZE : table.width,
              height:
                deviceType === "mobile" ? MOBILE_TABLE_SIZE : table.height,
              color: table.color,
            })),
            ...(layout.chairs || []).map((chair) => ({
              ...chair,
              type: "chair",
              id: chair.id,
              x: chair.x,
              y: chair.y,
              width: deviceType === "mobile" ? MOBILE_CHAIR_SIZE : chair.width,
              height:
                deviceType === "mobile" ? MOBILE_CHAIR_SIZE : chair.height,
              color: chair.color,
            })),
          ];
          setShapes(loadedShapes);
          if (layout.tables && layout.tables[0])
            setTableColor(layout.tables[0].color);
          if (layout.chairs && layout.chairs[0])
            setChairColor(layout.chairs[0].color);
          if (layout.bgImageUrl) setMapUrl(layout.bgImageUrl);
          if (layout.canvasWidth) setCanvasWidth(layout.canvasWidth);
          if (layout.canvasHeight) setCanvasHeight(layout.canvasHeight);
        } else {
          // If no layout exists for this device type, set defaults
          setShapes(getInitialShapes(deviceType));
          setTableColor(DEFAULT_TABLE_COLOR);
          setChairColor(DEFAULT_CHAIR_COLOR);
          setMapUrl(DEFAULT_MAP_URL);
          setCanvasWidth(deviceType === "mobile" ? 450 : DEFAULT_CANVAS_WIDTH);
          setCanvasHeight(DEFAULT_CANVAS_HEIGHT);
        }
      } catch (err) {
        setSaveStatus("Failed to load layout");
      } finally {
        setLoading(false);
      }
    };
    fetchLayout();
    // eslint-disable-next-line
  }, [deviceType, currentTemplate]);

  // Save layout to backend
  const handleSaveLayout = async (shapesToSave) => {
    setLoading(true);
    setSaveStatus("");
    try {
      const shapesData = shapesToSave || shapes;
      const tables = shapesData
        .filter((s) => s.type === "round-table" || s.type === "corner-table")
        .map((s) => ({
          id: s.id,
          type: s.type,
          x: s.x,
          y: s.y,
          radius: s.radius,
          width: s.width,
          height: s.height,
          color: tableColor,
        }));
      const chairs = shapesData
        .filter((s) => s.type === "chair")
        .map((s) => ({
          id: s.id,
          x: s.x,
          y: s.y,
          width: s.width,
          height: s.height,
          color: chairColor,
        }));
      await api.put("/admin/cafe/cafe-layout", {
        tables,
        chairs,
        bgImageUrl: mapUrl,
        canvasWidth,
        canvasHeight,
        deviceType,
        templateName: currentTemplate,
        changeType: "updated",
      });
      setSaveStatus("Layout saved successfully!");
    } catch (err) {
      setSaveStatus("Failed to save layout");
    } finally {
      setLoading(false);
    }
  };

  // Handle template change
  const handleTemplateChange = (templateName) => {
    setCurrentTemplate(templateName);
  };

  // --- Helper to get next ID for any shape ---
  const getNextId = (prefix) => {
    const nums = shapes
      .map((s) => parseInt(s.id.replace(prefix, ""), 10))
      .filter((n) => !isNaN(n));
    const max = nums.length ? Math.max(...nums) : 0;
    return `${prefix}${max + 1}`;
  };

  // --- Handlers for adding new shapes ---
  const handleAddShape = (type) => {
    let newShape;

    // Modified: Calculate position based on the visible center of the stage
    if (!stageContainerRef.current) return;
    const container = stageContainerRef.current;
    const position = {
      x: (container.scrollLeft + container.clientWidth / 2) / scale,
      y: (container.scrollTop + container.clientHeight / 2) / scale,
    };

    switch (type) {
      case "round-table":
        newShape = {
          id: getNextId("t"),
          type,
          ...position,
          radius: 40,
        };
        break;
      case "corner-table":
        newShape = {
          id: getNextId("ct"),
          type,
          ...position,
          width: 70,
          height: 70,
        };
        break;
      case "chair":
        newShape = {
          id: getNextId("c"),
          type,
          ...position,
          width: 32,
          height: 32,
        };
        break;
      case "text":
        newShape = {
          id: getNextId("txt"),
          type,
          text: "New Text",
          ...position,
        };
        break;
      default:
        return;
    }
    setShapes([...shapes, newShape]);
  };

  const handleDeleteSelected = () => {
    if (!selectedId) return;
    setShapes(shapes.filter((shape) => shape.id !== selectedId));
    setSelectedId(null);
  };

  const handleDragEnd = (id, e) => {
    const newShapes = shapes.slice();
    const shape = newShapes.find((s) => s.id === id);
    if (shape) {
      shape.x = e.target.x();
      shape.y = e.target.y();
      setShapes(newShapes);
    }
  };

  const handleZoom = (direction) => {
    const scaleBy = 1.1;
    setScale(direction === "in" ? scale * scaleBy : scale / scaleBy);
  };

  const handleColorChange = (color, typesToUpdate) => {
    if (typesToUpdate.includes("chair")) setChairColor(color);
    if (typesToUpdate.some((t) => t.includes("table"))) setTableColor(color);
  };

  const getShapeFillColor = (shape) => {
    switch (shape.type) {
      case "round-table":
      case "corner-table":
        return tableColor;
      case "chair":
        return chairColor;
      case "text":
        return textColor;
      default:
        return "black";
    }
  };

  // In renderShape, scale down bg image for mobile
  const renderShape = (shape) => {
    const { id, ...rest } = shape;
    const commonProps = {
      id: shape.id,
      x: shape.x,
      y: shape.y,
      draggable: true,
      onClick: () => setSelectedId(shape.id),
      onTap: () => setSelectedId(shape.id),
      onDragEnd: (e) => handleDragEnd(shape.id, e),
      onMouseEnter: () => setHoveredId(shape.id),
      onMouseLeave: () => setHoveredId(null),
      stroke:
        selectedId === shape.id
          ? "red"
          : hoveredId === shape.id
          ? "yellow"
          : "black",
      strokeWidth: selectedId === shape.id ? 5 : hoveredId === shape.id ? 4 : 2,
    };
    const textLabel = (
      <Text
        x={shape.x - (shape.width || shape.radius * 2) / 2}
        y={shape.y - FONT_SIZE / 2}
        width={shape.width || shape.radius * 2}
        text={shape.id}
        fontSize={FONT_SIZE}
        fontStyle="bold"
        fill="#fff"
        align="center"
        verticalAlign="middle"
        listening={false}
      />
    );
    switch (shape.type) {
      case "round-table":
        return (
          <React.Fragment key={shape.id}>
            <Circle
              key={shape.id}
              {...commonProps}
              radius={shape.radius}
              fill={getShapeFillColor(shape)}
            />
            {textLabel}
          </React.Fragment>
        );
      case "corner-table":
      case "chair":
        return (
          <React.Fragment key={shape.id}>
            <Rect
              key={shape.id}
              {...commonProps}
              width={shape.width}
              height={shape.height}
              fill={getShapeFillColor(shape)}
              offsetX={shape.width / 2}
              offsetY={shape.height / 2}
            />
            {textLabel}
          </React.Fragment>
        );
      case "text":
        return (
          <Text
            key={shape.id}
            {...commonProps}
            text={shape.text}
            fontSize={FONT_SIZE}
            fontStyle="bold"
            fill={textColor}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bar-map-editor-root p-2 md:p-4">
      <EditorSettings
        deviceType={deviceType}
        setDeviceType={setDeviceType}
        mapUrl={mapUrl}
        setMapUrl={setMapUrl}
        canvasWidth={canvasWidth}
        setCanvasWidth={setCanvasWidth}
        canvasHeight={canvasHeight}
        setCanvasHeight={setCanvasHeight}
        DEVICE_TYPES={DEVICE_TYPES}
      />

      {/* Template Manager */}
      <TemplateManager
        currentTemplate={currentTemplate}
        onTemplateChange={handleTemplateChange}
        deviceType={deviceType}
        onSaveLayout={() => handleSaveLayout(shapes)}
      />

      {loading && (
        <div className="text-black bg-yellow-200 px-4 py-2 rounded mb-2 font-medium">
          Loading...
        </div>
      )}
      {saveStatus && (
        <div
          className={`px-4 py-2 rounded mb-2 font-medium ${
            saveStatus.includes("success")
              ? "text-green-700 bg-green-100"
              : "text-red-700 bg-red-100"
          }`}
        >
          {saveStatus}
        </div>
      )}
      <Toolbar
        onAddShape={handleAddShape}
        onZoom={handleZoom}
        onDeleteSelected={handleDeleteSelected}
        selectedId={selectedId}
        tableColor={tableColor}
        chairColor={chairColor}
        onColorChange={handleColorChange}
      />
      {/* Mobile editing desktop layout warning */}
      {actualDeviceType === "mobile" && deviceType === "desktop" && (
        <div className="mb-3 p-3 bg-blue-100 border border-blue-300 rounded-md text-blue-800 text-sm">
          📱 You're editing the <strong>Desktop</strong> layout on a mobile
          device. The canvas is scaled down for easier editing. The actual
          desktop layout will be full-sized.
        </div>
      )}

      <StageArea
        shapes={shapes}
        renderShape={renderShape}
        mapImage={mapImage}
        scale={scale}
        stageContainerRef={stageContainerRef}
        CANVAS_WIDTH={canvasWidth}
        CANVAS_HEIGHT={canvasHeight}
        deviceType={deviceType}
        actualDeviceType={actualDeviceType}
      />
    </div>
  );
};

export default BarMapEditor;
