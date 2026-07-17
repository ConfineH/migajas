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

export const inputClassName = "field-input";

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
      <label htmlFor={id} className="text-sm font-medium text-foreground">
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
