"use client";
import { ChartNoAxesCombined, TrendingDown } from "lucide-react";
import React from "react";
import TransactionRow from "@/components/ui/TransactionRow";

const Transactions = () => {
  return (
    <div className="px-2 py-4 flex flex-col gap-2 w-full bg-white rounded-xl">
      <div className="flex ml-2 gap-2 items-center">
        <ChartNoAxesCombined />
        <p className="text-xs">Last transactions</p>
      </div>

      <div className="flex ml-2 gap-2">
        <button className="text-xs cursor-pointer px-3 py-2 bg-[#B6D9C9] text-[#F1F3F2] rounded-lg">
          All
        </button>
        <button className="text-xs cursor-pointer px-3 py-2 bg-[#49A078] text-[#F1F3F2] rounded-lg">
          Income
        </button>
        <button className="text-xs cursor-pointer px-3 py-2 bg-[#216869] text-[#F1F3F2] rounded-lg">
          Expense
        </button>
      </div>

      <div className="bg-[#A5A7A6] flex flex-col gap-px">
        {Array.from({ length: 20 }).map((_, idx) => (
          <TransactionRow
            key={`tx-${idx}`}
            Icon={TrendingDown}
            title="Description"
            meta="Food | 02/16/2026"
            amount="-1,000 ￥"
          />
        ))}
      </div>
    </div>
  );
};

export default Transactions;
