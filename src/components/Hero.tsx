import { Sparkles, FileText, Zap } from 'lucide-react';

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
