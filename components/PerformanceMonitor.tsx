'use client';

import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  fcp?: number;
  lcp?: number;
  fid?: number;
  cls?: number;
  ttfb?: number;
  pageLoadTime?: number;
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [showMetrics, setShowMetrics] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
          setMetrics((prev) => ({ ...prev, fcp: entry.startTime }));
        }

        if (entry.entryType === 'largest-contentful-paint') {
          setMetrics((prev) => ({ ...prev, lcp: entry.startTime }));
        }

        if (entry.entryType === 'first-input') {
          const fidEntry = entry as any;
          setMetrics((prev) => ({ ...prev, fid: fidEntry.processingStart - fidEntry.startTime }));
        }

        if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
          const clsEntry = entry as any;
          setMetrics((prev) => ({ 
            ...prev, 
            cls: (prev.cls || 0) + clsEntry.value 
          }));
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (e) {
      console.log('Performance observer not supported');
    }

    const navigationTiming = performance.getEntriesByType('navigation')[0] as any;
    if (navigationTiming) {
      setMetrics((prev) => ({
        ...prev,
        ttfb: navigationTiming.responseStart - navigationTiming.requestStart,
        pageLoadTime: navigationTiming.loadEventEnd - navigationTiming.fetchStart
      }));
    }

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setShowMetrics((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      observer.disconnect();
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  const getMetricColor = (metric: string, value?: number) => {
    if (!value) return 'text-gray-400';

    const thresholds: Record<string, { good: number; needs: number }> = {
      fcp: { good: 1800, needs: 3000 },
      lcp: { good: 2500, needs: 4000 },
      fid: { good: 100, needs: 300 },
      cls: { good: 0.1, needs: 0.25 },
      ttfb: { good: 800, needs: 1800 }
    };

    const threshold = thresholds[metric];
    if (!threshold) return 'text-gray-400';

    if (value <= threshold.good) return 'text-green-600';
    if (value <= threshold.needs) return 'text-amber-600';
    return 'text-red-600';
  };

  const formatValue = (value?: number) => {
    if (!value) return '-';
    return value < 1000 ? `${Math.round(value)}ms` : `${(value / 1000).toFixed(2)}s`;
  };

  if (!showMetrics && process.env.NODE_ENV === 'production') return null;

  return (
    <>
      {!showMetrics && process.env.NODE_ENV === 'development' && (
        <button
          onClick={() => setShowMetrics(true)}
          className="fixed bottom-4 right-4 w-12 h-12 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors z-50 flex items-center justify-center"
          title="Show Performance Metrics (Ctrl+Shift+P)"
        >
          <i className="ri-speed-line text-xl"></i>
        </button>
      )}

      {showMetrics && (
        <div className="fixed bottom-4 right-4 bg-white rounded-xl shadow-2xl p-6 z-50 w-80 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center">
              <i className="ri-speed-line mr-2 text-emerald-700"></i>
              Performance Metrics
            </h3>
            <button
              onClick={() => setShowMetrics(false)}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <i className="ri-close-line"></i>
            </button>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">FCP (First Contentful Paint)</span>
              <span className={`font-semibold ${getMetricColor('fcp', metrics.fcp)}`}>
                {formatValue(metrics.fcp)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">LCP (Largest Contentful Paint)</span>
              <span className={`font-semibold ${getMetricColor('lcp', metrics.lcp)}`}>
                {formatValue(metrics.lcp)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">FID (First Input Delay)</span>
              <span className={`font-semibold ${getMetricColor('fid', metrics.fid)}`}>
                {formatValue(metrics.fid)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">CLS (Cumulative Layout Shift)</span>
              <span className={`font-semibold ${getMetricColor('cls', metrics.cls)}`}>
                {metrics.cls?.toFixed(3) || '-'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">TTFB (Time to First Byte)</span>
              <span className={`font-semibold ${getMetricColor('ttfb', metrics.ttfb)}`}>
                {formatValue(metrics.ttfb)}
              </span>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <span className="text-gray-600 font-medium">Page Load Time</span>
              <span className="font-semibold text-gray-900">
                {formatValue(metrics.pageLoadTime)}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-600 rounded-full mr-1"></div>
                <span>Good</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-amber-600 rounded-full mr-1"></div>
                <span>Needs Improvement</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-600 rounded-full mr-1"></div>
                <span>Poor</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Press Ctrl+Shift+P to toggle</p>
          </div>
        </div>
      )}
    </>
  );
}