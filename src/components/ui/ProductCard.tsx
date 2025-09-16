'use client';

import { useState, useRef, useEffect } from "react";
import Card from "./Card";
import { SwipeButton } from "./SwipeIcons";

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

interface ProductCardProps {
  product: Product;
  images?: string[];
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  isDraggable?: boolean;
  showSwipeIndicators?: boolean;
  className?: string;
}

export default function ProductCard({
  product,
  images = ["IMG", "IMG", "IMG", "IMG", "IMG"],
  onSwipeLeft,
  onSwipeRight,
  isDraggable = false,
  showSwipeIndicators = false,
  className = "",
}: ProductCardProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0 });

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

   const getRotation = (offsetX: number) => {
    return Math.min(Math.max(offsetX * 0.1, -15), 15);
  };

   const getOpacity = (offsetX: number) => {
    return Math.max(1 - Math.abs(offsetX) / 300, 0.3);
  };

   const resetCard = () => {
    setDragOffset({ x: 0, y: 0 });
    setSwipeDirection(null);
    setIsDragging(false);
    setIsAnimating(false);
  };

   const animateSwipeOut = (
    direction: "left" | "right",
    callback: () => void
  ) => {
    setIsAnimating(true);
    const finalX =
      direction === "right" ? window.innerWidth : -window.innerWidth;
    setDragOffset({ x: finalX, y: dragOffset.y });

    setTimeout(() => {
      callback();
      resetCard();
    }, 300);
  };

   const handleMouseDown = (e: React.MouseEvent) => {
    if (!isDraggable || isAnimating) return;
    e.preventDefault();
    setIsDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isDraggable || isAnimating) return;

    const deltaX = e.clientX - startPos.current.x;
    const deltaY = e.clientY - startPos.current.y;

    setDragOffset({ x: deltaX, y: deltaY * 0.5 });       if (Math.abs(deltaX) > 50) {
      setSwipeDirection(deltaX > 0 ? "right" : "left");
    } else {
      setSwipeDirection(null);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging || !isDraggable || isAnimating) return;

    const threshold = 120;    if (Math.abs(dragOffset.x) > threshold) {
      if (dragOffset.x > 0 && onSwipeRight) {
        animateSwipeOut("right", onSwipeRight);
      } else if (dragOffset.x < 0 && onSwipeLeft) {
        animateSwipeOut("left", onSwipeLeft);
      } else {
        resetCard();
      }
    } else {
      resetCard();
    }
  };

   const handleTouchStart = (e: React.TouchEvent) => {
    if (!isDraggable || isAnimating) return;
    const touch = e.touches[0];
    setIsDragging(true);
    startPos.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isDraggable || isAnimating) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - startPos.current.x;
    const deltaY = touch.clientY - startPos.current.y;

    setDragOffset({ x: deltaX, y: deltaY * 0.5 });

    if (Math.abs(deltaX) > 50) {
      setSwipeDirection(deltaX > 0 ? "right" : "left");
    } else {
      setSwipeDirection(null);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging || !isDraggable || isAnimating) return;

    const threshold = 120;

    if (Math.abs(dragOffset.x) > threshold) {
      if (dragOffset.x > 0 && onSwipeRight) {
        animateSwipeOut("right", onSwipeRight);
      } else if (dragOffset.x < 0 && onSwipeLeft) {
        animateSwipeOut("left", onSwipeLeft);
      } else {
        resetCard();
      }
    } else {
      resetCard();
    }
  };

   useEffect(() => {
    const preventDefault = (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault();
      }
    };

    document.addEventListener("touchmove", preventDefault, { passive: false });
    return () => {
      document.removeEventListener("touchmove", preventDefault);
    };
  }, [isDragging]);

  return (
    <div
      ref={cardRef}
      className={`relative select-none ${className}`}
      style={{
        transform: `translate(${dragOffset.x}px, ${
          dragOffset.y
        }px) rotate(${getRotation(dragOffset.x)}deg)`,
        opacity: getOpacity(dragOffset.x),
        transition:
          isDragging || isAnimating
            ? "none"
            : "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease-out",
        zIndex: isDragging ? 10 : 1,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Card
        variant="gradient"
        padding="lg"
        className={`relative overflow-hidden transition-all duration-200 ${
          isDragging ? "cursor-grabbing" : isDraggable ? "cursor-grab" : ""
        } ${
          showSwipeIndicators && swipeDirection === "right"
            ? "shadow-2xl shadow-green-500/50"
            : showSwipeIndicators && swipeDirection === "left"
            ? "shadow-2xl shadow-red-500/50"
            : "shadow-xl"
        }`}
      >
        
        <div className="h-64 bg-gradient-to-br from-blue-300 to-purple-400 rounded-2xl mb-4 relative overflow-hidden">
          
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-4xl">{images[currentSlide]}</span>
            </div>
          </div>

          
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center text-white transition-all"
          >
            <svg
              className="w-4 h-4"
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
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center text-white transition-all"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? "bg-white"
                    : "bg-white/50 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </div>

        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{product.nome}</h2>
          <p className="text-blue-100 text-sm">{product.categoria.nome}</p>
          <p className="text-lg font-semibold">A 5km de você!</p>
          <p className="text-sm text-blue-100 opacity-90">
            R$ {product.preco.toFixed(2)}
          </p>
        </div>

        
        <div className="absolute -top-10 -right-10 w-20 h-20 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-5 -left-5 w-15 h-15 bg-white/10 rounded-full"></div>

        
        {showSwipeIndicators && swipeDirection === "right" && (
          <div className="absolute inset-0 bg-green-500/20 rounded-3xl flex items-center justify-center">
            <SwipeButton variant="like" buttonSize="lg" size="lg" animate />
          </div>
        )}
        {showSwipeIndicators && swipeDirection === "left" && (
          <div className="absolute inset-0 bg-red-500/20 rounded-3xl flex items-center justify-center">
            <SwipeButton variant="dislike" buttonSize="lg" size="lg" animate />
          </div>
        )}

        
        {isDragging && (
          <>
            <div
              className={`absolute top-1/2 left-4 transform -translate-y-1/2 transition-opacity duration-200 ${
                dragOffset.x < -30 ? "opacity-100" : "opacity-30"
              }`}
            >
              <SwipeButton variant="dislike" buttonSize="sm" size="md" />
            </div>
            <div
              className={`absolute top-1/2 right-4 transform -translate-y-1/2 transition-opacity duration-200 ${
                dragOffset.x > 30 ? "opacity-100" : "opacity-30"
              }`}
            >
              <SwipeButton variant="like" buttonSize="sm" size="md" />
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
