interface SwipeIconProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface SwipeButtonProps extends SwipeIconProps {
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'like' | 'dislike' | 'superlike';
  buttonSize?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

const iconSizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6', 
  lg: 'w-10 h-10'
};

const buttonSizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-20 h-20'
};

const variantClasses = {
  like: 'bg-green-500 hover:bg-green-600',
  dislike: 'bg-red-500 hover:bg-red-600', 
  superlike: 'bg-blue-500 hover:bg-blue-600'
};

export function LikeIcon({ size = 'md', className = '' }: SwipeIconProps) {
  return (
    <svg 
      className={`${iconSizeClasses[size]} ${className}`} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function DislikeIcon({ size = 'md', className = '' }: SwipeIconProps) {
  return (
    <svg 
      className={`${iconSizeClasses[size]} ${className}`} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export function SuperLikeIcon({ size = 'md', className = '' }: SwipeIconProps) {
  return (
    <svg 
      className={`${iconSizeClasses[size]} ${className}`} 
      fill="currentColor" 
      viewBox="0 0 24 24"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export function SwipeButton({ 
  variant = 'like', 
  buttonSize = 'md', 
  size = 'md', 
  onClick, 
  disabled = false, 
  animate = false,
  className = '' 
}: SwipeButtonProps) {
  const IconComponent = variant === 'like' ? LikeIcon : variant === 'dislike' ? DislikeIcon : SuperLikeIcon;
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${buttonSizeClasses[buttonSize]} 
        ${variantClasses[variant]} 
        rounded-full flex items-center justify-center text-white shadow-lg transition-all 
        disabled:opacity-50 disabled:cursor-not-allowed
        ${animate ? 'animate-pulse' : ''}
        ${className}
      `}
    >
      <IconComponent size={size} />
    </button>
  );
}
