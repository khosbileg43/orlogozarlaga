"use client";
import React from "react";
import StatCard from "@/components/ui/StatCard";

const SummaryPanel = () => {
  return (
    <div className="flex flex-col items-center p-2 bg-white w-full rounded-xl gap-2 h-fit">
      <div className="flex gap-2">
        <button className="text-xs px-3 cursor-pointer py-2 bg-[#B6D9C9] rounded-lg">
          {"<"}
        </button>
        <button className="text-xs px-3 cursor-pointer py-2 bg-[#B6D9C9] rounded-lg">
          This month
        </button>
        <button className="text-xs px-3 cursor-pointer py-2 bg-[#B6D9C9] rounded-lg">
          {">"}
        </button>
      </div>

      <div className="flex w-full gap-2">
        <div className="flex flex-1 flex-col gap-2">
          <StatCard
            title="Income"
            value="1,000,000 ￥"
            className="w-full flex-1 bg-[#49A078] text-[#F1F3F2]"
            valueClassName="text-2xl text-end"
          />

          {Array.from({ length: 2 }).map((_, index) => (
            <StatCard
              key={`income-${index}`}
              title="Salary"
              value="1,000,000 ￥"
              className="w-full flex-1 bg-[#B6D9C9] text-[#1F2421]"
              valueClassName="text-xl text-end"
            />
          ))}
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <StatCard
            title="Expenses"
            value="1,000,000 ￥"
            className="w-full flex-1 bg-[#216869] text-[#F1F3F2]"
            valueClassName="text-2xl text-end"
          />

          {Array.from({ length: 2 }).map((_, index) => (
            <StatCard
              key={`expense-${index}`}
              title="Food"
              value="1,000,000 ￥"
              className="w-full flex-1 bg-[#A6C3C3] text-[#1F2421]"
              valueClassName="text-xl text-end"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SummaryPanel;
