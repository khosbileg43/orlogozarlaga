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
  valueClassName = "text-xl text-end",
}) => {
  return (
    <div className={`flex flex-col rounded-lg p-2 ${className}`}>
      <p>{title}</p>
      <p className={valueClassName}>{value}</p>
    </div>
  );
};

export default StatCard;
