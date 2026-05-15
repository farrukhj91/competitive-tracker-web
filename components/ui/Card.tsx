import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  children: ReactNode;
}

export function Card({ hoverable = false, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={
        'bg-white border border-zinc-200 rounded-xl shadow-sm ' +
        (hoverable
          ? 'hover:shadow-md hover:border-zinc-300 hover:-translate-y-0.5 transition-all duration-200 '
          : '') +
        className
      }
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={`px-6 pt-6 pb-4 ${className}`}>{children}</div>;
}

export function CardBody({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={`px-6 pb-6 ${className}`}>{children}</div>;
}

export function CardFooter({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`px-6 py-4 border-t border-zinc-200 bg-zinc-50/50 rounded-b-xl ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ className = '', children }: { className?: string; children: ReactNode }) {
  return <h3 className={`text-lg font-semibold text-zinc-900 tracking-tight ${className}`}>{children}</h3>;
}

export function CardDescription({ className = '', children }: { className?: string; children: ReactNode }) {
  return <p className={`text-sm text-zinc-600 mt-1 ${className}`}>{children}</p>;
}
