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
  containerClassName = "grid w-full grid-cols-3 gap-1 rounded-xl bg-[#e8f1ec] p-1",
  buttonBaseClassName = "cursor-pointer rounded-lg px-3 py-2 text-sm font-medium",
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
              isActive
                ? "bg-[#2e7964] text-white shadow-[0_8px_18px_rgba(22,74,62,0.25)]"
                : "bg-transparent text-[#335247] hover:bg-[#dbeae2]"
            }`}>
            {t.label}
          </button>
        );
      })}
    </div>
  );
};

export default PillTabs;
