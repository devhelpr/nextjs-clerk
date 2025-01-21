import React from "react";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const FormInput = ({
  label,
  className = "",
  ...props
}: FormInputProps) => {
  return (
    <div className="flex flex-col">
      {label && (
        <label className="mb-1 text-sm text-gray-600 dark:text-gray-400">
          {label}
        </label>
      )}
      <input
        className={`border rounded px-2 py-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400 ${className}`}
        {...props}
      />
    </div>
  );
};
