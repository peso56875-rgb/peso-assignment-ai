import { Download, RotateCcw, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { GeneratedAssignment } from '@/pages/Index';

interface AssignmentResultProps {
  assignment: GeneratedAssignment;
  onReset: () => void;
}

export const AssignmentResult = ({ assignment, onReset }: AssignmentResultProps) => {

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
          
          /* Images Section */
          .images-section {
            page-break-before: always;
            background: #ffffff;
            padding: 50px;
          }
          
          .images-header {
            text-align: center;
            margin-bottom: 40px;
          }
          
          .images-header h2 {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 28px;
            color: #1a365d;
            border: none;
            padding: 0;
            margin: 0 0 10px 0;
          }
          
          .images-header p {
            color: #666;
            font-style: italic;
            text-align: center;
          }
          
          .images-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 25px;
          }
          
          .image-card {
            background: #f8f9fa;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            border: 1px solid #e0e0e0;
          }
          
          .image-card img {
            width: 100%;
            height: 200px;
            object-fit: cover;
          }
          
          .image-card .caption {
            padding: 15px;
            text-align: center;
            color: #666;
            font-size: 12px;
            font-style: italic;
            background: linear-gradient(180deg, #f8f9fa, #ffffff);
          }
          
          /* Footer */
          .pdf-footer {
            page-break-before: always;
            background: linear-gradient(135deg, #0a1628 0%, #1a365d 100%);
            padding: 60px;
            text-align: center;
            min-height: 30vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }
          
          .pdf-footer-divider {
            width: 150px;
            height: 2px;
            background: linear-gradient(90deg, transparent, #D4AF37, transparent);
            margin: 20px auto;
          }
          
          .pdf-footer-text {
            color: rgba(255, 255, 255, 0.7);
            font-size: 14px;
            letter-spacing: 2px;
          }
          
          .pdf-footer-brand {
            color: #D4AF37;
            font-weight: 700;
            font-size: 20px;
            margin-top: 15px;
            letter-spacing: 3px;
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
            <div class="cover-footer-text">Generated by PESO AI Assignment Helper</div>
          </div>
        </div>
        
        <!-- Content Pages -->
        <div class="content-page">
          <div class="content-header">
            <h1>${assignment.topic}</h1>
            <span class="topic-badge">Academic Research</span>
          </div>
          
          ${assignment.content
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
        
        ${assignment.images.length > 0 ? `
        <!-- Images Section -->
        <div class="images-section">
          <div class="images-header">
            <h2>Visual References</h2>
            <p>AI-generated illustrations related to the topic</p>
          </div>
          <div class="images-grid">
            ${assignment.images.map((img, i) => `
              <div class="image-card">
                <img src="${img}" alt="Reference illustration ${i + 1}" />
                <div class="caption">Figure ${i + 1}: Visual representation of key concepts</div>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}
        
        <!-- Footer Page -->
        <div class="pdf-footer">
          <div class="pdf-footer-divider"></div>
          <div class="pdf-footer-text">This document was generated using</div>
          <div class="pdf-footer-brand">PESO AI ASSIGNMENT HELPER</div>
          <div class="pdf-footer-divider"></div>
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
              الصور التوضيحية
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {assignment.images.map((image, index) => (
                <div key={index} className="rounded-xl overflow-hidden border border-border/50 shadow-lg">
                  <img 
                    src={image} 
                    alt={`Reference ${index + 1}`}
                    className="w-full h-auto object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
