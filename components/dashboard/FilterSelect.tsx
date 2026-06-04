"use client";

type FilterSelectOption = {
  value: string;
  label: string;
};

type FilterSelectProps = {
  label: string;
  id: string;
  options: FilterSelectOption[];
  defaultValue?: string;
  value?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
};

export function FilterSelect({
  label,
  id,
  options,
  defaultValue,
  value,
  disabled,
  onChange,
}: FilterSelectProps) {
  const isControlled = value !== undefined;

  return (
    <label className="filter-control" htmlFor={id}>
      <span className="filter-control__label">{label}</span>
      <select
        id={id}
        className="filter-control__select"
        value={isControlled ? value : undefined}
        defaultValue={isControlled ? undefined : (defaultValue ?? options[0]?.value)}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
