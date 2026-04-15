import React from "react";

type InputFieldProps = {
  label: string;
  type: "text" | "number" | "date";
  placeholder?: string;
  wrapperClassName?: string;
  inputClassName?: string;
  alignEnd?: boolean;
  value?: string | number;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  min?: string | number;
  step?: string | number;
  disabled?: boolean;
};

const InputField: React.FC<InputFieldProps> = ({
  label,
  type,
  placeholder,
  wrapperClassName = "w-full rounded-xl border border-[#d4e3d9] bg-[#f4faf6] p-2.5",
  inputClassName = "mt-1 rounded-lg w-full border border-[#d5e3da] bg-white px-2.5 py-2 outline-none focus:border-[#65a48b]",
  alignEnd = false,
  value,
  onChange,
  min,
  step,
  disabled = false,
}) => {
  return (
    <div className={wrapperClassName}>
      <p
        className={`text-xs font-medium uppercase tracking-[0.12em] text-[#4f665c] ${
          alignEnd ? "w-full" : ""
        }`}>
        {label}
      </p>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        min={min}
        step={step}
        disabled={disabled}
        className={`${inputClassName} ${alignEnd ? "text-end" : ""}`}
      />
    </div>
  );
};

export default InputField;
