'use client';

import { useState, useEffect, useRef } from 'react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export default function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const startY = useRef(0);
  const isPulling = useRef(false);

  const threshold = 80;

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
        isPulling.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling.current || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const distance = currentY - startY.current;

      if (distance > 0 && window.scrollY === 0) {
        setPullDistance(Math.min(distance * 0.5, threshold * 1.5));
        if (distance > 10) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling.current) return;

      isPulling.current = false;

      if (pullDistance >= threshold && !isRefreshing) {
        setIsRefreshing(true);
        setIsReleasing(true);
        try {
          await onRefresh();
        } catch (error) {
          console.error('Refresh failed:', error);
        } finally {
          setTimeout(() => {
            setIsRefreshing(false);
            setIsReleasing(false);
            setPullDistance(0);
          }, 500);
        }
      } else {
        setIsReleasing(true);
        setTimeout(() => {
          setPullDistance(0);
          setIsReleasing(false);
        }, 300);
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, isRefreshing, onRefresh]);

  const rotation = Math.min((pullDistance / threshold) * 360, 360);
  const opacity = Math.min(pullDistance / threshold, 1);

  return (
    <div className="relative">
      <div
        className={`fixed top-0 left-0 right-0 flex items-center justify-center z-40 transition-all ${
          isReleasing ? 'duration-300' : 'duration-0'
        }`}
        style={{
          height: `${pullDistance}px`,
          opacity: opacity
        }}
      >
        <div
          className={`flex flex-col items-center justify-center ${
            isRefreshing ? 'animate-spin' : ''
          }`}
          style={{
            transform: isRefreshing ? 'none' : `rotate(${rotation}deg)`,
            transition: isReleasing ? 'transform 0.3s' : 'none'
          }}
        >
          <div className="w-8 h-8 flex items-center justify-center">
            <i className={`${isRefreshing ? 'ri-loader-4-line' : 'ri-refresh-line'} text-2xl text-emerald-700`}></i>
          </div>
          {pullDistance >= threshold && !isRefreshing && (
            <span className="text-xs text-emerald-700 font-medium mt-1 whitespace-nowrap">Release to refresh</span>
          )}
          {isRefreshing && (
            <span className="text-xs text-emerald-700 font-medium mt-1 whitespace-nowrap">Refreshing...</span>
          )}
        </div>
      </div>
      <div
        className={`transition-transform ${isReleasing ? 'duration-300' : 'duration-0'}`}
        style={{
          transform: `translateY(${pullDistance}px)`
        }}
      >
        {children}
      </div>
    </div>
  );
}
