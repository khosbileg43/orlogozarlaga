import React from "react";
import { LucideIcon } from "lucide-react";

type TransactionRowProps = {
  Icon: LucideIcon;
  title: string;
  meta: string;
  amount: string;
  amountClassName?: string;
  actions?: React.ReactNode;
};

const TransactionRow: React.FC<TransactionRowProps> = ({
  Icon,
  title,
  meta,
  amount,
  amountClassName = "text-lg md:text-xl text-end font-semibold",
  actions,
}) => {
  return (
    <div className="theme-card-default flex items-center gap-4 rounded-xl px-3 py-2.5">
      <div className="theme-surface-soft theme-icon grid h-9 w-9 place-items-center rounded-lg">
        <Icon size={18} />
      </div>
      <div className="flex-1">
        <p className="theme-heading text-sm font-medium">{title}</p>
        <p className="theme-muted text-xs">{meta}</p>
      </div>
      <div className="flex items-center gap-3">
        <p className={`theme-text ${amountClassName}`}>{amount}</p>
        {actions}
      </div>
    </div>
  );
};

export default TransactionRow;
