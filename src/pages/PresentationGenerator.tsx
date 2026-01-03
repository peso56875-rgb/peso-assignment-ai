import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Presentation, FileText, HelpCircle, ArrowLeft, Download, Loader2 } from 'lucide-react';
import { UserMenu } from '@/components/UserMenu';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { generatePowerPoint } from '@/lib/presentationGenerator';

interface PresentationContent {
  title: string;
  slides: Array<{
    title: string;
    points: string[];
  }>;
}

const PresentationGenerator = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [generatedContent, setGeneratedContent] = useState<PresentationContent | null>(null);
  
  const [formData, setFormData] = useState({
    studentName: '',
    studentId: '',
    subjectName: '',
    professorName: '',
    collegeName: '',
    departmentName: '',
    universityLogo: '',
    topic: '',
    slidesCount: 10,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.studentName || !formData.studentId || !formData.topic || !formData.collegeName || !formData.subjectName) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (formData.slidesCount < 5 || formData.slidesCount > 20) {
      toast.error('عدد الشرائح يجب أن يكون بين 5 و 20');
      return;
    }

    setIsLoading(true);
    setLoadingStep('جاري توليد محتوى العرض...');

    try {
      const { data, error } = await supabase.functions.invoke('generate-presentation', {
        body: {
          topic: formData.topic,
          slidesCount: formData.slidesCount,
          studentName: formData.studentName,
          subjectName: formData.subjectName,
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'فشل في توليد المحتوى');

      setGeneratedContent(data.content);

      // Save to history
      if (user) {
        setLoadingStep('جاري حفظ العرض...');
        const { error: historyError } = await supabase.from('presentation_history').insert({
          user_id: user.id,
          student_name: formData.studentName,
          student_id: formData.studentId,
          subject_name: formData.subjectName,
          professor_name: formData.professorName || null,
          college_name: formData.collegeName,
          department_name: formData.departmentName || null,
          university_logo: formData.universityLogo || null,
          topic: formData.topic,
          slides_count: formData.slidesCount,
          content: data.content,
        });

        if (historyError) {
          console.error('Error saving to history:', historyError);
        }
      }

      toast.success('تم توليد العرض بنجاح! 🎉');
    } catch (error: any) {
      console.error('Error generating presentation:', error);
      toast.error(error.message || 'حدث خطأ أثناء توليد العرض');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleDownload = async () => {
    if (!generatedContent) return;

    setIsLoading(true);
    setLoadingStep('جاري إنشاء ملف PowerPoint...');

    try {
      await generatePowerPoint({
        studentName: formData.studentName,
        studentId: formData.studentId,
        subjectName: formData.subjectName,
        professorName: formData.professorName,
        collegeName: formData.collegeName,
        departmentName: formData.departmentName,
        universityLogo: formData.universityLogo,
        topic: formData.topic,
        content: generatedContent,
      });

      toast.success('تم تحميل العرض بنجاح!');
    } catch (error: any) {
      console.error('Error downloading presentation:', error);
      toast.error('حدث خطأ أثناء تحميل العرض');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleReset = () => {
    setGeneratedContent(null);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />

      <UserMenu />

      <main className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-12 animate-slide-up">
          <div className="flex justify-center mb-6">
            <img src="/peso-logo.png" alt="PESO AI Logo" className="w-24 h-24 md:w-32 md:h-32 object-contain" />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-6">
            <Presentation className="w-4 h-4 text-secondary" />
            <span className="text-sm text-secondary font-medium">PowerPoint Generator</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-primary">PESO</span>{' '}
            <span className="text-foreground">Presentation Maker</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            أنشئ عروض PowerPoint احترافية بالذكاء الاصطناعي
          </p>

          {/* Navigation */}
          <div className="flex justify-center gap-4 mb-8">
            <Link to="/" className="px-6 py-3 rounded-xl border border-border bg-muted/30 text-foreground font-medium hover:bg-muted/50 transition-colors flex items-center gap-2">
              <FileText className="w-4 h-4" />
              إنشاء أسايمنت
            </Link>
            <Link to="/quiz-solver" className="px-6 py-3 rounded-xl border border-border bg-muted/30 text-foreground font-medium hover:bg-muted/50 transition-colors flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              حل كويز / شيت
            </Link>
            <span className="px-6 py-3 rounded-xl bg-secondary/20 text-secondary font-medium border border-secondary/30 flex items-center gap-2">
              <Presentation className="w-4 h-4" />
              عرض تقديمي
            </span>
          </div>
        </header>

        {/* Main Content */}
        {isLoading ? (
          <div className="glass-card p-12 text-center animate-fade-in">
            <Loader2 className="w-16 h-16 text-secondary mx-auto mb-6 animate-spin" />
            <h2 className="text-2xl font-bold text-foreground mb-2">جاري العمل...</h2>
            <p className="text-muted-foreground">{loadingStep}</p>
          </div>
        ) : generatedContent ? (
          <div className="glass-card p-8 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">تم توليد العرض!</h2>
              <Button variant="outline" onClick={handleReset} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                عرض جديد
              </Button>
            </div>

            {/* Preview */}
            <div className="bg-muted/30 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-primary mb-4">{generatedContent.title}</h3>
              <p className="text-muted-foreground mb-4">
                عدد الشرائح: {generatedContent.slides.length + 2} (بما فيها شريحة العنوان والشكر)
              </p>
              
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {generatedContent.slides.map((slide, index) => (
                  <div key={index} className="bg-background/50 rounded-lg p-4">
                    <h4 className="font-semibold text-foreground mb-2">
                      شريحة {index + 1}: {slide.title}
                    </h4>
                    <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
                      {slide.points.map((point, pIndex) => (
                        <li key={pIndex}>{point}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={handleDownload} className="w-full gap-2 bg-secondary hover:bg-secondary/90">
              <Download className="w-5 h-5" />
              تحميل ملف PowerPoint
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-card p-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">معلومات الطالب</h3>
                
                <div>
                  <Label htmlFor="studentName">اسم الطالب *</Label>
                  <Input
                    id="studentName"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleChange}
                    placeholder="أدخل اسمك الكامل"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="studentId">رقم الطالب (ID) *</Label>
                  <Input
                    id="studentId"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    placeholder="مثال: 2024001234"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="collegeName">اسم الكلية *</Label>
                  <Input
                    id="collegeName"
                    name="collegeName"
                    value={formData.collegeName}
                    onChange={handleChange}
                    placeholder="مثال: كلية الهندسة"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="departmentName">اسم القسم (اختياري)</Label>
                  <Input
                    id="departmentName"
                    name="departmentName"
                    value={formData.departmentName}
                    onChange={handleChange}
                    placeholder="مثال: قسم هندسة الحاسوب"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Subject Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">معلومات العرض</h3>

                <div>
                  <Label htmlFor="subjectName">اسم المادة *</Label>
                  <Input
                    id="subjectName"
                    name="subjectName"
                    value={formData.subjectName}
                    onChange={handleChange}
                    placeholder="مثال: الذكاء الاصطناعي"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="professorName">اسم الدكتور (اختياري)</Label>
                  <Input
                    id="professorName"
                    name="professorName"
                    value={formData.professorName}
                    onChange={handleChange}
                    placeholder="مثال: د. أحمد محمد"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="topic">موضوع العرض *</Label>
                  <Input
                    id="topic"
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    placeholder="مثال: تعلم الآلة وتطبيقاته"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="slidesCount">عدد الشرائح (5-20) *</Label>
                  <Input
                    id="slidesCount"
                    name="slidesCount"
                    type="number"
                    min={5}
                    max={20}
                    value={formData.slidesCount}
                    onChange={handleChange}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="universityLogo">رابط لوجو الجامعة (اختياري)</Label>
                  <Input
                    id="universityLogo"
                    name="universityLogo"
                    value={formData.universityLogo}
                    onChange={handleChange}
                    placeholder="https://example.com/logo.png"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full mt-8 gap-2 bg-secondary hover:bg-secondary/90">
              <Presentation className="w-5 h-5" />
              إنشاء العرض التقديمي
            </Button>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default PresentationGenerator;
