import React from "react";
import {
  PlusCircle,
  ZoomIn,
  ZoomOut,
  Trash2,
} from "lucide-react";

const Toolbar = ({
  onAddShape,
  onZoom,
  onDeleteSelected,
  selectedId,
  tableColor,
  chairColor,
  onColorChange,
}) => (
  <div className="sticky top-0 z-10 flex flex-wrap items-center w-full max-w-full gap-3 p-3 mb-4 bg-gray-100 border border-gray-300 rounded-lg">
    <button
      className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-full transition-all hover:bg-gray-200 focus:outline-none disabled:opacity-50"
      onClick={() => onAddShape("corner-table")}
    >
      <PlusCircle className="w-4 h-4" />
      Corner Table
    </button>

    <button
      className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-full transition-all hover:bg-gray-200 focus:outline-none disabled:opacity-50"
      onClick={() => onAddShape("round-table")}
    >
      <PlusCircle className="w-4 h-4" />
      Round Table
    </button>

    <button
      className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-full transition-all hover:bg-gray-200 focus:outline-none disabled:opacity-50"
      onClick={() => onAddShape("chair")}
    >
      <PlusCircle className="w-4 h-4" />
      Chair
    </button>

    <button
      className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-full transition-all hover:bg-gray-200 focus:outline-none disabled:opacity-50"
      onClick={() => onZoom("in")}
    >
      <ZoomIn className="w-4 h-4" />
      Zoom In
    </button>

    <button
      className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-full transition-all hover:bg-gray-200 focus:outline-none disabled:opacity-50"
      onClick={() => onZoom("out")}
    >
      <ZoomOut className="w-4 h-4" />
      Zoom Out
    </button>

    <button
      className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-full transition-all hover:bg-gray-200 focus:outline-none disabled:opacity-50"
      onClick={onDeleteSelected}
      disabled={!selectedId}
    >
      <Trash2 className="w-4 h-4" />
      Delete
    </button>

    <div className="flex items-center gap-2">
      <label className="text-xs font-medium text-gray-700">Table Color:</label>
      <input
        type="color"
        value={tableColor}
        onChange={(e) =>
          onColorChange(e.target.value, ["round-table", "corner-table"])
        }
        className="w-8 h-8 p-0 border-none rounded cursor-pointer bg-transparent"
      />
    </div>

    <div className="flex items-center gap-2">
      <label className="text-xs font-medium text-gray-700">Chair Color:</label>
      <input
        type="color"
        value={chairColor}
        onChange={(e) => onColorChange(e.target.value, ["chair"])}
        className="w-8 h-8 p-0 border-none rounded cursor-pointer bg-transparent"
      />
    </div>
  </div>
);

export default Toolbar;
