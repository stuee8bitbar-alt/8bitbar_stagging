import React from "react";
import { Stage, Layer, Image as KonvaImage } from "react-konva";

const StageArea = ({
  shapes,
  renderShape,
  mapImage,
  scale,
  stageContainerRef,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  deviceType,
  actualDeviceType, // New prop for actual device being used
}) => {
  // Apply mobile scale based on actual device being used, not layout type being edited
  const MOBILE_SCALE = 0.7;
  const isOnMobileDevice = actualDeviceType === "mobile";
  const responsiveScale = isOnMobileDevice ? scale * MOBILE_SCALE : scale;

  return (
    <div
      ref={stageContainerRef}
      className="bar-map-editor-stage-container border border-gray-600 rounded overflow-auto"
      style={{
        maxHeight: "600px",
        maxWidth: "100%",
        width: "100%",
      }}
    >
      <div
        style={{
          width: CANVAS_WIDTH * responsiveScale,
          height: CANVAS_HEIGHT * responsiveScale,
          minWidth: "100%",
          minHeight: "400px",
        }}
      >
        <Stage
          width={CANVAS_WIDTH * responsiveScale}
          height={CANVAS_HEIGHT * responsiveScale}
          scaleX={responsiveScale}
          scaleY={responsiveScale}
        >
          <Layer>
            {mapImage && (
              <KonvaImage
                image={mapImage}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
              />
            )}
            {shapes.map((shape) => renderShape(shape))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default StageArea;
