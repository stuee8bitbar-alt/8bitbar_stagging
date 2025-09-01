import React from "react";

const Pagination = ({ pagination, currentPage, onPageChange }) => {
  if (pagination.totalPages <= 1) return null;

  return (
    <div className="mt-6 flex justify-center">
      <nav className="flex space-x-2">
        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
          (page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                page === currentPage
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
            >
              {page}
            </button>
          )
        )}
      </nav>
    </div>
  );
};

export default Pagination;
