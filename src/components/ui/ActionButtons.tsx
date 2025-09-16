import { SwipeButton } from './SwipeIcons';

interface ActionButtonsProps {
  onDislike?: () => void;
  onLike?: () => void;
  onSuperLike?: () => void;
  disabled?: boolean;
  className?: string;
}

export default function ActionButtons({
  onDislike,
  onLike,
  onSuperLike,
  disabled = false,
  className = ''
}: ActionButtonsProps) {
  return (
    <div className={`flex justify-center space-x-6 ${className}`}>
      
      {onDislike && (
        <SwipeButton
          variant="dislike"
          buttonSize="md"
          size="lg"
          onClick={onDislike}
          disabled={disabled}
        />
      )}

      
      {onSuperLike && (
        <SwipeButton
          variant="superlike"
          buttonSize="md"
          size="lg"
          onClick={onSuperLike}
          disabled={disabled}
        />
      )}

      
      {onLike && (
        <SwipeButton
          variant="like"
          buttonSize="md"
          size="lg"
          onClick={onLike}
          disabled={disabled}
        />
      )}
    </div>
  );
}
