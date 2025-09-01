import React from "react";
import {
  CheckIcon,
  CurrencyDollarIcon,
  GiftIcon,
} from "@heroicons/react/24/outline";

const GiftCardStats = ({ stats }) => {
  const statItems = [
    {
      label: "Total Gift Cards",
      value: stats.totalGiftCards || 0,
      icon: GiftIcon,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Active Cards",
      value: stats.activeCards || 0,
      icon: CheckIcon,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      label: "Total Value",
      value: `$${stats.totalValue || 0}`,
      icon: CurrencyDollarIcon,
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
    {
      label: "Remaining Balance",
      value: `$${stats.totalBalance || 0}`,
      icon: CurrencyDollarIcon,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-2 ${item.bgColor} rounded-lg`}>
                <Icon className={`w-6 h-6 ${item.iconColor}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {item.label}
                </p>
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GiftCardStats;
