import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, icon, error, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-sm font-semibold text-text-main ml-1">{label}</label>}
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-indigo-600">
            {icon}
          </div>
        )}
        <input 
          className={`
            w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-text-main 
            placeholder:text-slate-400 outline-none transition-all duration-200
            focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10
            ${icon ? 'pl-11' : ''} 
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''} 
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <span className="text-xs font-medium text-red-500 ml-1">{error}</span>}
    </div>
  );
};
