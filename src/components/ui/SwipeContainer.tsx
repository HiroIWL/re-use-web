'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ProductCard from './ProductCard';

interface Product {
  id: number;
  nome: string;
  descricao?: string;
  preco: number;
  categoria: {
    id: number;
    nome: string;
  };
  estatisticas?: {
    likes: number;
    dislikes: number;
    superLikes: number;
  };
}

interface SwipeContainerProps {
  products: Product[];
  currentIndex: number;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  className?: string;
}

export default function SwipeContainer({
  products,
  currentIndex,
  onSwipeLeft,
  onSwipeRight,
  className = ''
}: SwipeContainerProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

   const visibleCards = products.slice(currentIndex, currentIndex + 3);

  const handleSwipeLeft = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    
       const container = containerRef.current;
    if (container) {
      container.style.transform = 'scale(0.95)';
      setTimeout(() => {
        container.style.transform = 'scale(1)';
      }, 150);
    }
    
    setTimeout(() => {
      onSwipeLeft();
      setIsAnimating(false);
    }, 300);
  }, [isAnimating, onSwipeLeft]);

  const handleSwipeRight = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    
       const container = containerRef.current;
    if (container) {
      container.style.transform = 'scale(1.05)';
      setTimeout(() => {
        container.style.transform = 'scale(1)';
      }, 150);
    }
    
    setTimeout(() => {
      onSwipeRight();
      setIsAnimating(false);
    }, 300);
  }, [isAnimating, onSwipeRight]);

   useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isAnimating) return;
      
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          handleSwipeLeft();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          handleSwipeRight();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isAnimating, handleSwipeLeft, handleSwipeRight]);

  if (visibleCards.length === 0) {
    return null;
  }

  return (
    <div 
      ref={containerRef} 
      className={`relative transition-transform duration-200 ease-out ${className}`}
    >
      
      {visibleCards.map((product, index) => {
        const isTop = index === 0;
        const zIndex = visibleCards.length - index;
        const scale = 1 - (index * 0.05);
        const translateY = index * 8;
        const opacity = 1 - (index * 0.2);

        return (
          <div
            key={`${product.id}-${currentIndex + index}`}
            className="absolute inset-0"
            style={{
              zIndex,
              transform: `scale(${scale}) translateY(${translateY}px)`,
              opacity: opacity,
              transition: isAnimating ? 'transform 0.3s ease-out, opacity 0.3s ease-out' : 'none'
            }}
          >
            <ProductCard
              product={product}
              onSwipeLeft={isTop ? handleSwipeLeft : undefined}
              onSwipeRight={isTop ? handleSwipeRight : undefined}
              isDraggable={isTop}
              showSwipeIndicators={isTop}
              className="w-full h-full"
            />
          </div>
        );
      })}
    </div>
  );
}
