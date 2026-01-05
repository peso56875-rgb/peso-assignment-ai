import { Link } from 'react-router-dom';
import { ArrowRight, Check, MessageCircle, Phone, Sparkles, Zap, Shield, Crown } from 'lucide-react';
import { UserMenu } from '@/components/UserMenu';
import { Footer } from '@/components/Footer';
import { useCredits } from '@/hooks/useCredits';
import { motion } from 'framer-motion';

const Pricing = () => {
  const { credits } = useCredits();
  
  const whatsappNumber = '201205201537';
  const whatsappMessage = encodeURIComponent('مرحباً، أريد الاشتراك في خطة PESO AI الشهرية');
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  const features = [
    'نقاط غير محدودة شهرياً',
    'توليد أسايمنتات غير محدود',
    'حل كويزات غير محدود',
    'توليد عروض تقديمية غير محدود',
    'توليد أسئلة امتحانات غير محدود',
    'دعم فني أولوية',
    'قوالب حصرية'
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/5 pointer-events-none" />
      <div className="fixed top-1/4 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 -left-32 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      <UserMenu />

      <main className="relative z-10 container mx-auto px-4 py-8 pt-20">
        {/* Header */}
        <div className="text-center mb-12">
          <Link to="/" className="inline-block mb-6">
            <img src="/peso-logo.png" alt="PESO AI" className="h-16 mx-auto" />
          </Link>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            <Crown className="inline-block w-10 h-10 mr-2 text-amber-500" />
            خطط الاشتراك
          </h1>
          <p className="text-muted-foreground text-lg">
            اختر الخطة المناسبة لاحتياجاتك الدراسية
          </p>
        </div>

        {/* Current Credits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 max-w-md mx-auto mb-12 text-center"
        >
          <p className="text-muted-foreground mb-2">رصيدك الحالي</p>
          <p className="text-4xl font-bold text-primary">{credits} نقطة</p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-8"
          >
            <div className="text-center mb-6">
              <Zap className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold text-foreground">الخطة المجانية</h2>
              <p className="text-4xl font-bold text-foreground mt-4">مجاناً</p>
              <p className="text-muted-foreground">للمستخدمين الجدد</p>
            </div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Check className="w-5 h-5 text-primary" />
                100 نقطة مجانية عند التسجيل
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Check className="w-5 h-5 text-primary" />
                5 عمليات توليد
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Check className="w-5 h-5 text-primary" />
                جميع الميزات الأساسية
              </li>
            </ul>

            <div className="text-center text-muted-foreground text-sm">
              رصيدك الحالي: {credits} نقطة
            </div>
          </motion.div>

          {/* Premium Plan */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-8 relative overflow-hidden border-2 border-primary"
          >
            {/* Popular badge */}
            <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
              الأكثر شيوعاً
            </div>

            <div className="text-center mb-6">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">الخطة المميزة</h2>
              <p className="text-5xl font-bold text-primary mt-4">100 جنيه</p>
              <p className="text-muted-foreground">شهرياً</p>
            </div>

            <ul className="space-y-3 mb-8">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-foreground">
                  <Check className="w-5 h-5 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>

            <div className="space-y-3">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="hero-button w-full flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                اشترك عبر واتساب
              </a>
              <a
                href={`tel:+${whatsappNumber}`}
                className="secondary-button w-full flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                اتصل: 01205201537
              </a>
            </div>
          </motion.div>
        </div>

        {/* Cost breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 max-w-2xl mx-auto mb-12"
        >
          <h3 className="text-xl font-bold text-foreground mb-4 text-center">
            <Shield className="inline w-5 h-5 mr-2" />
            تكلفة كل عملية
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-2xl font-bold text-primary">20</p>
              <p className="text-sm text-muted-foreground">نقطة/أسايمنت</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-2xl font-bold text-primary">20</p>
              <p className="text-sm text-muted-foreground">نقطة/كويز</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-2xl font-bold text-primary">20</p>
              <p className="text-sm text-muted-foreground">نقطة/عرض</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-2xl font-bold text-primary">20</p>
              <p className="text-sm text-muted-foreground">نقطة/امتحان</p>
            </div>
          </div>
        </motion.div>

        {/* Back to home */}
        <div className="text-center">
          <Link to="/" className="secondary-button inline-flex items-center gap-2">
            <ArrowRight className="w-4 h-4" />
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
