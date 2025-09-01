import React from "react";

const GiftCardDetails = ({ giftCard, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Gift Card Details
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Code
              </label>
              <p className="mt-1 text-sm text-gray-900 font-mono">
                {giftCard.code}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Amount
              </label>
              <p className="mt-1 text-sm text-gray-900">${giftCard.amount}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Balance
              </label>
              <p className="mt-1 text-sm text-gray-900">${giftCard.balance}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Type
              </label>
              <p className="mt-1 text-sm text-gray-900">{giftCard.type}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <p className="mt-1 text-sm text-gray-900">{giftCard.status}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Created
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(giftCard.createdAt).toLocaleString("en-US", {
                  timeZone: "UTC",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {giftCard.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {giftCard.description}
                </p>
              </div>
            )}

            {giftCard.purchasedBy && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Purchased By
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {giftCard.purchasedBy.name}
                </p>
              </div>
            )}

            {giftCard.usageHistory && giftCard.usageHistory.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Usage History
                </label>
                <div className="mt-1 space-y-2">
                  {giftCard.usageHistory.map((usage, index) => (
                    <div
                      key={index}
                      className="text-xs text-gray-600 border-l-2 border-gray-200 pl-2"
                    >
                      Used ${usage.amount} on{" "}
                      {new Date(usage.usedAt).toLocaleDateString("en-US", {
                        timeZone: "UTC",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                      {usage.bookingType && ` (${usage.bookingType})`}
                      <br />
                      Remaining: ${usage.remainingBalance}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftCardDetails;
