import React from "react";
import { LucideIcon } from "lucide-react";

type TransactionRowProps = {
  Icon: LucideIcon;
  title: string;
  meta: string;
  amount: string;
  amountClassName?: string;
};

const TransactionRow: React.FC<TransactionRowProps> = ({
  Icon,
  title,
  meta,
  amount,
  amountClassName = "text-lg md:text-xl text-end font-semibold",
}) => {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#d6e3db] bg-white/85 px-3 py-2.5 shadow-[0_6px_14px_rgba(23,52,39,0.05)]">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#edf5ef] text-[#1f5d52]">
        <Icon size={18} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-[#17352b]">{title}</p>
        <p className="text-xs text-[#4f665c]">{meta}</p>
      </div>
      <p className={`text-[#1f2f28] ${amountClassName}`}>{amount}</p>
    </div>
  );
};

export default TransactionRow;
