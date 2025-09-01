import React from "react";
import { PlusIcon } from "@heroicons/react/24/outline";

const GiftCardFilters = ({ filters, setFilters, onCreateClick }) => {
  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="flex-1 max-w-lg">
            <input
              type="text"
              placeholder="Search gift cards..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value, page: 1 })
              }
            />
          </div>

          <div className="flex space-x-3">
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value, page: 1 })
              }
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="used">Used</option>
              <option value="discarded">Discarded</option>
            </select>

            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.type}
              onChange={(e) =>
                setFilters({ ...filters, type: e.target.value, page: 1 })
              }
            >
              <option value="">All Types</option>
              <option value="predefined">Predefined</option>
              <option value="custom">Custom</option>
            </select>

            <button
              onClick={onCreateClick}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Gift Card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftCardFilters;
