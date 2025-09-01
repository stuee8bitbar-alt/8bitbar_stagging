import React from "react";

const BookingFilters = ({
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
  onRefresh,
  filteredCount,
  totalCount,
}) => {
  const clearFilters = () => {
    setStatusFilter("all");
    setDateFilter("");
  };

  const hasActiveFilters = statusFilter !== "all" || dateFilter;

  return (
    <div className="mb-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
        Cafe Bookings Management
      </h1>

      {/* Filters - Responsive */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Status Filter */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white min-w-[140px]"
            >
              <option value="all">All Bookings</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            />
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="flex flex-col justify-end">
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm md:text-base"
        >
          Refresh
        </button>
      </div>

      {/* Results Count */}
      <div className="mt-4 text-sm text-gray-600">
        Showing {filteredCount} of {totalCount} bookings
        {statusFilter !== "all" && ` (${statusFilter})`}
        {dateFilter && ` for ${new Date(dateFilter).toLocaleDateString()}`}
      </div>
    </div>
  );
};

export default BookingFilters;
