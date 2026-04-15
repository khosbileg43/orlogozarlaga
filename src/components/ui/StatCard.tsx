import React from "react";

type StatCardProps = {
  title: string;
  value: string;
  className?: string; // background/text өнгө зэрэг
  valueClassName?: string; // value font size / align
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  className = "",
  valueClassName = "text-xl text-end font-semibold",
}) => {
  return (
    <div
      className={`flex flex-col rounded-2xl border border-white/50 p-3 shadow-[0_8px_20px_rgba(15,45,33,0.08)] ${className} `}>
      <p className="text-xs uppercase tracking-[0.14em] opacity-80">{title}</p>
      <p className={valueClassName}>{value}</p>
    </div>
  );
};

export default StatCard;
