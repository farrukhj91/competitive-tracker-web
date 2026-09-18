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
          className="block text-[13px] font-medium text-zinc-700 mb-2"
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
          'block w-full px-3.5 h-11 rounded-xl ' +
          'border bg-white text-zinc-900 text-sm ' +
          'placeholder:text-zinc-400 ' +
          'shadow-[0_1px_2px_rgba(9,9,11,0.03)] ' +
          'focus:outline-none focus-visible:ring-4 ' +
          'transition-[border-color,box-shadow] duration-200 ' +
          (error
            ? 'border-red-300 focus-visible:ring-red-500/15 focus:border-red-500 '
            : 'border-zinc-200 hover:border-zinc-300 focus-visible:ring-indigo-600/15 focus:border-indigo-600 ') +
          className
        }
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-2 text-xs text-red-600">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${inputId}-hint`} className="mt-2 text-xs text-zinc-500">
          {hint}
        </p>
      )}
    </div>
  );
});
