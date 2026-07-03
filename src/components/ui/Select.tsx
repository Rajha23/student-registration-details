import React, { type SelectHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  helperText?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, className = '', id, ...props }, ref) => {
    const selectId = id || label.replace(/\s+/g, '-').toLowerCase();

    return (
      <div className={`flex flex-col w-full ${className}`}>
        <label htmlFor={selectId} className="mb-2 text-sm font-medium text-text-secondary">
          {label} {props.required && <span className="text-red-500">*</span>}
        </label>
        
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            defaultValue=""
            className={`
              w-full bg-background/50 border rounded-lg px-4 py-3 text-text 
              appearance-none focus:outline-none focus:ring-2 
              transition-all duration-200
              ${error 
                ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' 
                : 'border-white/10 focus:ring-primary/50 focus:border-primary'}
            `}
            {...props}
          >
            <option value="" disabled>Select an option</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-background text-text">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-text-secondary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
        
        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1.5 text-xs text-red-500 font-medium"
          >
            {error}
          </motion.p>
        )}
        
        {helperText && !error && (
          <p className="mt-1.5 text-xs text-text-secondary">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
