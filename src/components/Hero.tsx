import { Sparkles, FileText, Zap, Presentation, Crown, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Hero = () => {
  return (
    <header className="text-center mb-12 animate-slide-up">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <img 
          src="/peso-logo.png" 
          alt="PESO AI Logo" 
          className="w-24 h-24 md:w-32 md:h-32 object-contain"
        />
      </div>
      
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-sm text-primary font-medium">مدعوم بالذكاء الاصطناعي</span>
      </div>
      
      <h1 className="text-4xl md:text-6xl font-bold mb-4 glow-text">
        <span className="text-primary">PESO</span>{' '}
        <span className="text-foreground">Assignment Helper</span>
      </h1>
      
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
        مساعدك الذكي لإنشاء أسايمنتات جامعية احترافية
        <br />
        <span className="text-lg">بحث شامل + صور توضيحية + ملف PDF جاهز</span>
      </p>

      {/* Navigation */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <span className="px-6 py-3 rounded-xl bg-primary/20 text-primary font-medium border border-primary/30">
          إنشاء أسايمنت
        </span>
        <Link 
          to="/quiz-solver" 
          className="px-6 py-3 rounded-xl border border-border bg-muted/30 text-foreground font-medium hover:bg-muted/50 transition-colors"
        >
          حل كويز / شيت
        </Link>
        <Link 
          to="/presentation" 
          className="px-6 py-3 rounded-xl border border-border bg-muted/30 text-foreground font-medium hover:bg-muted/50 transition-colors flex items-center gap-2"
        >
          <Presentation className="w-4 h-4" />
          عرض تقديمي
        </Link>
        <Link 
          to="/exam-generator" 
          className="px-6 py-3 rounded-xl border border-border bg-muted/30 text-foreground font-medium hover:bg-muted/50 transition-colors flex items-center gap-2"
        >
          <ClipboardList className="w-4 h-4" />
          توليد امتحان
        </Link>
        <Link 
          to="/pricing" 
          className="px-6 py-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-500 font-medium hover:bg-amber-500/20 transition-colors flex items-center gap-2"
        >
          <Crown className="w-4 h-4" />
          الاشتراك
        </Link>
      </div>

      <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-secondary" />
          <span>ملفات احترافية</span>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span>صور مولدة بالـ AI</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-accent" />
          <span>سريع وموثوق</span>
        </div>
      </div>
    </header>
  );
};
