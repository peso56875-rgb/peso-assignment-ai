import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Play, Pause, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Slide {
  title: string;
  points: string[];
  imageUrl?: string;
}

interface PresentationContent {
  title: string;
  slides: Slide[];
}

interface SlideshowPreviewProps {
  content: PresentationContent;
  isOpen: boolean;
  onClose: () => void;
  teamMembers?: { name: string; id: string }[];
  collegeName?: string;
  subjectName?: string;
}

export const SlideshowPreview = ({
  content,
  isOpen,
  onClose,
  teamMembers = [],
  collegeName = '',
  subjectName = ''
}: SlideshowPreviewProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Total slides: title + content slides + thank you
  const totalSlides = content.slides.length + 2;

  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev < totalSlides - 1 ? prev + 1 : 0));
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide(prev => (prev > 0 ? prev - 1 : totalSlides - 1));
  }, [totalSlides]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
          nextSlide();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          prevSlide();
          break;
        case 'Escape':
          onClose();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, nextSlide, prevSlide, onClose]);

  // Auto play
  useEffect(() => {
    if (!isAutoPlay || !isOpen) return;

    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlay, isOpen, nextSlide]);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (!isOpen) return null;

  const renderSlideContent = () => {
    // Title slide
    if (currentSlide === 0) {
      return (
        <motion.div
          key="title"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="flex flex-col items-center justify-center h-full text-center p-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            {content.title}
          </h1>
          <div className="w-24 h-1 bg-secondary mb-8"></div>
          <p className="text-lg text-white/80 mb-2">
            {teamMembers.map(m => m.name).join(' • ')}
          </p>
          <p className="text-sm text-white/60">{collegeName}</p>
          <p className="text-sm text-white/60">{subjectName}</p>
        </motion.div>
      );
    }

    // Thank you slide
    if (currentSlide === totalSlides - 1) {
      return (
        <motion.div
          key="thanks"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="flex flex-col items-center justify-center h-full text-center p-8"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Thank You!
          </h1>
          <div className="w-24 h-1 bg-secondary mb-8"></div>
          <p className="text-xl text-secondary">Questions & Discussion</p>
        </motion.div>
      );
    }

    // Content slides
    const slideData = content.slides[currentSlide - 1];
    return (
      <motion.div
        key={currentSlide}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        className="h-full p-8 md:p-12"
      >
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            {slideData.title}
          </h2>
        </div>
        
        <div className={`grid ${slideData.imageUrl ? 'md:grid-cols-2' : 'grid-cols-1'} gap-6`}>
          <ul className="space-y-4">
            {slideData.points.map((point, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-3 text-white/90"
              >
                <span className="w-2 h-2 rounded-full bg-secondary mt-2 shrink-0"></span>
                <span className="text-lg">{point}</span>
              </motion.li>
            ))}
          </ul>
          
          {slideData.imageUrl && (
            <div className="flex items-center justify-center">
              <img
                src={slideData.imageUrl}
                alt={slideData.title}
                className="max-h-64 rounded-lg shadow-xl"
              />
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#0f172a]">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={() => setIsAutoPlay(!isAutoPlay)}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
          title={isAutoPlay ? 'إيقاف التشغيل التلقائي' : 'تشغيل تلقائي'}
        >
          {isAutoPlay ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
          title="ملء الشاشة"
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>
        <button
          onClick={onClose}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
          title="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Slide counter */}
      <div className="absolute top-4 left-4 z-10 px-4 py-2 rounded-lg bg-white/10 text-white text-sm">
        {currentSlide + 1} / {totalSlides}
      </div>

      {/* Main content */}
      <div className="h-full flex items-center justify-center">
        <AnimatePresence mode="wait">
          {renderSlideContent()}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        {/* Progress bar */}
        <div className="w-full h-1 bg-white/20 rounded-full mb-4 overflow-hidden">
          <motion.div
            className="h-full bg-secondary"
            initial={{ width: 0 }}
            animate={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={prevSlide}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          {/* Slide indicators */}
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSlides }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentSlide
                    ? 'bg-secondary w-6'
                    : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={nextSlide}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Keyboard hint */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/40 text-xs">
        استخدم الأسهم للتنقل • اضغط F لملء الشاشة • اضغط ESC للإغلاق
      </div>
    </div>
  );
};
