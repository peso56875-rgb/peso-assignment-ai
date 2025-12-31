import { Loader2, Sparkles, FileSearch, ImageIcon } from 'lucide-react';

interface LoadingStateProps {
  step: string;
}

export const LoadingState = ({ step }: LoadingStateProps) => {
  return (
    <div className="glass-card p-12 max-w-2xl mx-auto text-center animate-slide-up">
      <div className="relative inline-block mb-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center animate-pulse-glow">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
        <div className="absolute -top-2 -right-2">
          <Sparkles className="w-6 h-6 text-primary animate-float" />
        </div>
        <div className="absolute -bottom-2 -left-2">
          <Sparkles className="w-4 h-4 text-secondary animate-float" style={{ animationDelay: '1s' }} />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-foreground mb-4">
        جاري إنشاء الأسايمنت...
      </h2>
      
      <p className="text-muted-foreground mb-8">
        {step || 'جاري التحضير...'}
      </p>

      <div className="flex justify-center gap-8 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <FileSearch className="w-5 h-5 text-secondary" />
          <span>البحث</span>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span>الكتابة</span>
        </div>
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-accent" />
          <span>الصور</span>
        </div>
      </div>

      <div className="mt-8">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary via-secondary to-primary animate-shimmer"
            style={{ 
              backgroundSize: '200% 100%',
              width: '100%'
            }}
          />
        </div>
      </div>
    </div>
  );
};