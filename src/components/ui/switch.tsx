import * as React from 'react';
import { cn } from '../../lib/utils';

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, id, ...props }, ref) => {
    const switchId = id || 'switch';
    return (
      <label htmlFor={switchId} className="flex items-center gap-3 cursor-pointer select-none">
        <div className="relative">
          <input
            type="checkbox"
            id={switchId}
            className="sr-only peer"
            ref={ref}
            {...props}
          />
          <div className={cn(
            'w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-primary-600 transition-colors',
            'after:content-[\'\'] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all',
            'peer-checked:after:translate-x-5',
            className,
          )} />
        </div>
        {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
      </label>
    );
  },
);
Switch.displayName = 'Switch';

export { Switch };
