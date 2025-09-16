import Logo from "../common/Logo";
import UserAvatar from "../ui/UserAvatar";

interface NavigationItem {
  label: string;
  href: string;
  isActive?: boolean;
}

interface HeaderProps {
  user?: {
    nome?: string;
  } | null;
  navigation?: NavigationItem[];
  showBackButton?: boolean;
  onBackClick?: () => void;
  backLabel?: string;
  className?: string;
}

export default function Header({
  user,
  navigation = [],
  showBackButton = false,
  onBackClick,
  backLabel = "Voltar",
  className = "",
}: HeaderProps) {
  showBackButton = false;
  return (
    <header className={`bg-white shadow-sm border-b px-4 py-3 ${className}`}>
      <div className="flex items-center justify-between">
        <Logo size="md" clickable={true} />
        
        {showBackButton ? (
          <button
            onClick={onBackClick}
            className="text-lg text-purple-600 hover:text-purple-700 flex items-center space-x-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>{backLabel}</span>
          </button>
        ) : (
          <div className="flex gap-4">
            {navigation.map((item) => (
              <button
                key={item.href}
                onClick={() => (window.location.href = item.href)}
                className={`w-24 text-center ${
                  item.isActive
                    ? "text-purple-600 font-medium border-b-2 border-purple-600 pb-1"
                    : "text-gray-500 hover:text-purple-600"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
        
        <UserAvatar user={user || null} />
      </div>
    </header>
  );
}
