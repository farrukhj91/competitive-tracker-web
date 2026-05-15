import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, id, className = '', ...props },
  ref,
) {
  const inputId = id || props.name;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-zinc-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={
          'block w-full px-3.5 py-2.5 rounded-lg ' +
          'border bg-white text-zinc-900 text-sm ' +
          'placeholder:text-zinc-400 ' +
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ' +
          'transition-all duration-200 ' +
          (error
            ? 'border-red-300 focus-visible:ring-red-500 '
            : 'border-zinc-300 focus-visible:ring-indigo-500 focus:border-indigo-500 ') +
          className
        }
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-zinc-500">
          {hint}
        </p>
      )}
    </div>
  );
});
