import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'inverse' | 'inverseOutline' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const base =
  'inline-flex items-center justify-center gap-2 font-medium rounded-full whitespace-nowrap ' +
  'transition-[background-color,border-color,color,box-shadow,transform] duration-200 ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
  'disabled:opacity-40 disabled:cursor-not-allowed ' +
  'active:scale-[0.985]';

const variants: Record<Variant, string> = {
  primary:
    'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 ' +
    'focus-visible:ring-indigo-600 shadow-[0_1px_2px_rgba(9,9,11,0.08)]',
  secondary:
    'bg-white text-zinc-900 border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 ' +
    'active:bg-zinc-100 focus-visible:ring-zinc-900 shadow-[0_1px_2px_rgba(9,9,11,0.04)]',
  ghost:
    'bg-transparent text-zinc-700 hover:bg-zinc-100 active:bg-zinc-200 ' +
    'focus-visible:ring-zinc-900',
  // For use on ink surfaces.
  inverse:
    'bg-white text-zinc-900 hover:bg-zinc-100 active:bg-zinc-200 ' +
    'focus-visible:ring-white focus-visible:ring-offset-zinc-950',
  inverseOutline:
    'bg-transparent text-white border border-white/20 hover:bg-white/10 active:bg-white/15 ' +
    'focus-visible:ring-white focus-visible:ring-offset-zinc-950',
  destructive:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 ' +
    'focus-visible:ring-red-600',
};

const sizes: Record<Size, string> = {
  sm: 'text-[13px] px-3.5 h-8',
  md: 'text-sm px-5 h-10',
  lg: 'text-[15px] px-6 h-12',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    leftIcon,
    rightIcon,
    children,
    className = '',
    disabled,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <Spinner />
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  );
});

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
