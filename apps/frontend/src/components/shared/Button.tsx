import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  roleType?: 'student' | 'hr' | 'organizer' | 'admin' | 'default';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  roleType = 'default',
  isLoading = false,
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'outline': return 'border-2 bg-transparent';
      case 'ghost': return 'bg-transparent shadow-none';
      default: return 'text-white shadow-lg';
    }
  };

  const getRoleStyles = () => {
    if (variant === 'outline' || variant === 'ghost') {
      switch (roleType) {
        case 'student': return 'border-student-primary text-student-primary hover:bg-student-primary/5';
        case 'hr': return 'border-company-primary text-company-primary hover:bg-company-primary/5';
        case 'organizer': return 'border-organizer-primary text-organizer-primary hover:bg-organizer-primary/5';
        case 'admin': return 'border-slate-800 text-slate-800 hover:bg-slate-800/5';
        default: return 'border-indigo-600 text-indigo-600 hover:bg-indigo-600/5';
      }
    }
    
    switch (roleType) {
      case 'student': return 'bg-student-primary hover:opacity-90';
      case 'hr': return 'bg-company-primary hover:opacity-90';
      case 'organizer': return 'bg-organizer-primary hover:opacity-90';
      case 'admin': return 'bg-slate-800 hover:bg-slate-900';
      default: return 'bg-indigo-600 hover:bg-indigo-700';
    }
  };

  return (
    <button 
      className={`
        inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 
        disabled:opacity-50 disabled:cursor-not-allowed
        ${getVariantStyles()} ${getRoleStyles()}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `} 
      disabled={isLoading || props.disabled} 
      {...props}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : children}
    </button>
  );
};
