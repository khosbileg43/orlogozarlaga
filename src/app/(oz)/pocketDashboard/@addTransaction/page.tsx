"use client";
import React, { useState } from "react";
import PillTabs from "@/components/ui/PillTabs";
import StatCard from "@/components/ui/StatCard";
import InputField from "@/components/ui/InputField";

const AddTransaction = () => {
  const [type, setType] = useState<"income" | "expense">("income");

  return (
    <div className="bg-white h-fit p-5 fixed top-8 right-8 rounded-lg flex flex-col items-center gap-3 w-90">
      <PillTabs
        active={type}
        onChange={(v) => setType(v as "income" | "expense")}
        tabs={[
          { label: "Income", value: "income" },
          { label: "Expense", value: "expense" },
        ]}
      />

      <StatCard
        title="Cash"
        value="1,000,000 ￥"
        className="bg-[#A6C3C3] w-full"
        valueClassName="text-end"
      />
      <StatCard
        title="Salary"
        value="1,000,000 ￥"
        className="bg-[#B6D9C9] w-full"
        valueClassName="text-end"
      />

      <InputField
        label="Price"
        type="number"
        placeholder="Enter amount"
        alignEnd
        wrapperClassName="bg-[#D7E8D9] w-full p-2 rounded-lg flex flex-col"
      />

      <InputField
        label="Description"
        type="text"
        placeholder="Enter description"
        alignEnd
        wrapperClassName="bg-[#D7E8D9] w-full p-2 rounded-lg flex flex-col"
      />

      {/* Date: native date дээр text-end ажиллахгүй байж магадгүй */}
      <div className="bg-[#EAEDEB] w-full p-2 rounded-lg flex flex-col items-end">
        <p className="w-full">Date</p>
        <input
          type="date"
          className="rounded px-2 py-1 border-none appearance-none outline-none"
        />
      </div>

      <button className="bg-[#6DB393] text-white w-full py-2 cursor-pointer rounded-lg">
        Add Transaction
      </button>
    </div>
  );
};

export default AddTransaction;
