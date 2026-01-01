import { Download, RotateCcw, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { GeneratedAssignment } from '@/pages/Index';

interface AssignmentResultProps {
  assignment: GeneratedAssignment;
  onReset: () => void;
}

export const AssignmentResult = ({ assignment, onReset }: AssignmentResultProps) => {

  const generateContentWithImages = () => {
    const contentLines = assignment.content
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
      });
    
    const totalLines = contentLines.length;
    const images = assignment.images;
    const imageCount = images.length;
    
    if (imageCount === 0) {
      return contentLines.join('');
    }
    
    // Calculate positions to insert images throughout content
    const positions: number[] = [];
    for (let i = 0; i < imageCount; i++) {
      const pos = Math.floor((totalLines / (imageCount + 1)) * (i + 1));
      positions.push(pos);
    }
    
    let result = '';
    let imageIndex = 0;
    
    contentLines.forEach((line, index) => {
      result += line;
      if (positions.includes(index + 1) && imageIndex < imageCount) {
        result += `
          <div class="inline-image">
            <img src="${images[imageIndex]}" alt="Figure ${imageIndex + 1}" />
            <div class="image-caption">Figure ${imageIndex + 1}: Visual illustration related to the topic</div>
          </div>
        `;
        imageIndex++;
      }
    });
    
    return result;
  };

  const downloadAsPDF = async () => {
    try {
      toast.loading('جاري إنشاء ملف PDF...', { id: 'pdf-download' });
      
      const html2pdf = (await import('html2pdf.js')).default;
      
      const element = document.createElement('div');
      element.innerHTML = `
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700;800;900&display=swap');
          * { font-family: 'Poppins', Arial, sans-serif; margin: 0; padding: 0; box-sizing: border-box; }
          
          /* Cover Page */
          .cover-page {
            min-height: 100vh;
            background: linear-gradient(135deg, #0a1628 0%, #1a365d 50%, #0d1b2a 100%);
            position: relative;
            overflow: hidden;
            padding: 40px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
          }
          
          .cover-pattern {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: 
              radial-gradient(circle at 20% 80%, rgba(212, 175, 55, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(56, 189, 248, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.05) 0%, transparent 70%);
            pointer-events: none;
          }
          
          .cover-border {
            position: absolute;
            top: 20px;
            left: 20px;
            right: 20px;
            bottom: 20px;
            border: 2px solid rgba(212, 175, 55, 0.3);
            border-radius: 20px;
            pointer-events: none;
          }
          
          .cover-corner {
            position: absolute;
            width: 60px;
            height: 60px;
            border: 3px solid #D4AF37;
          }
          .corner-tl { top: 30px; left: 30px; border-right: none; border-bottom: none; border-radius: 10px 0 0 0; }
          .corner-tr { top: 30px; right: 30px; border-left: none; border-bottom: none; border-radius: 0 10px 0 0; }
          .corner-bl { bottom: 30px; left: 30px; border-right: none; border-top: none; border-radius: 0 0 0 10px; }
          .corner-br { bottom: 30px; right: 30px; border-left: none; border-top: none; border-radius: 0 0 10px 0; }
          
          .university-logo {
            width: 120px;
            height: 120px;
            object-fit: contain;
            margin-bottom: 30px;
            border-radius: 10px;
            background: white;
            padding: 10px;
          }
          
          .cover-title {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 42px;
            font-weight: 800;
            color: #ffffff;
            text-transform: uppercase;
            letter-spacing: 3px;
            margin-bottom: 20px;
            text-shadow: 0 4px 30px rgba(212, 175, 55, 0.3);
            max-width: 80%;
            line-height: 1.2;
          }
          
          .cover-subtitle {
            font-size: 18px;
            color: #D4AF37;
            font-weight: 500;
            letter-spacing: 8px;
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
            backdrop-filter: blur(10px);
            border: 1px solid rgba(212, 175, 55, 0.2);
            border-radius: 15px;
            padding: 30px 50px;
            margin-top: 30px;
            text-align: left;
          }
          
          .cover-info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          .cover-info-row:last-child { border-bottom: none; }
          
          .cover-info-label {
            color: #D4AF37;
            font-weight: 600;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
            min-width: 150px;
          }
          
          .cover-info-value {
            color: #ffffff;
            font-size: 16px;
            font-weight: 500;
            text-align: right;
          }
          
          .cover-footer {
            position: absolute;
            bottom: 40px;
            left: 0;
            right: 0;
            text-align: center;
          }
          
          .cover-footer-text {
            color: rgba(255, 255, 255, 0.5);
            font-size: 12px;
            letter-spacing: 2px;
          }
          
          /* Content Pages */
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
            font-weight: 700;
            margin-bottom: 10px;
          }
          
          .content-header .topic-badge {
            display: inline-block;
            background: linear-gradient(135deg, #D4AF37 0%, #f4d03f 100%);
            color: #1a365d;
            padding: 8px 25px;
            border-radius: 25px;
            font-weight: 600;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          h1, h2, h3 { color: #1a365d; font-family: 'Playfair Display', Georgia, serif; }
          h1 { font-size: 28px; border-bottom: 3px solid #D4AF37; padding-bottom: 15px; margin: 35px 0 20px 0; }
          h2 { font-size: 22px; color: #2d4a6f; margin: 30px 0 15px 0; padding-left: 15px; border-left: 4px solid #D4AF37; }
          h3 { font-size: 18px; color: #3d5a80; margin: 25px 0 12px 0; }
          
          p { 
            line-height: 1.9; 
            color: #333; 
            text-align: justify; 
            margin-bottom: 16px; 
            font-size: 14px;
          }
          
          /* Inline Images */
          .inline-image {
            margin: 35px auto;
            text-align: center;
            page-break-inside: avoid;
            background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
            border-radius: 15px;
            padding: 20px;
            box-shadow: 0 5px 25px rgba(0,0,0,0.08);
            border: 1px solid #e8e8e8;
          }
          
          .inline-image img {
            max-width: 90%;
            height: auto;
            border-radius: 10px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.12);
          }
          
          .inline-image .image-caption {
            margin-top: 15px;
            font-size: 13px;
            color: #666;
            font-style: italic;
            text-align: center;
            padding: 10px 20px;
            background: linear-gradient(135deg, #1a365d 0%, #2d4a6f 100%);
            color: white;
            border-radius: 20px;
            display: inline-block;
          }
          
          /* Thank You Section */
          .thank-you-section {
            page-break-before: always;
            background: linear-gradient(135deg, #0a1628 0%, #1a365d 50%, #0d1b2a 100%);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 60px;
            position: relative;
            overflow: hidden;
          }
          
          .thank-you-pattern {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: 
              radial-gradient(circle at 30% 70%, rgba(212, 175, 55, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 70% 30%, rgba(56, 189, 248, 0.1) 0%, transparent 50%);
            pointer-events: none;
          }
          
          .thank-you-border {
            position: absolute;
            top: 30px;
            left: 30px;
            right: 30px;
            bottom: 30px;
            border: 2px solid rgba(212, 175, 55, 0.3);
            border-radius: 20px;
          }
          
          .thank-you-icon {
            font-size: 80px;
            margin-bottom: 30px;
          }
          
          .thank-you-title {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 52px;
            font-weight: 800;
            color: #D4AF37;
            margin-bottom: 25px;
            text-shadow: 0 4px 30px rgba(212, 175, 55, 0.4);
            letter-spacing: 4px;
          }
          
          .thank-you-subtitle {
            font-size: 22px;
            color: #ffffff;
            font-weight: 300;
            letter-spacing: 6px;
            text-transform: uppercase;
            margin-bottom: 40px;
          }
          
          .thank-you-message {
            font-size: 18px;
            color: rgba(255, 255, 255, 0.85);
            line-height: 2;
            max-width: 650px;
            margin-bottom: 40px;
          }
          
          .thank-you-divider {
            width: 200px;
            height: 3px;
            background: linear-gradient(90deg, transparent, #D4AF37, transparent);
            margin: 30px auto;
          }
          
          .thank-you-quote {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 22px;
            color: rgba(255, 255, 255, 0.75);
            font-style: italic;
            max-width: 550px;
            line-height: 1.6;
          }
          
          .thank-you-quote-author {
            margin-top: 15px;
            font-size: 14px;
            color: #D4AF37;
            letter-spacing: 2px;
          }
          
          .thank-you-footer {
            margin-top: 60px;
            color: rgba(255, 255, 255, 0.6);
            font-size: 14px;
            letter-spacing: 3px;
          }
          
          .thank-you-student {
            color: #D4AF37;
            font-weight: 600;
            font-size: 18px;
            margin-top: 10px;
          }
        </style>
        
        <!-- Cover Page -->
        <div class="cover-page">
          <div class="cover-pattern"></div>
          <div class="cover-border"></div>
          <div class="cover-corner corner-tl"></div>
          <div class="cover-corner corner-tr"></div>
          <div class="cover-corner corner-bl"></div>
          <div class="cover-corner corner-br"></div>
          
          ${assignment.universityLogo ? `<img src="${assignment.universityLogo}" alt="University Logo" class="university-logo" />` : ''}
          
          <div class="cover-subtitle">Academic Assignment</div>
          <h1 class="cover-title">${assignment.topic}</h1>
          <div class="cover-divider"></div>
          
          <div class="cover-info">
            <div class="cover-info-row">
              <span class="cover-info-label">Student Name</span>
              <span class="cover-info-value">${assignment.studentName}</span>
            </div>
            <div class="cover-info-row">
              <span class="cover-info-label">Student ID</span>
              <span class="cover-info-value">${assignment.studentId}</span>
            </div>
            <div class="cover-info-row">
              <span class="cover-info-label">College</span>
              <span class="cover-info-value">${assignment.collegeName}</span>
            </div>
            ${assignment.departmentName ? `
            <div class="cover-info-row">
              <span class="cover-info-label">Department</span>
              <span class="cover-info-value">${assignment.departmentName}</span>
            </div>
            ` : ''}
            <div class="cover-info-row">
              <span class="cover-info-label">Subject</span>
              <span class="cover-info-value">${assignment.subjectName}</span>
            </div>
            ${assignment.professorName ? `
            <div class="cover-info-row">
              <span class="cover-info-label">Professor</span>
              <span class="cover-info-value">${assignment.professorName}</span>
            </div>
            ` : ''}
          </div>
          
          <div class="cover-footer">
            <div class="cover-footer-text">Academic Year ${new Date().getFullYear()}</div>
          </div>
        </div>
        
        <!-- Content Pages with Inline Images -->
        <div class="content-page">
          <div class="content-header">
            <h1>${assignment.topic}</h1>
            <span class="topic-badge">Academic Research</span>
          </div>
          
          ${generateContentWithImages()}
        </div>
        
        <!-- Thank You Section -->
        <div class="thank-you-section">
          <div class="thank-you-pattern"></div>
          <div class="thank-you-border"></div>
          
          <div class="thank-you-icon">🎓</div>
          <h2 class="thank-you-title">Thank You</h2>
          <div class="thank-you-subtitle">For Your Attention</div>
          <div class="thank-you-divider"></div>
          
          <p class="thank-you-message">
            I sincerely appreciate the time and effort you have dedicated to reviewing this assignment. 
            Your guidance and expertise in teaching have been invaluable in shaping my understanding of this subject. 
            I hope this work reflects my commitment to learning and meets your academic expectations.
          </p>
          
          <div class="thank-you-divider"></div>
          
          <p class="thank-you-quote">
            "The beautiful thing about learning is that nobody can take it away from you."
          </p>
          <p class="thank-you-quote-author">— B.B. King</p>
          
          <div class="thank-you-footer">
            Submitted By
            <div class="thank-you-student">${assignment.studentName}</div>
          </div>
        </div>
      `;

      const opt = {
        margin: [0, 0, 0, 0] as [number, number, number, number],
        filename: `${assignment.topic.replace(/[^a-zA-Z0-9]/g, '_')}_Assignment.pdf`,
        image: { type: 'jpeg' as const, quality: 1 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
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
    <div className="space-y-8 animate-slide-up">
      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={downloadAsPDF}
          className="hero-button flex items-center gap-3 text-lg px-8 py-5"
        >
          <Download className="w-6 h-6" />
          تحميل PDF
        </button>
        
        <button
          onClick={onReset}
          className="px-6 py-4 rounded-xl border border-border bg-muted/30 text-foreground font-medium hover:bg-muted/50 transition-colors flex items-center gap-3"
        >
          <RotateCcw className="w-5 h-5" />
          أسايمنت جديد
        </button>
      </div>

      {/* Preview Card */}
      <div className="glass-card p-8 max-w-4xl mx-auto">
        <div className="text-center mb-8 pb-6 border-b border-border">
          {assignment.universityLogo && (
            <div className="flex justify-center mb-4">
              <img src={assignment.universityLogo} alt="University Logo" className="w-16 h-16 object-contain rounded-lg" />
            </div>
          )}
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-english" dir="ltr">
            {assignment.topic}
          </h2>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground font-english" dir="ltr">
            <span><strong>Student:</strong> {assignment.studentName}</span>
            <span><strong>ID:</strong> {assignment.studentId}</span>
            <span><strong>College:</strong> {assignment.collegeName}</span>
            {assignment.departmentName && <span><strong>Dept:</strong> {assignment.departmentName}</span>}
            <span><strong>Subject:</strong> {assignment.subjectName}</span>
            {assignment.professorName && <span><strong>Prof:</strong> {assignment.professorName}</span>}
          </div>
        </div>

        {/* Content Preview */}
        <div 
          className="prose prose-invert max-w-none font-english text-foreground/90"
          dir="ltr"
          style={{ textAlign: 'justify' }}
        >
          {assignment.content.split('\n').map((line, index) => {
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

        {/* Images Section */}
        {assignment.images.length > 0 && (
          <div className="mt-12 pt-8 border-t border-border">
            <h3 className="text-xl font-bold text-center mb-6 flex items-center justify-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              <span className="font-english">Visual References</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {assignment.images.map((img, index) => (
                <div key={index} className="rounded-xl overflow-hidden border border-border bg-card/50">
                  <img 
                    src={img} 
                    alt={`Reference ${index + 1}`} 
                    className="w-full h-48 object-cover"
                  />
                  <p className="text-center text-sm text-muted-foreground py-3 font-english">
                    Figure {index + 1}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
