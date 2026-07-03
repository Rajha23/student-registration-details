import React, { type InputHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || label.replace(/\s+/g, '-').toLowerCase();

    return (
      <div className={`flex flex-col w-full ${className}`}>
        <label htmlFor={inputId} className="mb-2 text-sm font-medium text-text-secondary">
          {label} {props.required && <span className="text-red-500">*</span>}
        </label>
        
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            className={`
              w-full bg-background/50 border rounded-lg px-4 py-3 text-text 
              placeholder-text-secondary/50 focus:outline-none focus:ring-2 
              transition-all duration-200 [color-scheme:dark]
              ${error 
                ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' 
                : 'border-white/10 focus:ring-primary/50 focus:border-primary'}
            `}
            {...props}
          />
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

Input.displayName = 'Input';
