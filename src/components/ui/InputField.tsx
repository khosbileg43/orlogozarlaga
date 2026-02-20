import React from "react";

type InputFieldProps = {
  label: string;
  type: "text" | "number" | "date";
  placeholder?: string;
  wrapperClassName?: string;
  inputClassName?: string;
  alignEnd?: boolean;
};

const InputField: React.FC<InputFieldProps> = ({
  label,
  type,
  placeholder,
  wrapperClassName = "bg-[#D7E8D9] w-full p-2 rounded-lg flex flex-col",
  inputClassName = "rounded px-2 py-1 border-none appearance-none outline-none",
  alignEnd = false,
}) => {
  return (
    <div className={wrapperClassName}>
      <p className={alignEnd ? "w-full" : ""}>{label}</p>
      <input
        type={type}
        placeholder={placeholder}
        className={`${inputClassName} ${alignEnd ? "text-end" : ""}`}
      />
    </div>
  );
};

export default InputField;
