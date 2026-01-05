import { useState } from 'react';
import { ArrowRight, FileQuestion, Download, RotateCcw, BookOpen, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserMenu } from '@/components/UserMenu';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useCredits } from '@/hooks/useCredits';
import { useNotifications } from '@/hooks/useNotifications';
import { InsufficientCreditsModal } from '@/components/InsufficientCreditsModal';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import html2pdf from 'html2pdf.js';

interface Question {
  id: number;
  type: 'mcq' | 'truefalse';
  question: string;
  options: string[] | null;
  correctAnswer: string;
  explanation: string;
}

interface ExamResult {
  questions: Question[];
  metadata: {
    totalQuestions: number;
    difficulty: string;
    questionType: string;
    subjectName: string;
  };
}

const CREDIT_COST = 20;

const ExamGenerator = () => {
  const { user } = useAuth();
  const { credits, deductCredits, hasEnoughCredits } = useCredits();
  const { notifyExamComplete, requestPermission } = useNotifications();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showInsufficientCredits, setShowInsufficientCredits] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  
  const [formData, setFormData] = useState({
    studentName: '',
    studentId: '',
    subjectName: '',
    content: '',
    questionCount: 10,
    difficulty: 'medium',
    questionType: 'mcq'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Request notification permission
    await requestPermission();

    if (!hasEnoughCredits(CREDIT_COST)) {
      setShowInsufficientCredits(true);
      return;
    }

    setIsLoading(true);

    try {
      // Deduct credits first
      const deducted = await deductCredits(CREDIT_COST, 'توليد أسئلة امتحان');
      if (!deducted) {
        setShowInsufficientCredits(true);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('generate-exam', {
        body: {
          content: formData.content,
          questionCount: parseInt(formData.questionCount.toString()),
          difficulty: formData.difficulty,
          questionType: formData.questionType,
          subjectName: formData.subjectName
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to generate exam');

      setExamResult(data);

      // Save to history if user is logged in
      if (user) {
        await supabase.from('exam_history').insert({
          user_id: user.id,
          student_name: formData.studentName,
          student_id: formData.studentId,
          subject_name: formData.subjectName,
          content: formData.content,
          questions: data.questions,
          difficulty: formData.difficulty,
          question_count: parseInt(formData.questionCount.toString())
        });
      }

      notifyExamComplete();
      toast.success('تم توليد أسئلة الامتحان بنجاح!');
    } catch (error) {
      console.error('Error generating exam:', error);
      toast.error('حدث خطأ أثناء توليد الأسئلة');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setExamResult(null);
    setShowAnswers(false);
  };

  const downloadAsPDF = async (withAnswers: boolean) => {
    const element = document.getElementById(withAnswers ? 'exam-answers' : 'exam-questions');
    if (!element) return;

    toast.loading('جاري إنشاء ملف PDF...');

    const opt = {
      margin: [15, 15, 15, 15] as [number, number, number, number],
      filename: `exam_${withAnswers ? 'answers' : 'questions'}_${formData.subjectName}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm' as const, format: 'a4', orientation: 'portrait' as const }
    };

    try {
      await html2pdf().set(opt).from(element).save();
      toast.dismiss();
      toast.success('تم تحميل الملف بنجاح!');
    } catch (error) {
      toast.dismiss();
      toast.error('حدث خطأ أثناء إنشاء الملف');
    }
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
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <img src="/peso-logo.png" alt="PESO AI" className="h-16 mx-auto" />
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            <FileQuestion className="inline-block w-8 h-8 mr-2 text-primary" />
            مولد أسئلة الامتحان
          </h1>
          <p className="text-muted-foreground">
            أدخل المحتوى وسنقوم بتوليد أسئلة امتحان احترافية
          </p>
        </div>

        {isLoading ? (
          <div className="glass-card p-8 text-center max-w-2xl mx-auto">
            <Loader2 className="w-16 h-16 mx-auto mb-4 text-primary animate-spin" />
            <h2 className="text-xl font-bold text-foreground mb-2">جاري توليد الأسئلة...</h2>
            <p className="text-muted-foreground">يرجى الانتظار بينما يقوم الذكاء الاصطناعي بإنشاء الأسئلة</p>
          </div>
        ) : examResult ? (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Controls */}
            <div className="glass-card p-4 flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => setShowAnswers(!showAnswers)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  showAnswers ? 'bg-primary text-white' : 'bg-muted text-foreground hover:bg-muted/80'
                }`}
              >
                {showAnswers ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                {showAnswers ? 'إخفاء الإجابات' : 'عرض الإجابات'}
              </button>
              <button
                onClick={() => downloadAsPDF(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity"
              >
                <Download className="w-4 h-4" />
                تحميل الأسئلة PDF
              </button>
              <button
                onClick={() => downloadAsPDF(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90 transition-opacity"
              >
                <Download className="w-4 h-4" />
                تحميل مع الإجابات PDF
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                امتحان جديد
              </button>
            </div>

            {/* Questions Display */}
            <div id="exam-questions" className="glass-card p-6">
              <div className="text-center mb-6 pb-6 border-b border-border">
                <h2 className="text-2xl font-bold text-foreground">{formData.subjectName}</h2>
                <p className="text-muted-foreground">
                  عدد الأسئلة: {examResult.metadata.totalQuestions} | 
                  المستوى: {examResult.metadata.difficulty === 'easy' ? 'سهل' : examResult.metadata.difficulty === 'medium' ? 'متوسط' : 'صعب'}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  الطالب: {formData.studentName} | الرقم الجامعي: {formData.studentId}
                </p>
              </div>

              <div className="space-y-6">
                {examResult.questions.map((q, idx) => (
                  <div key={q.id} className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <p className="text-foreground font-medium">{q.question}</p>
                    </div>

                    {q.type === 'mcq' && q.options && (
                      <div className="grid gap-2 mr-11">
                        {q.options.map((option, optIdx) => (
                          <div
                            key={optIdx}
                            className={`p-3 rounded-lg border transition-colors ${
                              showAnswers && option.startsWith(q.correctAnswer)
                                ? 'bg-green-500/20 border-green-500'
                                : 'bg-background border-border'
                            }`}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    )}

                    {q.type === 'truefalse' && (
                      <div className="flex gap-4 mr-11">
                        <div className={`px-6 py-2 rounded-lg border ${
                          showAnswers && q.correctAnswer === 'True'
                            ? 'bg-green-500/20 border-green-500'
                            : 'bg-background border-border'
                        }`}>
                          صح
                        </div>
                        <div className={`px-6 py-2 rounded-lg border ${
                          showAnswers && q.correctAnswer === 'False'
                            ? 'bg-green-500/20 border-green-500'
                            : 'bg-background border-border'
                        }`}>
                          خطأ
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Answers Section (Hidden but used for PDF) */}
            <div id="exam-answers" className="glass-card p-6" style={{ display: showAnswers ? 'block' : 'none' }}>
              <div className="text-center mb-6 pb-6 border-b border-border">
                <h2 className="text-2xl font-bold text-foreground">{formData.subjectName} - نموذج الإجابة</h2>
              </div>

              <div className="space-y-4">
                {examResult.questions.map((q, idx) => (
                  <div key={q.id} className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-primary">السؤال {idx + 1}:</span>
                      <span className="px-3 py-1 rounded-full bg-green-500 text-white text-sm">
                        {q.correctAnswer}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      <AlertCircle className="inline w-4 h-4 mr-1" />
                      {q.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-card p-6 max-w-2xl mx-auto space-y-6">
            {/* Student Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="studentName">اسم الطالب</Label>
                <Input
                  id="studentName"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
              </div>
              <div>
                <Label htmlFor="studentId">الرقم الجامعي</Label>
                <Input
                  id="studentId"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="subjectName">اسم المادة</Label>
              <Input
                id="subjectName"
                name="subjectName"
                value={formData.subjectName}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>

            {/* Content */}
            <div>
              <Label htmlFor="content">محتوى المادة (ملخص أو نص)</Label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows={8}
                className="input-field resize-none"
                placeholder="أدخل المحتوى الذي تريد توليد أسئلة منه..."
              />
            </div>

            {/* Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="questionCount">عدد الأسئلة</Label>
                <select
                  id="questionCount"
                  name="questionCount"
                  value={formData.questionCount}
                  onChange={handleChange}
                  className="input-field w-full"
                >
                  <option value={10}>10 أسئلة</option>
                  <option value={15}>15 سؤال</option>
                  <option value={20}>20 سؤال</option>
                  <option value={30}>30 سؤال</option>
                  <option value={50}>50 سؤال</option>
                </select>
              </div>

              <div>
                <Label htmlFor="difficulty">مستوى الصعوبة</Label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  className="input-field w-full"
                >
                  <option value="easy">سهل</option>
                  <option value="medium">متوسط</option>
                  <option value="hard">صعب</option>
                </select>
              </div>

              <div>
                <Label htmlFor="questionType">نوع الأسئلة</Label>
                <select
                  id="questionType"
                  name="questionType"
                  value={formData.questionType}
                  onChange={handleChange}
                  className="input-field w-full"
                >
                  <option value="mcq">اختيار من متعدد</option>
                  <option value="truefalse">صح وخطأ</option>
                  <option value="mix">مختلط</option>
                </select>
              </div>
            </div>

            {/* Credit info */}
            <div className="bg-muted/30 rounded-lg p-4 flex items-center justify-between">
              <span className="text-muted-foreground">تكلفة التوليد:</span>
              <span className="text-primary font-bold">{CREDIT_COST} نقطة</span>
            </div>

            <button type="submit" className="hero-button w-full flex items-center justify-center gap-2">
              <FileQuestion className="w-5 h-5" />
              توليد أسئلة الامتحان
            </button>
          </form>
        )}

        {/* Navigation */}
        <div className="flex justify-center mt-8 gap-4 flex-wrap">
          <Link to="/" className="secondary-button flex items-center gap-2">
            <ArrowRight className="w-4 h-4" />
            الأسايمنت
          </Link>
          <Link to="/quiz-solver" className="secondary-button flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            حل الكويز
          </Link>
          <Link to="/presentation" className="secondary-button flex items-center gap-2">
            <FileQuestion className="w-4 h-4" />
            العرض التقديمي
          </Link>
          <Link to="/pricing" className="secondary-button flex items-center gap-2">
            💰 الاشتراكات
          </Link>
        </div>
      </main>

      <Footer />

      <InsufficientCreditsModal
        isOpen={showInsufficientCredits}
        onClose={() => setShowInsufficientCredits(false)}
        currentCredits={credits}
        requiredCredits={CREDIT_COST}
      />
    </div>
  );
};

export default ExamGenerator;
