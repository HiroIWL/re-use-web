interface UserAvatarProps {
  user: {
    nome?: string;
  } | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function UserAvatar({ user, size = 'md', className = '' }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  const initial = user?.nome?.charAt(0).toUpperCase() || '?';

  return (
    <div className={`${sizeClasses[size]} bg-gray-300 rounded-full flex items-center justify-center ${className}`}>
      <span className="text-gray-600 font-medium">
        {initial}
      </span>
    </div>
  );
}
