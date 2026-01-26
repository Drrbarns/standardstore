'use client';

import { useState, useRef, useEffect } from 'react';

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: { icon: string; color: string; label: string };
  rightAction?: { icon: string; color: string; label: string };
}

export default function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction = { icon: 'ri-delete-bin-line', color: 'bg-red-500', label: 'Delete' },
  rightAction = { icon: 'ri-heart-line', color: 'bg-emerald-500', label: 'Save' }
}: SwipeableCardProps) {
  const [offset, setOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startX = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const swipeThreshold = 100;

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX.current;
    setOffset(diff);
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);

    if (Math.abs(offset) >= swipeThreshold) {
      if (offset > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (offset < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    setOffset(0);
  };

  const showLeftAction = offset > 20;
  const showRightAction = offset < -20;

  return (
    <div className="relative overflow-hidden">
      {showRightAction && onSwipeLeft && (
        <div className="absolute top-0 right-0 bottom-0 flex items-center justify-end px-6">
          <div className={`${leftAction.color} text-white px-6 py-3 rounded-lg flex items-center space-x-2 whitespace-nowrap`}>
            <div className="w-5 h-5 flex items-center justify-center">
              <i className={`${leftAction.icon} text-lg`}></i>
            </div>
            <span className="text-sm font-medium">{leftAction.label}</span>
          </div>
        </div>
      )}

      {showLeftAction && onSwipeRight && (
        <div className="absolute top-0 left-0 bottom-0 flex items-center justify-start px-6">
          <div className={`${rightAction.color} text-white px-6 py-3 rounded-lg flex items-center space-x-2 whitespace-nowrap`}>
            <div className="w-5 h-5 flex items-center justify-center">
              <i className={`${rightAction.icon} text-lg`}></i>
            </div>
            <span className="text-sm font-medium">{rightAction.label}</span>
          </div>
        </div>
      )}

      <div
        ref={cardRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative bg-white transition-transform"
        style={{
          transform: `translateX(${offset}px)`,
          transitionDuration: isSwiping ? '0ms' : '200ms'
        }}
      >
        {children}
      </div>
    </div>
  );
}
