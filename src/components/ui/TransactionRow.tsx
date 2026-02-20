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
  amountClassName = "text-2xl text-end",
}) => {
  return (
    <div className="bg-white flex gap-5 items-center px-2 py-1">
      <Icon />
      <div className="flex-1">
        <p>{title}</p>
        <p className="text-xs">{meta}</p>
      </div>
      <p className={amountClassName}>{amount}</p>
    </div>
  );
};

export default TransactionRow;
