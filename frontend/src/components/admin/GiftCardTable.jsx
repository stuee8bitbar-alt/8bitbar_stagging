import React from "react";
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

const GiftCardTable = ({
  giftCards,
  loading,
  onView,
  onEdit,
  onDiscard,
  onActivate,
}) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800", icon: CheckIcon },
      used: { color: "bg-gray-100 text-gray-800", icon: CheckIcon },
      discarded: { color: "bg-red-100 text-red-800", icon: TrashIcon },
    };

    const config = statusConfig[status] || statusConfig.active;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      predefined: { color: "bg-blue-100 text-blue-800" },
      custom: { color: "bg-purple-100 text-purple-800" },
    };

    const config = typeConfig[type] || typeConfig.predefined;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading gift cards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Balance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {giftCards.map((giftCard) => (
              <tr key={giftCard._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-mono text-sm font-medium text-gray-900">
                    {giftCard.code}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">
                    ${giftCard.amount}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    ${giftCard.balance}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getTypeBadge(giftCard.type)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(giftCard.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(giftCard.createdAt).toLocaleDateString("en-US", {
                    timeZone: "UTC",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onView(giftCard)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>

                    {giftCard.status !== "used" && (
                      <button
                        onClick={() => onEdit(giftCard)}
                        className="text-indigo-600 hover:text-indigo-900"
                        disabled={giftCard.purchasedBy}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    )}

                    {giftCard.status === "active" && (
                      <button
                        onClick={() => onDiscard(giftCard._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}

                    {giftCard.status === "discarded" && (
                      <button
                        onClick={() => onActivate(giftCard._id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <CheckIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GiftCardTable;
