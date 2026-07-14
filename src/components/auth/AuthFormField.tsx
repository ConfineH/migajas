interface AuthFormFieldProps {
  id: string;
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  placeholder?: string;
}

const inputClassName =
  "w-full rounded-xl border border-emerald-200 px-4 py-3 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200";

export function AuthFormField({
  id,
  label,
  name,
  type = "text",
  autoComplete,
  required = true,
  minLength,
  placeholder,
}: AuthFormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        placeholder={placeholder}
        className={inputClassName}
      />
    </div>
  );
}

export { inputClassName };
