interface PhotoPlaceholderProps {
  currentPhoto?: number;
  totalPhotos?: number;
  height?: string;
  className?: string;
  showDots?: boolean;
}

export default function PhotoPlaceholder({
  currentPhoto = 0,
  totalPhotos = 6,
  height = 'h-48',
  className = '',
  showDots = true
}: PhotoPlaceholderProps) {
  return (
    <div className={`bg-gray-200 rounded-lg ${height} flex items-center justify-center ${className}`}>
      <div className="text-center text-gray-500">
        {showDots && (
          <div className="flex justify-center space-x-2 mb-4">
            {Array.from({ length: totalPhotos }, (_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index === currentPhoto ? 'bg-black' : 'bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}
        <div className="text-4xl mb-2 text-gray-400">IMG</div>
        <p className="text-sm">Adicionar fotos</p>
        <p className="text-xs text-gray-400">(Funcionalidade em desenvolvimento)</p>
      </div>
    </div>
  );
}
