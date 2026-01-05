import { AlertCircle, Phone, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InsufficientCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCredits: number;
  requiredCredits: number;
}

export const InsufficientCreditsModal = ({
  isOpen,
  onClose,
  currentCredits,
  requiredCredits
}: InsufficientCreditsModalProps) => {
  const whatsappNumber = '201205201537';
  const whatsappMessage = encodeURIComponent('مرحباً، أريد شحن رصيد النقاط في تطبيق PESO AI');
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative glass-card p-8 max-w-md w-full text-center"
        >
          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-destructive/20 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-foreground mb-3">
            رصيد غير كافي
          </h2>

          {/* Message */}
          <p className="text-muted-foreground mb-6">
            لا يوجد لديك رصيد كافٍ لإتمام هذه العملية.
            <br />
            تحتاج <span className="text-primary font-bold">{requiredCredits}</span> نقطة، 
            ولديك <span className="text-destructive font-bold">{currentCredits}</span> نقطة فقط.
          </p>

          {/* Pricing Info */}
          <div className="bg-muted/30 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-foreground mb-2">خطة الاشتراك الشهري</h3>
            <p className="text-3xl font-bold text-primary mb-1">100 جنيه</p>
            <p className="text-sm text-muted-foreground">نقاط غير محدودة شهرياً</p>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="hero-button w-full flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              تواصل عبر واتساب للاشتراك
            </a>

            <a
              href={`tel:+${whatsappNumber}`}
              className="secondary-button w-full flex items-center justify-center gap-2"
            >
              <Phone className="w-5 h-5" />
              اتصل الآن: 01205201537
            </a>

            <button
              onClick={onClose}
              className="w-full py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              إغلاق
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
