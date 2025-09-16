import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'gradient' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export default function Card({ 
  children, 
  variant = 'default',
  padding = 'md',
  className = '',
  onClick 
}: CardProps) {
  const baseClasses = 'rounded-lg transition-all';
  
  const variantClasses = {
    default: 'bg-white shadow-sm border border-gray-200',
    gradient: 'bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-2xl',
    bordered: 'bg-white border-2 border-gray-300'
  };
  
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };
  
  const interactiveClass = onClick ? 'cursor-pointer hover:shadow-lg' : '';
  
  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${interactiveClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
