import { Coins, TrendingDown, AlertCircle } from 'lucide-react';
import { useCredits } from '@/hooks/useCredits';
import { useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';

export const CreditsDisplay = () => {
  const { credits, loading } = useCredits();
  const { notifyLowCredits, requestPermission } = useNotifications();

  useEffect(() => {
    // Request notification permission on mount
    requestPermission();
  }, [requestPermission]);

  useEffect(() => {
    // Notify when credits are low
    if (credits > 0 && credits <= 20) {
      notifyLowCredits(credits);
    }
  }, [credits, notifyLowCredits]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 animate-pulse">
        <div className="w-4 h-4 rounded-full bg-muted"></div>
        <div className="w-8 h-4 rounded bg-muted"></div>
      </div>
    );
  }

  const isLow = credits <= 20;
  const isEmpty = credits === 0;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
      isEmpty 
        ? 'bg-destructive/20 text-destructive' 
        : isLow 
          ? 'bg-amber-500/20 text-amber-500' 
          : 'bg-primary/20 text-primary'
    }`}>
      {isEmpty ? (
        <AlertCircle className="w-4 h-4" />
      ) : isLow ? (
        <TrendingDown className="w-4 h-4" />
      ) : (
        <Coins className="w-4 h-4" />
      )}
      <span className="text-sm font-bold">{credits}</span>
      <span className="text-xs opacity-70">نقطة</span>
    </div>
  );
};
