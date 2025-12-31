import { useState, useRef } from 'react';
import { User, Hash, BookOpen, GraduationCap, FileText, FileStack, AlertTriangle, Building2, Building, Upload, X } from 'lucide-react';
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
    collegeName: '',
    departmentName: '',
    universityLogo: null,
    topic: '',
    pageCount: 3,
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'pageCount' ? parseInt(value) : value
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFormData(prev => ({ ...prev, universityLogo: base64 }));
        setLogoPreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setFormData(prev => ({ ...prev, universityLogo: null }));
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

          {/* Professor Name - Optional */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-foreground font-medium">
              <GraduationCap className="w-4 h-4 text-secondary" />
              اسم الدكتور
              <span className="text-muted-foreground text-xs">(اختياري)</span>
            </label>
            <input
              type="text"
              name="professorName"
              value={formData.professorName}
              onChange={handleChange}
              placeholder="Enter professor name in English"
              className="input-field"
              dir="ltr"
            />
          </div>

          {/* College Name */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-foreground font-medium">
              <Building2 className="w-4 h-4 text-accent" />
              اسم الكلية
            </label>
            <input
              type="text"
              name="collegeName"
              value={formData.collegeName}
              onChange={handleChange}
              placeholder="Enter college name in English"
              className="input-field"
              dir="ltr"
              required
            />
          </div>

          {/* Department Name - Optional */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-foreground font-medium">
              <Building className="w-4 h-4 text-accent" />
              اسم القسم
              <span className="text-muted-foreground text-xs">(اختياري)</span>
            </label>
            <input
              type="text"
              name="departmentName"
              value={formData.departmentName}
              onChange={handleChange}
              placeholder="Enter department name in English"
              className="input-field"
              dir="ltr"
            />
          </div>
        </div>

        {/* University Logo Upload - Optional */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-foreground font-medium">
            <Upload className="w-4 h-4 text-primary" />
            لوجو الجامعة
            <span className="text-muted-foreground text-xs">(اختياري)</span>
          </label>
          
          {logoPreview ? (
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border">
              <img src={logoPreview} alt="University Logo" className="w-16 h-16 object-contain rounded-lg" />
              <span className="text-sm text-muted-foreground flex-1">تم رفع اللوجو بنجاح</span>
              <button
                type="button"
                onClick={removeLogo}
                className="p-2 rounded-lg bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="input-field cursor-pointer flex items-center justify-center gap-3 py-6 border-dashed hover:border-primary/50 transition-colors"
            >
              <Upload className="w-5 h-5 text-muted-foreground" />
              <span className="text-muted-foreground">اضغط لرفع لوجو الجامعة</span>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
          />
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
