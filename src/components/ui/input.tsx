import * as React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: boolean;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label htmlFor={id} className={cn('text-sm font-medium', error ? 'text-rose-600' : 'text-slate-700')}>
            {label}
          </label>
        )}
        <input
          type={type}
          id={id}
          className={cn(
            'flex h-10 w-full rounded-md border bg-white px-3 py-2 ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
            error ? 'border-rose-400 focus-visible:ring-rose-500' : 'border-slate-300 hover:border-slate-400',
            className,
          )}
          ref={ref}
          {...props}
        />
        {helperText && (
          <p className={cn('text-xs', error ? 'text-rose-500' : 'text-slate-500')}>{helperText}</p>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';

export { Input };
