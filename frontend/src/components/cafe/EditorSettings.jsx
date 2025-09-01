import React from "react";

const EditorSettings = ({
  deviceType,
  setDeviceType,
  mapUrl,
  setMapUrl,
  canvasWidth,
  setCanvasWidth,
  canvasHeight,
  setCanvasHeight,
  DEVICE_TYPES,
}) => (
  <>
    {/* Device type toggle */}
    <div className="flex gap-4 items-center mb-4">
      <span className="font-medium text-gray-800">Edit Layout For:</span>
      {DEVICE_TYPES.map((dt) => (
        <label
          key={dt.value}
          className="flex items-center gap-1 font-medium text-gray-800"
        >
          <input
            type="radio"
            name="deviceType"
            value={dt.value}
            checked={deviceType === dt.value}
            onChange={() => setDeviceType(dt.value)}
            className="accent-blue-600"
          />
          {dt.label}
        </label>
      ))}
    </div>
    {/* Controls for background image and canvas size */}
    <div
      className={`flex flex-wrap gap-4 items-center mb-4 bg-gray-100 text-gray-800 p-3 rounded-lg border border-gray-300 ${
        deviceType === "mobile" ? "max-w-[480px]" : ""
      }`}
    >
      <label className="font-medium flex flex-col sm:flex-row items-center gap-2">
        Background Image:
        <input
          type="text"
          value={mapUrl}
          onChange={(e) => setMapUrl(e.target.value)}
          placeholder="Paste image URL here"
          className="w-full sm:w-[320px] px-2 py-1 border border-gray-300 rounded text-gray-800 bg-white"
        />
      </label>
      <label className="font-medium flex flex-col sm:flex-row items-center gap-2">
        Canvas Width:
        <input
          type="number"
          value={canvasWidth}
          min={100}
          max={5000}
          onChange={(e) => setCanvasWidth(Number(e.target.value))}
          className="w-[80px] px-2 py-1 border border-gray-300 rounded text-gray-800 bg-white"
        />
      </label>
      <label className="font-medium flex flex-col sm:flex-row items-center gap-2">
        Canvas Height:
        <input
          type="number"
          value={canvasHeight}
          min={100}
          max={5000}
          onChange={(e) => setCanvasHeight(Number(e.target.value))}
          className="w-[80px] px-2 py-1 border border-gray-300 rounded text-gray-800 bg-white"
        />
      </label>
    </div>
  </>
);

export default EditorSettings;
