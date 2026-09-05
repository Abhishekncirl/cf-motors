import { type ReactNode, useId } from 'react';

interface BaseProps {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  hint?: string;
}

export function TextField({
  label,
  name,
  error,
  required,
  hint,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  inputMode,
}: BaseProps & {
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: 'text' | 'email' | 'tel' | 'numeric' | 'decimal';
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label} {required && <span className="text-brand-cyan">*</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
        onChange={(e) => onChange(e.target.value)}
        className="field-input"
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-brand-white/45">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextAreaField({
  label,
  name,
  error,
  required,
  hint,
  value,
  onChange,
  placeholder,
  rows = 4,
}: BaseProps & {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label} {required && <span className="text-brand-cyan">*</span>}
      </label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        value={value}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-err` : undefined}
        onChange={(e) => onChange(e.target.value)}
        className="field-input resize-y"
      />
      {hint && !error && <p className="mt-1 text-xs text-brand-white/45">{hint}</p>}
      {error && (
        <p id={`${id}-err`} className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function SelectField({
  label,
  name,
  error,
  required,
  value,
  onChange,
  children,
}: BaseProps & {
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label} {required && <span className="text-brand-cyan">*</span>}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        aria-invalid={Boolean(error)}
        onChange={(e) => onChange(e.target.value)}
        className="field-input"
      >
        {children}
      </select>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
