import { useState } from 'react';
import { AssignmentForm } from '@/components/AssignmentForm';
import { AssignmentResult } from '@/components/AssignmentResult';
import { LoadingState } from '@/components/LoadingState';
import { Hero } from '@/components/Hero';
import { Footer } from '@/components/Footer';
import { UserMenu } from '@/components/UserMenu';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface AssignmentData {
  studentName: string;
  studentId: string;
  subjectName: string;
  professorName: string;
  collegeName: string;
  departmentName: string;
  universityLogo: string | null;
  topic: string;
  pageCount: number;
}

export interface GeneratedAssignment {
  content: string;
  images: string[];
  studentName: string;
  studentId: string;
  subjectName: string;
  professorName: string;
  collegeName: string;
  departmentName: string;
  universityLogo: string | null;
  topic: string;
}

const Index = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [generatedAssignment, setGeneratedAssignment] = useState<GeneratedAssignment | null>(null);

  const handleSubmit = async (data: AssignmentData) => {
    setIsLoading(true);
    setGeneratedAssignment(null);

    try {
      // Step 1: Generate content
      setLoadingStep('جاري البحث وكتابة المحتوى...');
      
      const { data: contentData, error: contentError } = await supabase.functions.invoke('generate-assignment', {
        body: data
      });

      if (contentError) {
        throw new Error(contentError.message || 'Failed to generate content');
      }

      if (contentData?.error) {
        throw new Error(contentData.error);
      }

      // Step 2: Generate images (3-4 based on topic complexity)
      setLoadingStep('جاري توليد الصور...');
      
      const imageCount = data.pageCount >= 6 ? 4 : 3;
      
      const { data: imageData, error: imageError } = await supabase.functions.invoke('generate-images', {
        body: { topic: data.topic, count: imageCount }
      });

      const images = imageData?.images || [];
      
      if (imageError) {
        console.warn('Image generation warning:', imageError);
      }

      setGeneratedAssignment({
        content: contentData.content,
        images: images,
        studentName: data.studentName,
        studentId: data.studentId,
        subjectName: data.subjectName,
        professorName: data.professorName,
        collegeName: data.collegeName,
        departmentName: data.departmentName,
        universityLogo: data.universityLogo,
        topic: data.topic
      });

      // Save to history
      if (user) {
        await supabase.from('assignment_history').insert({
          user_id: user.id,
          student_name: data.studentName,
          student_id: data.studentId,
          subject_name: data.subjectName,
          professor_name: data.professorName,
          college_name: data.collegeName,
          department_name: data.departmentName,
          university_logo: data.universityLogo,
          topic: data.topic,
          content: contentData.content,
          images: images
        });
      }

      toast.success('تم إنشاء الأسايمنت بنجاح! 🎉');

    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء إنشاء الأسايمنت');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleReset = () => {
    setGeneratedAssignment(null);
  };

  return (
    <main className="min-h-screen flex flex-col">
      <UserMenu />
      <div className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <Hero />
        
        {isLoading ? (
          <LoadingState step={loadingStep} />
        ) : generatedAssignment ? (
          <AssignmentResult 
            assignment={generatedAssignment} 
            onReset={handleReset}
          />
        ) : (
          <AssignmentForm onSubmit={handleSubmit} />
        )}
      </div>
      
      <Footer />
    </main>
  );
};

export default Index;
