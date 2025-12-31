import { Download, FileText, RotateCcw, Image as ImageIcon } from 'lucide-react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, ImageRun } from 'docx';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';
import type { GeneratedAssignment } from '@/pages/Index';

interface AssignmentResultProps {
  assignment: GeneratedAssignment;
  onReset: () => void;
}

export const AssignmentResult = ({ assignment, onReset }: AssignmentResultProps) => {
  
  const parseContentToSections = (content: string) => {
    const lines = content.split('\n');
    const sections: { type: 'h1' | 'h2' | 'h3' | 'paragraph'; text: string }[] = [];
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;
      
      if (trimmed.startsWith('### ')) {
        sections.push({ type: 'h3', text: trimmed.replace('### ', '') });
      } else if (trimmed.startsWith('## ')) {
        sections.push({ type: 'h2', text: trimmed.replace('## ', '') });
      } else if (trimmed.startsWith('# ')) {
        sections.push({ type: 'h1', text: trimmed.replace('# ', '') });
      } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
        sections.push({ type: 'h3', text: trimmed.replace(/\*\*/g, '') });
      } else {
        sections.push({ type: 'paragraph', text: trimmed.replace(/\*\*/g, '').replace(/\*/g, '') });
      }
    });
    
    return sections;
  };

  const downloadAsWord = async () => {
    try {
      toast.loading('جاري إنشاء ملف Word...', { id: 'word-download' });
      
      const sections = parseContentToSections(assignment.content);
      
      const children: (Paragraph)[] = [];
      
      // Title Page
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: assignment.topic.toUpperCase(),
              bold: true,
              size: 56,
              color: "1E3A5F",
              font: "Georgia",
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 },
        })
      );

      // Decorative Line
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
              color: "D4AF37",
              size: 24,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        })
      );

      // Student Info Box
      const infoItems = [
        { label: 'Student Name:', value: assignment.studentName },
        { label: 'Student ID:', value: assignment.studentId },
        { label: 'Subject:', value: assignment.subjectName },
        { label: 'Professor:', value: assignment.professorName },
      ];

      infoItems.forEach(item => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: item.label + ' ',
                bold: true,
                size: 24,
                color: "1E3A5F",
                font: "Arial",
              }),
              new TextRun({
                text: item.value,
                size: 24,
                color: "333333",
                font: "Arial",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
          })
        );
      });

      // Page break before content
      children.push(
        new Paragraph({
          children: [],
          pageBreakBefore: true,
        })
      );

      // Content sections
      sections.forEach(section => {
        if (section.type === 'h1') {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: section.text,
                  bold: true,
                  size: 44,
                  color: "1E3A5F",
                  font: "Georgia",
                }),
              ],
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400, after: 200 },
              border: {
                bottom: {
                  color: "D4AF37",
                  size: 12,
                  style: BorderStyle.SINGLE,
                },
              },
            })
          );
        } else if (section.type === 'h2') {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: section.text,
                  bold: true,
                  size: 32,
                  color: "2E5984",
                  font: "Georgia",
                }),
              ],
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 300, after: 150 },
            })
          );
        } else if (section.type === 'h3') {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: section.text,
                  bold: true,
                  size: 26,
                  color: "3D7BA8",
                  font: "Arial",
                }),
              ],
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 200, after: 100 },
            })
          );
        } else {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: section.text,
                  size: 24,
                  color: "333333",
                  font: "Arial",
                }),
              ],
              spacing: { after: 200, line: 360 },
              alignment: AlignmentType.JUSTIFIED,
            })
          );
        }
      });

      // Add images if available
      if (assignment.images.length > 0) {
        children.push(
          new Paragraph({
            children: [],
            pageBreakBefore: true,
          })
        );
        
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "Visual References",
                bold: true,
                size: 36,
                color: "1E3A5F",
                font: "Georgia",
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 300 },
            alignment: AlignmentType.CENTER,
          })
        );

        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "(AI-generated images related to the topic are included in the PDF version)",
                size: 22,
                italics: true,
                color: "666666",
                font: "Arial",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          })
        );
      }

      // Footer
      children.push(
        new Paragraph({
          children: [],
          spacing: { before: 600 },
        })
      );
      
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
              color: "D4AF37",
              size: 24,
            }),
          ],
          alignment: AlignmentType.CENTER,
        })
      );

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Generated by PESO Assignment Helper",
              size: 20,
              italics: true,
              color: "888888",
              font: "Arial",
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 200 },
        })
      );

      const doc = new Document({
        sections: [{
          properties: {},
          children: children,
        }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${assignment.topic.replace(/[^a-zA-Z0-9]/g, '_')}_Assignment.docx`);
      
      toast.success('تم تحميل ملف Word بنجاح!', { id: 'word-download' });
    } catch (error) {
      console.error('Error creating Word document:', error);
      toast.error('حدث خطأ أثناء إنشاء الملف', { id: 'word-download' });
    }
  };

  const downloadAsPDF = async () => {
    try {
      toast.loading('جاري إنشاء ملف PDF...', { id: 'pdf-download' });
      
      const html2pdf = (await import('html2pdf.js')).default;
      
      const element = document.createElement('div');
      element.innerHTML = `
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
          * { font-family: 'Poppins', Arial, sans-serif; }
          h1, h2, h3 { color: #1E3A5F; }
          h1 { font-size: 28px; border-bottom: 3px solid #D4AF37; padding-bottom: 10px; margin-bottom: 20px; }
          h2 { font-size: 22px; color: #2E5984; margin-top: 25px; }
          h3 { font-size: 18px; color: #3D7BA8; }
          p { line-height: 1.8; color: #333; text-align: justify; margin-bottom: 12px; }
          .header { text-align: center; margin-bottom: 40px; padding: 30px; background: linear-gradient(135deg, #1E3A5F 0%, #2E5984 100%); color: white; border-radius: 10px; }
          .header h1 { color: white; border-bottom: 3px solid #D4AF37; display: inline-block; padding-bottom: 10px; }
          .info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #D4AF37; }
          .info-item { margin: 8px 0; }
          .info-label { font-weight: 600; color: #1E3A5F; }
          .content { padding: 20px 0; }
          .images { page-break-before: always; text-align: center; padding: 20px; }
          .images h2 { text-align: center; margin-bottom: 20px; }
          .images img { max-width: 100%; height: auto; margin: 20px 0; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #D4AF37; color: #888; font-style: italic; }
        </style>
        
        <div class="header">
          <h1>${assignment.topic}</h1>
        </div>
        
        <div class="info">
          <div class="info-item"><span class="info-label">Student Name:</span> ${assignment.studentName}</div>
          <div class="info-item"><span class="info-label">Student ID:</span> ${assignment.studentId}</div>
          <div class="info-item"><span class="info-label">Subject:</span> ${assignment.subjectName}</div>
          <div class="info-item"><span class="info-label">Professor:</span> ${assignment.professorName}</div>
        </div>
        
        <div class="content">
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
          <div class="images">
            <h2>Visual References</h2>
            ${assignment.images.map((img, i) => `<img src="${img}" alt="Reference image ${i + 1}" />`).join('')}
          </div>
        ` : ''}
        
        <div class="footer">
          Generated by PESO Assignment Helper
        </div>
      `;

      const opt = {
        margin: [15, 15, 15, 15] as [number, number, number, number],
        filename: `${assignment.topic.replace(/[^a-zA-Z0-9]/g, '_')}_Assignment.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
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
    <div className="space-y-8 animate-slide-up">
      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={downloadAsWord}
          className="hero-button flex items-center gap-3"
        >
          <FileText className="w-5 h-5" />
          تحميل Word
        </button>
        
        <button
          onClick={downloadAsPDF}
          className="secondary-button flex items-center gap-3"
        >
          <Download className="w-5 h-5" />
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
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-english" dir="ltr">
            {assignment.topic}
          </h2>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground font-english" dir="ltr">
            <span><strong>Student:</strong> {assignment.studentName}</span>
            <span><strong>ID:</strong> {assignment.studentId}</span>
            <span><strong>Subject:</strong> {assignment.subjectName}</span>
            <span><strong>Professor:</strong> {assignment.professorName}</span>
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