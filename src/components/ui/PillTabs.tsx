import React from "react";

type Tab = { label: string; value: string; className?: string };

type PillTabsProps = {
  tabs: Tab[];
  active: string;
  onChange?: (value: string) => void;
  containerClassName?: string;
  buttonBaseClassName?: string;
};

const PillTabs: React.FC<PillTabsProps> = ({
  tabs,
  active,
  onChange,
  containerClassName = "flex gap-1 p-1 rounded-full bg-[#B6D9C9]",
  buttonBaseClassName = "cursor-pointer px-3 py-1 rounded-full text-[#F1F3F2]",
}) => {
  return (
    <div className={containerClassName}>
      {tabs.map((t) => {
        const isActive = t.value === active;
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange?.(t.value)}
            className={`${buttonBaseClassName} ${t.className ?? ""} ${
              isActive ? "bg-[#49A078]" : "bg-[#79A5A5]"
            }`}>
            {t.label}
          </button>
        );
      })}
    </div>
  );
};

export default PillTabs;
