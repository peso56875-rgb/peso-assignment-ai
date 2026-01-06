import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Sparkles, Zap, Shield, Crown, Wallet, CheckCircle2, Clock, X } from 'lucide-react';
import { UserMenu } from '@/components/UserMenu';
import { Footer } from '@/components/Footer';
import { useCredits } from '@/hooks/useCredits';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import etisalatWallet from '@/assets/etisalat-wallet.png';

const Pricing = () => {
  const { credits } = useCredits();
  const { user } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [transferNumber, setTransferNumber] = useState('');
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const features = [
    'نقاط غير محدودة شهرياً',
    'توليد أسايمنتات غير محدود',
    'حل كويزات غير محدود',
    'توليد عروض تقديمية غير محدود',
    'توليد أسئلة امتحانات غير محدود',
    'دعم فني أولوية',
    'قوالب حصرية'
  ];

  const handlePaymentSubmit = async () => {
    if (transferNumber.trim().length < 10 || !user) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('payment_requests')
        .insert({
          user_id: user.id,
          user_email: user.email || '',
          transfer_number: transferNumber.trim(),
          amount: 100
        });

      if (error) throw error;
      
      setPaymentSubmitted(true);
      toast.success('تم إرسال طلب الدفع بنجاح');
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast.error('حدث خطأ أثناء إرسال الطلب');
    } finally {
      setSubmitting(false);
    }
  };

  const resetPayment = () => {
    setShowPaymentModal(false);
    setTransferNumber('');
    setPaymentSubmitted(false);
  };

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
            <div className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
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

            <Button
              onClick={() => setShowPaymentModal(true)}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-bold py-6 text-lg gap-2"
            >
              <Wallet className="w-5 h-5" />
              الدفع عبر المحفظة
            </Button>
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

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !paymentSubmitted && resetPayment()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {!paymentSubmitted ? (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                      <Wallet className="w-6 h-6 text-primary" />
                      الدفع عبر المحفظة
                    </h3>
                    <button
                      onClick={resetPayment}
                      className="p-2 hover:bg-muted rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>

                  {/* Wallet Info */}
                  <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-xl p-6 mb-6 text-center">
                    <img 
                      src={etisalatWallet} 
                      alt="اتصالات كاش" 
                      className="w-24 h-24 mx-auto mb-4 object-contain"
                    />
                    <p className="text-muted-foreground mb-2">ادفع على الرقم التالي</p>
                    <p className="text-3xl font-bold text-foreground tracking-wider" dir="ltr">
                      01111512519
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">اتصالات كاش</p>
                    <div className="mt-4 bg-primary/10 rounded-lg p-3">
                      <p className="text-lg font-bold text-primary">المبلغ: 100 جنيه</p>
                    </div>
                  </div>

                  {/* Transfer Number Input */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        رقم التحويل (الرقم اللي دفعت منه)
                      </label>
                      <Input
                        type="tel"
                        placeholder="01xxxxxxxxx"
                        value={transferNumber}
                        onChange={(e) => setTransferNumber(e.target.value)}
                        className="text-center text-lg tracking-wider"
                        dir="ltr"
                      />
                    </div>

                    <Button
                      onClick={handlePaymentSubmit}
                      disabled={transferNumber.trim().length < 10 || submitting}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-6 text-lg gap-2 disabled:opacity-50"
                    >
                      {submitting ? (
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5" />
                      )}
                      {submitting ? 'جاري الإرسال...' : 'تم الدفع'}
                    </Button>
                  </div>
                </>
              ) : (
                /* Success State */
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                    className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30"
                  >
                    <CheckCircle2 className="w-12 h-12 text-white" />
                  </motion.div>

                  <h3 className="text-2xl font-bold text-foreground mb-3">
                    تم استلام طلبك بنجاح!
                  </h3>

                  <div className="bg-muted/50 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
                      <Clock className="w-5 h-5" />
                      <span>جاري المراجعة من قبل الإدارة</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      سيتم تفعيل اشتراكك خلال ساعات قليلة
                    </p>
                  </div>

                  <div className="bg-primary/10 rounded-lg p-3 mb-6">
                    <p className="text-sm text-muted-foreground">رقم التحويل</p>
                    <p className="text-lg font-bold text-foreground" dir="ltr">{transferNumber}</p>
                  </div>

                  <Button
                    onClick={resetPayment}
                    variant="outline"
                    className="w-full"
                  >
                    إغلاق
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Pricing;
