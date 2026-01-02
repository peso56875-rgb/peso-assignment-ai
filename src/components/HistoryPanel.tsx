import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, FileText, Trash2, Download, History, X, BookOpen, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { processContentWithMath } from '@/lib/mathRenderer';

interface QuizHistory {
  id: string;
  student_name: string;
  student_id: string;
  question_image: string | null;
  solution: string;
  created_at: string;
}

interface AssignmentHistory {
  id: string;
  student_name: string;
  student_id: string;
  subject_name: string;
  professor_name: string;
  college_name: string;
  department_name: string;
  university_logo: string | null;
  topic: string;
  content: string;
  images: string[] | null;
  created_at: string;
}

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HistoryPanel = ({ isOpen, onClose }: HistoryPanelProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'quizzes' | 'assignments'>('quizzes');
  const [quizzes, setQuizzes] = useState<QuizHistory[]>([]);
  const [assignments, setAssignments] = useState<AssignmentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchHistory();
    }
  }, [isOpen, user]);

  const fetchHistory = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const [quizResult, assignmentResult] = await Promise.all([
        supabase
          .from('quiz_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('assignment_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ]);

      if (quizResult.error) throw quizResult.error;
      if (assignmentResult.error) throw assignmentResult.error;

      setQuizzes(quizResult.data || []);
      setAssignments(assignmentResult.data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('حدث خطأ أثناء جلب السجل');
    } finally {
      setLoading(false);
    }
  };

  const deleteQuiz = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from('quiz_history')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setQuizzes(prev => prev.filter(q => q.id !== id));
      toast.success('تم حذف الكويز بنجاح');
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast.error('حدث خطأ أثناء الحذف');
    } finally {
      setDeletingId(null);
    }
  };

  const deleteAssignment = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from('assignment_history')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAssignments(prev => prev.filter(a => a.id !== id));
      toast.success('تم حذف الأسايمنت بنجاح');
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error('حدث خطأ أثناء الحذف');
    } finally {
      setDeletingId(null);
    }
  };

  const downloadQuizPDF = async (quiz: QuizHistory) => {
    try {
      toast.loading('جاري إنشاء ملف PDF...', { id: 'pdf-download' });
      
      const html2pdf = (await import('html2pdf.js')).default;
      
      const element = document.createElement('div');
      element.innerHTML = `
        <style>
          * { font-family: 'Arial', sans-serif; }
          .content { padding: 40px; }
          h1 { color: #1a365d; margin-bottom: 20px; }
          p { line-height: 1.8; color: #333; }
        </style>
        <div class="content">
          <h1>Quiz Solution - ${quiz.student_name}</h1>
          <p><strong>Student ID:</strong> ${quiz.student_id}</p>
          <p><strong>Date:</strong> ${new Date(quiz.created_at).toLocaleDateString('ar-EG')}</p>
          <hr style="margin: 20px 0;">
          ${processContentWithMath(quiz.solution)}
        </div>
      `;

      const opt = {
        margin: 10,
        filename: `Quiz_${quiz.student_id}_${new Date(quiz.created_at).toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };

      await html2pdf().set(opt).from(element).save();
      toast.success('تم تحميل الملف بنجاح!', { id: 'pdf-download' });
    } catch (error) {
      console.error('Error creating PDF:', error);
      toast.error('حدث خطأ أثناء إنشاء الـ PDF', { id: 'pdf-download' });
    }
  };

  const downloadAssignmentPDF = async (assignment: AssignmentHistory) => {
    try {
      toast.loading('جاري إنشاء ملف PDF...', { id: 'pdf-download' });
      
      const html2pdf = (await import('html2pdf.js')).default;
      
      const element = document.createElement('div');
      element.innerHTML = `
        <style>
          * { font-family: 'Arial', sans-serif; }
          .content { padding: 40px; }
          h1 { color: #1a365d; margin-bottom: 20px; }
          p { line-height: 1.8; color: #333; }
        </style>
        <div class="content">
          <h1>${assignment.topic}</h1>
          <p><strong>Student:</strong> ${assignment.student_name}</p>
          <p><strong>Subject:</strong> ${assignment.subject_name}</p>
          <p><strong>Professor:</strong> ${assignment.professor_name}</p>
          <hr style="margin: 20px 0;">
          ${assignment.content}
        </div>
      `;

      const opt = {
        margin: 10,
        filename: `Assignment_${assignment.student_id}_${assignment.topic.slice(0, 20)}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };

      await html2pdf().set(opt).from(element).save();
      toast.success('تم تحميل الملف بنجاح!', { id: 'pdf-download' });
    } catch (error) {
      console.error('Error creating PDF:', error);
      toast.error('حدث خطأ أثناء إنشاء الـ PDF', { id: 'pdf-download' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="fixed left-0 top-0 h-full w-full max-w-lg bg-card border-r border-border shadow-xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <History className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">سجل الأعمال</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('quizzes')}
            className={`flex-1 py-3 px-4 font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'quizzes' 
                ? 'text-primary border-b-2 border-primary bg-primary/5' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            الكويزات ({quizzes.length})
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`flex-1 py-3 px-4 font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'assignments' 
                ? 'text-primary border-b-2 border-primary bg-primary/5' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            الأسايمنتات ({assignments.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : activeTab === 'quizzes' ? (
            quizzes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>لا يوجد كويزات محلولة</p>
              </div>
            ) : (
              <div className="space-y-3">
                {quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="p-4 rounded-xl bg-muted/30 border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {quiz.student_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ID: {quiz.student_id}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(quiz.created_at).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => downloadQuizPDF(quiz)}
                          className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                          title="تحميل PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteQuiz(quiz.id)}
                          disabled={deletingId === quiz.id}
                          className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50"
                          title="حذف"
                        >
                          {deletingId === quiz.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            assignments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>لا يوجد أسايمنتات سابقة</p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="p-4 rounded-xl bg-muted/30 border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {assignment.topic}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {assignment.subject_name} - {assignment.student_name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(assignment.created_at).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => downloadAssignmentPDF(assignment)}
                          className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                          title="تحميل PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteAssignment(assignment.id)}
                          disabled={deletingId === assignment.id}
                          className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50"
                          title="حذف"
                        >
                          {deletingId === assignment.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
