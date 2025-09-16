import Logo from './Logo';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

export default function Loading({ 
  message = 'Carregando...', 
  fullScreen = true,
  className = '' 
}: LoadingProps) {
  const containerClass = fullScreen 
    ? 'min-h-screen bg-gray-50 flex items-center justify-center'
    : `flex items-center justify-center ${className}`;

  return (
    <div className={containerClass}>
      <div className="text-center">
        <Logo size="lg" />
        <p className="text-gray-600 mt-4">{message}</p>
      </div>
    </div>
  );
}
