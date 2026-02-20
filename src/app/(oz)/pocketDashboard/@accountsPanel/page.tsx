"use client";
import React from "react";
import StatCard from "@/components/ui/StatCard";

const AccountsPanel = () => {
  return (
    <div className="flex flex-col p-2 bg-white rounded-xl gap-2 h-fit">
      <StatCard
        title="Total balance"
        value="3,000,000 ￥"
        className="w-55 bg-[#9CC5A1] text-[#F1F3F2]"
        valueClassName="text-2xl text-end"
      />

      {Array.from({ length: 2 }).map((_, index) => (
        <StatCard
          key={`acct-${index}`}
          title="Cash"
          value="1,000,000 ￥"
          className="w-55 bg-[#EAEDEB] text-[#1F2421]"
          valueClassName="text-xl text-end"
        />
      ))}
    </div>
  );
};

export default AccountsPanel;
