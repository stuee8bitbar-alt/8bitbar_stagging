import React from "react";
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Circle,
  Rect,
  Text,
} from "react-konva";
import useImage from "use-image";

const CafeLayoutViewer = ({
  layout,
  selectedChairs,
  bookedChairs,
  onChairSelect,
  deviceType,
  chairSelectionEnabled,
}) => {
  const [mapImage] = useImage(layout.bgImageUrl);

  const MOBILE_SCALE = 0.7;
  const scale = deviceType === "mobile" ? MOBILE_SCALE : 1;

  const getChairColor = (chairId) => {
    if (bookedChairs.includes(chairId)) {
      return "#666666"; // Gray for booked chairs
    }
    if (selectedChairs.includes(chairId)) {
      return "#00ff00"; // Green for selected chairs
    }
    return "#A0522D"; // Default brown color
  };

  const getChairStroke = (chairId) => {
    if (bookedChairs.includes(chairId)) {
      return "#444444";
    }
    if (selectedChairs.includes(chairId)) {
      return "#00cc00";
    }
    return "#8B4513";
  };

  const isChairClickable = (chairId) => {
    return !bookedChairs.includes(chairId) && chairSelectionEnabled;
  };

  const handleChairClick = (chairId) => {
    if (!chairSelectionEnabled) return;
    if (isChairClickable(chairId)) {
      onChairSelect(chairId);
    }
  };

  const renderChair = (chair) => {
    const isClickable = isChairClickable(chair.id);
    return (
      <React.Fragment key={chair.id}>
        <Rect
          x={chair.x}
          y={chair.y}
          width={chair.width}
          height={chair.height}
          fill={getChairColor(chair.id)}
          stroke={getChairStroke(chair.id)}
          strokeWidth={selectedChairs.includes(chair.id) ? 3 : 2}
          offsetX={chair.width / 2}
          offsetY={chair.height / 2}
          onClick={() => handleChairClick(chair.id)}
          onTap={() => handleChairClick(chair.id)}
          cursor={isClickable ? "pointer" : "not-allowed"}
          opacity={bookedChairs.includes(chair.id) ? 0.5 : 1}
          listening={true}
        />
        {/* Chair ID Label */}
        <Text
          x={chair.x - chair.width / 2}
          y={chair.y - 10}
          width={chair.width}
          text={chair.id}
          fontSize={12}
          fontStyle="bold"
          fill="#fff"
          align="center"
          verticalAlign="middle"
          listening={false}
        />
      </React.Fragment>
    );
  };

  const renderTable = (table) => {
    if (table.type === "round-table") {
      return (
        <React.Fragment key={table.id}>
          <Circle
            x={table.x}
            y={table.y}
            radius={table.radius}
            fill={table.color || "#228B22"}
            stroke="#1F5F1F"
            strokeWidth={2}
            listening={false}
          />
          {/* Table ID Label */}
          <Text
            x={table.x - table.radius}
            y={table.y - 8}
            width={table.radius * 2}
            text={table.id}
            fontSize={14}
            fontStyle="bold"
            fill="#fff"
            align="center"
            verticalAlign="middle"
            listening={false}
          />
        </React.Fragment>
      );
    }

    if (table.type === "corner-table") {
      return (
        <React.Fragment key={table.id}>
          <Rect
            x={table.x}
            y={table.y}
            width={table.width}
            height={table.height}
            fill={table.color || "#228B22"}
            stroke="#1F5F1F"
            strokeWidth={2}
            offsetX={table.width / 2}
            offsetY={table.height / 2}
            listening={false}
          />
          {/* Table ID Label */}
          <Text
            x={table.x - table.width / 2}
            y={table.y - 8}
            width={table.width}
            text={table.id}
            fontSize={14}
            fontStyle="bold"
            fill="#fff"
            align="center"
            verticalAlign="middle"
            listening={false}
          />
        </React.Fragment>
      );
    }

    return null;
  };

  const canvasWidth = layout.canvasWidth || 1000;
  const canvasHeight = layout.canvasHeight || 2400;

  return (
    <div className="bg-gray-900/50 border border-pink-500/30 rounded-lg p-4">
      <h3 className="text-xl font-bold mb-4 text-cyan-400">
        Ticket Show Layout
      </h3>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#A0522D] border border-[#8B4513]"></div>
          <span>Available Chair</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 border border-green-600"></div>
          <span>Selected Chair</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-600 border border-gray-700 opacity-50"></div>
          <span>Booked Chair</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-700 rounded-full"></div>
          <span>Table (Not Bookable)</span>
        </div>
      </div>

      {/* Selection Summary */}
      {selectedChairs.length > 0 && (
        <div className="mt-4 p-3 bg-green-900/30 border border-green-500/50 rounded">
          <p className="text-green-400 font-semibold">
            Selected Chairs: {selectedChairs.join(", ")} (
            {selectedChairs.length} chair{selectedChairs.length > 1 ? "s" : ""})
          </p>
        </div>
      )}

      {!chairSelectionEnabled && (
        <div className="mb-2 text-sm text-red-700 bg-red-50 rounded px-3 py-2">
          Please select a date and time before choosing a chair.
        </div>
      )}

      <div
        className="border border-gray-600 rounded overflow-auto"
        style={{
          maxHeight: "600px",
          maxWidth: "100%",
        }}
      >
        <div
          style={{
            width: canvasWidth * scale,
            height: canvasHeight * scale,
            minWidth: "100%",
            minHeight: "400px",
          }}
        >
          <Stage
            width={canvasWidth * scale}
            height={canvasHeight * scale}
            scaleX={scale}
            scaleY={scale}
          >
            <Layer>
              {/* Background Image */}
              {mapImage && (
                <KonvaImage
                  image={mapImage}
                  width={canvasWidth}
                  height={canvasHeight}
                  listening={false}
                />
              )}

              {/* Render Tables */}
              {layout.tables?.map(renderTable)}

              {/* Render Chairs */}
              {layout.chairs?.map(renderChair)}
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  );
};

export default CafeLayoutViewer;
