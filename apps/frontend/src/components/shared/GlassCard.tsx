import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', style, onClick }) => {
  const hasBg = className.split(' ').some(c => c.startsWith('bg-'));
  const hasBorder = className.split(' ').some(c => c.startsWith('border-'));
  const hasPadding = className.split(' ').some(c => c.startsWith('p-') || c.startsWith('px-') || c.startsWith('py-'));

  const bgClass = hasBg ? '' : 'bg-white/70';
  const borderClass = hasBorder ? '' : 'border border-white/20';
  const paddingClass = hasPadding ? '' : 'p-6';

  return (
    <div 
      className={`${bgClass} backdrop-blur-xl ${borderClass} shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-2xl ${paddingClass} ${className}`} 
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
