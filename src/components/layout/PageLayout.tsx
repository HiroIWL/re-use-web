import { ReactNode } from 'react';
import Header from './Header';
import Loading from '../common/Loading';

interface NavigationItem {
  label: string;
  href: string;
  isActive?: boolean;
}

interface PageLayoutProps {
  children: ReactNode;
  user?: {
    nome?: string;
  } | null;
  navigation?: NavigationItem[];
  showHeader?: boolean;
  showBackButton?: boolean;
  onBackClick?: () => void;
  backLabel?: string;
  isLoading?: boolean;
  loadingMessage?: string;
  className?: string;
  contentClassName?: string;
}

export default function PageLayout({
  children,
  user,
  navigation,
  showHeader = true,
  showBackButton = false,
  onBackClick,
  backLabel,
  isLoading = false,
  loadingMessage,
  className = '',
  contentClassName = ''
}: PageLayoutProps) {
  if (isLoading) {
    return <Loading message={loadingMessage} />;
  }

  return (
    <div className={`min-h-screen bg-gray-50 flex flex-col ${className}`}>
      {showHeader && (
        <Header
          user={user}
          navigation={navigation}
          showBackButton={showBackButton}
          onBackClick={onBackClick}
          backLabel={backLabel}
        />
      )}
      <main className={`flex-1 ${contentClassName}`}>
        {children}
      </main>
    </div>
  );
}
