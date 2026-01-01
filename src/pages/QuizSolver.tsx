import { useState } from 'react';
import { Upload, FileText, Download, RotateCcw, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface SolvedQuiz {
  content: string;
  studentName: string;
  studentId: string;
  fileName: string;
}

const QuizSolver = () => {
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [solvedQuiz, setSolvedQuiz] = useState<SolvedQuiz | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!validTypes.includes(selectedFile.type)) {
        toast.error('يرجى رفع صورة أو ملف PDF فقط');
        return;
      }
      
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('حجم الملف يجب أن يكون أقل من 10MB');
        return;
      }

      setFile(selectedFile);
      
      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setFilePreview(e.target?.result as string);
        reader.readAsDataURL(selectedFile);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentName.trim() || !studentId.trim()) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    
    if (!file) {
      toast.error('يرجى رفع صورة السؤال أو الشيت');
      return;
    }

    setIsLoading(true);
    setSolvedQuiz(null);

    try {
      setLoadingStep('جاري تحليل الأسئلة...');
      
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { data, error } = await supabase.functions.invoke('solve-quiz', {
        body: { 
          image: base64,
          fileName: file.name,
          fileType: file.type
        }
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      setSolvedQuiz({
        content: data.solution,
        studentName,
        studentId,
        fileName: file.name
      });

      toast.success('تم حل الأسئلة بنجاح! 🎉');

    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء تحليل الأسئلة');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleReset = () => {
    setSolvedQuiz(null);
    setFile(null);
    setFilePreview(null);
    setStudentName('');
    setStudentId('');
  };

  const downloadAsPDF = async () => {
    if (!solvedQuiz) return;

    try {
      toast.loading('جاري إنشاء ملف PDF...', { id: 'pdf-download' });
      
      const html2pdf = (await import('html2pdf.js')).default;
      
      const element = document.createElement('div');
      element.innerHTML = `
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800&display=swap');
          * { font-family: 'Poppins', Arial, sans-serif; margin: 0; padding: 0; box-sizing: border-box; }
          
          .cover-page {
            min-height: 100vh;
            background: linear-gradient(135deg, #0a1628 0%, #1a365d 50%, #0d1b2a 100%);
            position: relative;
            padding: 60px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
          }
          
          .cover-pattern {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background-image: 
              radial-gradient(circle at 20% 80%, rgba(212, 175, 55, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(56, 189, 248, 0.1) 0%, transparent 50%);
          }
          
          .cover-border {
            position: absolute;
            top: 25px; left: 25px; right: 25px; bottom: 25px;
            border: 2px solid rgba(212, 175, 55, 0.3);
            border-radius: 20px;
          }
          
          .cover-icon { font-size: 80px; margin-bottom: 30px; }
          
          .cover-title {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 48px;
            font-weight: 800;
            color: #D4AF37;
            margin-bottom: 20px;
            text-shadow: 0 4px 30px rgba(212, 175, 55, 0.3);
          }
          
          .cover-subtitle {
            font-size: 20px;
            color: #ffffff;
            font-weight: 300;
            letter-spacing: 6px;
            text-transform: uppercase;
            margin-bottom: 50px;
          }
          
          .cover-divider {
            width: 200px;
            height: 3px;
            background: linear-gradient(90deg, transparent, #D4AF37, transparent);
            margin: 30px auto;
          }
          
          .cover-info {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(212, 175, 55, 0.2);
            border-radius: 15px;
            padding: 30px 50px;
          }
          
          .cover-info-row {
            display: flex;
            justify-content: space-between;
            padding: 15px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }
          .cover-info-row:last-child { border-bottom: none; }
          
          .cover-info-label {
            color: #D4AF37;
            font-weight: 600;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .cover-info-value {
            color: #ffffff;
            font-size: 16px;
            font-weight: 500;
          }
          
          .content-page {
            background: #ffffff;
            padding: 50px;
            min-height: 100vh;
          }
          
          .content-header {
            text-align: center;
            padding-bottom: 30px;
            margin-bottom: 30px;
            border-bottom: 3px solid #1a365d;
          }
          
          .content-header h1 {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 32px;
            color: #1a365d;
            margin-bottom: 10px;
          }
          
          .solution-badge {
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 8px 25px;
            border-radius: 25px;
            font-weight: 600;
            font-size: 14px;
          }
          
          h2 { 
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 22px; 
            color: #1a365d; 
            margin: 30px 0 15px 0; 
            padding-left: 15px; 
            border-left: 4px solid #10b981; 
          }
          
          h3 { 
            font-size: 18px; 
            color: #2d4a6f; 
            margin: 25px 0 12px 0; 
          }
          
          p { 
            line-height: 1.9; 
            color: #333; 
            text-align: justify; 
            margin-bottom: 16px; 
            font-size: 14px;
          }
          
          .question-block {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            border-left: 4px solid #10b981;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 10px 10px 0;
          }
          
          .answer-block {
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            border-left: 4px solid #3b82f6;
            padding: 20px;
            margin: 15px 0;
            border-radius: 0 10px 10px 0;
          }
          
          .thank-you-section {
            page-break-before: always;
            background: linear-gradient(135deg, #0a1628 0%, #1a365d 50%, #0d1b2a 100%);
            min-height: 60vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 60px;
            position: relative;
          }
          
          .thank-you-icon { font-size: 70px; margin-bottom: 25px; }
          
          .thank-you-title {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 46px;
            font-weight: 800;
            color: #D4AF37;
            margin-bottom: 20px;
          }
          
          .thank-you-message {
            font-size: 18px;
            color: rgba(255, 255, 255, 0.85);
            line-height: 1.8;
            max-width: 600px;
          }
          
          .thank-you-divider {
            width: 180px;
            height: 3px;
            background: linear-gradient(90deg, transparent, #D4AF37, transparent);
            margin: 25px auto;
          }
          
          .thank-you-footer {
            margin-top: 40px;
            color: rgba(255, 255, 255, 0.6);
            font-size: 14px;
          }
          
          .thank-you-student {
            color: #D4AF37;
            font-weight: 600;
            font-size: 18px;
            margin-top: 10px;
          }
        </style>
        
        <div class="cover-page">
          <div class="cover-pattern"></div>
          <div class="cover-border"></div>
          
          <div class="cover-icon">📝</div>
          <h1 class="cover-title">Quiz Solution</h1>
          <div class="cover-subtitle">AI Powered Answer Sheet</div>
          <div class="cover-divider"></div>
          
          <div class="cover-info">
            <div class="cover-info-row">
              <span class="cover-info-label">Student Name</span>
              <span class="cover-info-value">${solvedQuiz.studentName}</span>
            </div>
            <div class="cover-info-row">
              <span class="cover-info-label">Student ID</span>
              <span class="cover-info-value">${solvedQuiz.studentId}</span>
            </div>
            <div class="cover-info-row">
              <span class="cover-info-label">File Name</span>
              <span class="cover-info-value">${solvedQuiz.fileName}</span>
            </div>
            <div class="cover-info-row">
              <span class="cover-info-label">Date</span>
              <span class="cover-info-value">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>
        
        <div class="content-page">
          <div class="content-header">
            <h1>Solutions & Answers</h1>
            <span class="solution-badge">Complete Solution</span>
          </div>
          
          ${solvedQuiz.content
            .replace(/### (.*)/g, '<h3>$1</h3>')
            .replace(/## (.*)/g, '<h2>$1</h2>')
            .replace(/# (.*)/g, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .split('\n')
            .filter(line => line.trim())
            .map(line => {
              if (line.startsWith('<h')) return line;
              return `<p>${line}</p>`;
            })
            .join('')}
        </div>
        
        <div class="thank-you-section">
          <div class="thank-you-icon">🎓</div>
          <h2 class="thank-you-title">Good Luck!</h2>
          <div class="thank-you-divider"></div>
          <p class="thank-you-message">
            We hope these solutions help you understand the concepts better. 
            Keep learning and never stop asking questions!
          </p>
          <div class="thank-you-divider"></div>
          <div class="thank-you-footer">
            Prepared For
            <div class="thank-you-student">${solvedQuiz.studentName}</div>
          </div>
        </div>
      `;

      const opt = {
        margin: [0, 0, 0, 0] as [number, number, number, number],
        filename: `Quiz_Solution_${solvedQuiz.studentId}.pdf`,
        image: { type: 'jpeg' as const, quality: 1 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().set(opt).from(element).save();
      
      toast.success('تم تحميل ملف PDF بنجاح!', { id: 'pdf-download' });
    } catch (error) {
      console.error('Error creating PDF:', error);
      toast.error('حدث خطأ أثناء إنشاء الـ PDF', { id: 'pdf-download' });
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12 animate-slide-up">
          <Link to="/" className="inline-block mb-6">
            <img src="/peso-logo.png" alt="PESO Logo" className="w-20 h-20 mx-auto rounded-xl" />
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-primary">حل الكويز</span>
            <span className="text-secondary mx-3">&</span>
            <span className="text-primary">الشيت</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            ارفع صورة السؤال أو الشيت وسيقوم الذكاء الاصطناعي بحلها لك
          </p>
          
          {/* Navigation */}
          <div className="flex justify-center gap-4 mt-6">
            <Link 
              to="/" 
              className="px-6 py-3 rounded-xl border border-border bg-muted/30 text-foreground font-medium hover:bg-muted/50 transition-colors"
            >
              إنشاء أسايمنت
            </Link>
            <span className="px-6 py-3 rounded-xl bg-primary/20 text-primary font-medium border border-primary/30">
              حل كويز / شيت
            </span>
          </div>
        </div>

        {isLoading ? (
          /* Loading State */
          <div className="glass-card p-12 text-center animate-slide-up">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
              <FileText className="absolute inset-0 m-auto w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">{loadingStep}</h3>
            <p className="text-muted-foreground">يرجى الانتظار...</p>
          </div>
        ) : solvedQuiz ? (
          /* Result */
          <div className="space-y-8 animate-slide-up">
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={downloadAsPDF}
                className="hero-button flex items-center gap-3 text-lg px-8 py-5"
              >
                <Download className="w-6 h-6" />
                تحميل PDF
              </button>
              
              <button
                onClick={handleReset}
                className="px-6 py-4 rounded-xl border border-border bg-muted/30 text-foreground font-medium hover:bg-muted/50 transition-colors flex items-center gap-3"
              >
                <RotateCcw className="w-5 h-5" />
                حل سؤال جديد
              </button>
            </div>

            <div className="glass-card p-8">
              <div className="text-center mb-8 pb-6 border-b border-border">
                <h2 className="text-2xl font-bold text-primary mb-2 font-english" dir="ltr">
                  Quiz Solution
                </h2>
                <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground font-english" dir="ltr">
                  <span><strong>Student:</strong> {solvedQuiz.studentName}</span>
                  <span><strong>ID:</strong> {solvedQuiz.studentId}</span>
                </div>
              </div>

              <div 
                className="prose prose-invert max-w-none font-english text-foreground/90"
                dir="ltr"
                style={{ textAlign: 'left' }}
              >
                {solvedQuiz.content.split('\n').map((line, index) => {
                  const trimmed = line.trim();
                  if (!trimmed) return null;
                  
                  if (trimmed.startsWith('### ')) {
                    return <h3 key={index} className="text-xl font-semibold text-secondary mt-6 mb-3">{trimmed.replace('### ', '')}</h3>;
                  }
                  if (trimmed.startsWith('## ')) {
                    return <h2 key={index} className="text-2xl font-bold text-primary mt-8 mb-4">{trimmed.replace('## ', '')}</h2>;
                  }
                  if (trimmed.startsWith('# ')) {
                    return <h1 key={index} className="text-3xl font-bold text-primary mt-8 mb-4">{trimmed.replace('# ', '')}</h1>;
                  }
                  return <p key={index} className="mb-4 leading-relaxed">{trimmed}</p>;
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="glass-card p-8 space-y-8 animate-slide-up">
            {/* Warning */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-amber-200 text-sm">
                يرجى كتابة البيانات بالإنجليزية ورفع صورة واضحة للأسئلة
              </p>
            </div>

            {/* Student Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  اسم الطالب <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="input-field font-english"
                  placeholder="Enter your name"
                  dir="ltr"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  رقم الطالب (ID) <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="input-field font-english"
                  placeholder="Enter your ID"
                  dir="ltr"
                  required
                />
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-foreground">
                رفع السؤال أو الشيت <span className="text-destructive">*</span>
              </label>
              
              <div className="relative">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${file ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'}`}>
                  {file ? (
                    <div className="space-y-4">
                      {filePreview ? (
                        <img src={filePreview} alt="Preview" className="max-h-48 mx-auto rounded-xl shadow-lg" />
                      ) : (
                        <FileText className="w-16 h-16 mx-auto text-primary" />
                      )}
                      <div>
                        <p className="text-foreground font-medium">{file.name}</p>
                        <p className="text-muted-foreground text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-foreground font-medium mb-2">اضغط لرفع الملف أو اسحبه هنا</p>
                      <p className="text-muted-foreground text-sm">يدعم: JPG, PNG, WEBP, PDF (حتى 10MB)</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="hero-button w-full flex items-center justify-center gap-3 text-lg py-5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  جاري التحليل...
                </>
              ) : (
                <>
                  <FileText className="w-6 h-6" />
                  حل الأسئلة
                </>
              )}
            </button>
          </form>
        )}
      </div>
      
      <Footer />
    </main>
  );
};

export default QuizSolver;
