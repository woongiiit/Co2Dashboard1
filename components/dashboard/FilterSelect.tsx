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
  /** 라벨 옆 (?) 툴팁 본문. 줄바꿈은 \\n */
  hint?: string;
};

export function FilterSelect({
  label,
  id,
  options,
  defaultValue,
  value,
  disabled,
  onChange,
  hint,
}: FilterSelectProps) {
  const isControlled = value !== undefined;
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <label className="filter-control" htmlFor={id}>
      <span className="filter-control__label-row">
        <span className="filter-control__label">{label}</span>
        {hint ? (
          <button
            type="button"
            className="filter-control__hint"
            aria-label={`${label} 설명`}
            aria-describedby={hintId}
            title={hint}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
          >
            ?
            <span id={hintId} className="filter-control__hint-bubble" role="tooltip">
              {hint.split("\n").map((line) => (
                <span key={line} className="filter-control__hint-line">
                  {line}
                </span>
              ))}
            </span>
          </button>
        ) : null}
      </span>
      <select
        id={id}
        className="filter-control__select"
        value={isControlled ? value : undefined}
        defaultValue={isControlled ? undefined : (defaultValue ?? options[0]?.value)}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        aria-describedby={hintId}
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
