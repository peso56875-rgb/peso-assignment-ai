import { useState } from 'react';
import { User, Hash, BookOpen, GraduationCap, FileText, FileStack, AlertTriangle } from 'lucide-react';
import type { AssignmentData } from '@/pages/Index';

interface AssignmentFormProps {
  onSubmit: (data: AssignmentData) => void;
}

export const AssignmentForm = ({ onSubmit }: AssignmentFormProps) => {
  const [formData, setFormData] = useState<AssignmentData>({
    studentName: '',
    studentId: '',
    subjectName: '',
    professorName: '',
    topic: '',
    pageCount: 3,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'pageCount' ? parseInt(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="glass-card p-8 md:p-12 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
      {/* Warning Banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/10 border border-primary/30 mb-8">
        <AlertTriangle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-primary font-semibold mb-1">تنبيه مهم</p>
          <p className="text-muted-foreground text-sm">
            يرجى كتابة جميع البيانات <span className="text-primary font-bold">بالإنجليزية</span> للحصول على أفضل النتائج
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Student Name */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-foreground font-medium">
              <User className="w-4 h-4 text-primary" />
              اسم الطالب
            </label>
            <input
              type="text"
              name="studentName"
              value={formData.studentName}
              onChange={handleChange}
              placeholder="Enter your name in English"
              className="input-field"
              dir="ltr"
              required
            />
          </div>

          {/* Student ID */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-foreground font-medium">
              <Hash className="w-4 h-4 text-primary" />
              رقم الطالب (ID)
            </label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              placeholder="Enter your student ID"
              className="input-field"
              dir="ltr"
              required
            />
          </div>

          {/* Subject Name */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-foreground font-medium">
              <BookOpen className="w-4 h-4 text-secondary" />
              اسم المادة
            </label>
            <input
              type="text"
              name="subjectName"
              value={formData.subjectName}
              onChange={handleChange}
              placeholder="Enter subject name in English"
              className="input-field"
              dir="ltr"
              required
            />
          </div>

          {/* Professor Name */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-foreground font-medium">
              <GraduationCap className="w-4 h-4 text-secondary" />
              اسم الدكتور
            </label>
            <input
              type="text"
              name="professorName"
              value={formData.professorName}
              onChange={handleChange}
              placeholder="Enter professor name in English"
              className="input-field"
              dir="ltr"
              required
            />
          </div>
        </div>

        {/* Topic */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-foreground font-medium">
            <FileText className="w-4 h-4 text-accent" />
            موضوع الأسايمنت
          </label>
          <textarea
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            placeholder="Enter assignment topic in English (e.g., The Impact of Artificial Intelligence on Modern Education)"
            className="input-field min-h-[100px] resize-none"
            dir="ltr"
            required
          />
        </div>

        {/* Page Count */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-foreground font-medium">
            <FileStack className="w-4 h-4 text-primary" />
            عدد الصفحات
          </label>
          <select
            name="pageCount"
            value={formData.pageCount}
            onChange={handleChange}
            className="input-field"
          >
            {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
              <option key={num} value={num} className="bg-card text-foreground">
                {num} {num === 1 ? 'صفحة' : 'صفحات'}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="hero-button w-full text-lg flex items-center justify-center gap-3"
        >
          <FileText className="w-5 h-5" />
          إنشاء الأسايمنت الآن
        </button>
      </form>
    </div>
  );
};