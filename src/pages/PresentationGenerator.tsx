import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Presentation, FileText, HelpCircle, ArrowLeft, Download, Loader2, Plus, X, Palette, Sparkles, Users } from 'lucide-react';
import { UserMenu } from '@/components/UserMenu';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { generatePowerPoint, DesignTemplate } from '@/lib/presentationGenerator';
import { cn } from '@/lib/utils';

interface PresentationContent {
  title: string;
  slides: Array<{
    title: string;
    points: string[];
    imageUrl?: string;
  }>;
}

interface TeamMember {
  name: string;
  id: string;
}

const designTemplates: { id: DesignTemplate; name: string; nameAr: string; description: string; colors: string[] }[] = [
  {
    id: 'professional',
    name: 'Professional',
    nameAr: 'احترافي',
    description: 'Clean & modern design perfect for business presentations',
    colors: ['#1e3a5f', '#2dd4bf', '#f59e0b'],
  },
  {
    id: 'academic',
    name: 'Academic',
    nameAr: 'أكاديمي',
    description: 'Elegant purple theme ideal for educational content',
    colors: ['#7c3aed', '#ec4899', '#06b6d4'],
  },
  {
    id: 'creative',
    name: 'Creative',
    nameAr: 'إبداعي',
    description: 'Bold & vibrant design for impactful presentations',
    colors: ['#f97316', '#14b8a6', '#a855f7'],
  },
];

const PresentationGenerator = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [generatedContent, setGeneratedContent] = useState<PresentationContent | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<DesignTemplate>('professional');
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([{ name: '', id: '' }]);
  const [formData, setFormData] = useState({
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

  const handleTeamMemberChange = (index: number, field: 'name' | 'id', value: string) => {
    setTeamMembers(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addTeamMember = () => {
    if (teamMembers.length < 6) {
      setTeamMembers(prev => [...prev, { name: '', id: '' }]);
    }
  };

  const removeTeamMember = (index: number) => {
    if (teamMembers.length > 1) {
      setTeamMembers(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validMembers = teamMembers.filter(m => m.name.trim() && m.id.trim());
    if (validMembers.length === 0) {
      toast.error('Please add at least one team member with name and ID');
      return;
    }

    if (!formData.topic || !formData.collegeName || !formData.subjectName) {
      toast.error('Please fill all required fields');
      return;
    }

    if (formData.slidesCount < 5 || formData.slidesCount > 20) {
      toast.error('Number of slides must be between 5 and 20');
      return;
    }

    setIsLoading(true);
    setLoadingProgress(0);

    try {
      // Step 1: Generate content
      setLoadingStep('Generating presentation content with AI...');
      setLoadingProgress(10);

      const { data, error } = await supabase.functions.invoke('generate-presentation', {
        body: {
          topic: formData.topic,
          slidesCount: formData.slidesCount,
          studentName: validMembers.map(m => m.name).join(', '),
          subjectName: formData.subjectName,
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to generate content');

      setLoadingProgress(40);
      setLoadingStep('Generating AI images for slides...');

      // Step 2: Generate images for slides
      let slidesWithImages = data.content.slides;
      
      try {
        const { data: imageData, error: imageError } = await supabase.functions.invoke('generate-images', {
          body: {
            topic: formData.topic,
            count: Math.min(formData.slidesCount, 4),
          }
        });

        if (!imageError && imageData?.images?.length > 0) {
          slidesWithImages = data.content.slides.map((slide: any, index: number) => ({
            ...slide,
            imageUrl: imageData.images[index % imageData.images.length] || undefined,
          }));
        }
      } catch (imgError) {
        console.log('Image generation skipped:', imgError);
      }

      setLoadingProgress(80);
      const contentWithImages = { ...data.content, slides: slidesWithImages };
      setGeneratedContent(contentWithImages);

      // Save to history
      if (user) {
        setLoadingStep('Saving to history...');
        const { error: historyError } = await supabase.from('presentation_history').insert({
          user_id: user.id,
          student_name: validMembers.map(m => m.name).join(', '),
          student_id: validMembers.map(m => m.id).join(', '),
          subject_name: formData.subjectName,
          professor_name: formData.professorName || null,
          college_name: formData.collegeName,
          department_name: formData.departmentName || null,
          university_logo: formData.universityLogo || null,
          topic: formData.topic,
          slides_count: formData.slidesCount,
          content: contentWithImages,
        });

        if (historyError) {
          console.error('Error saving to history:', historyError);
        }
      }

      setLoadingProgress(100);
      toast.success('Presentation generated successfully! 🎉');
    } catch (error: any) {
      console.error('Error generating presentation:', error);
      toast.error(error.message || 'Error generating presentation');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
      setLoadingProgress(0);
    }
  };

  const handleDownload = async () => {
    if (!generatedContent) return;

    const validMembers = teamMembers.filter(m => m.name.trim() && m.id.trim());

    setIsLoading(true);
    setLoadingStep('Creating PowerPoint file...');

    try {
      await generatePowerPoint({
        teamMembers: validMembers,
        subjectName: formData.subjectName,
        professorName: formData.professorName,
        collegeName: formData.collegeName,
        departmentName: formData.departmentName,
        universityLogo: formData.universityLogo,
        topic: formData.topic,
        content: generatedContent,
        template: selectedTemplate,
      });

      toast.success('Presentation downloaded successfully!');
    } catch (error: any) {
      console.error('Error downloading presentation:', error);
      toast.error('Error downloading presentation');
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

      <main className="relative z-10 container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <header className="text-center mb-12 animate-slide-up">
          <div className="flex justify-center mb-6">
            <img src="/peso-logo.png" alt="PESO AI Logo" className="w-24 h-24 md:w-32 md:h-32 object-contain" />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-6">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="text-sm text-secondary font-medium">AI-Powered Presentations</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-primary">PESO</span>{' '}
            <span className="text-foreground">Presentation Maker</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Create stunning PowerPoint presentations with AI-generated content and images
          </p>

          {/* Navigation */}
          <div className="flex justify-center gap-4 mb-8 flex-wrap">
            <Link to="/" className="px-6 py-3 rounded-xl border border-border bg-muted/30 text-foreground font-medium hover:bg-muted/50 transition-colors flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Assignment
            </Link>
            <Link to="/quiz-solver" className="px-6 py-3 rounded-xl border border-border bg-muted/30 text-foreground font-medium hover:bg-muted/50 transition-colors flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Quiz Solver
            </Link>
            <span className="px-6 py-3 rounded-xl bg-secondary/20 text-secondary font-medium border border-secondary/30 flex items-center gap-2">
              <Presentation className="w-4 h-4" />
              Presentation
            </span>
          </div>
        </header>

        {/* Main Content */}
        {isLoading ? (
          <div className="glass-card p-12 text-center animate-fade-in">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
              <div 
                className="absolute inset-0 rounded-full border-4 border-secondary border-t-transparent animate-spin"
                style={{ animationDuration: '1s' }}
              ></div>
              <Sparkles className="w-8 h-8 text-secondary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Creating Your Presentation...</h2>
            <p className="text-muted-foreground mb-4">{loadingStep}</p>
            <div className="w-full max-w-md mx-auto bg-muted rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-secondary to-primary transition-all duration-500"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{loadingProgress}%</p>
          </div>
        ) : generatedContent ? (
          <div className="glass-card p-8 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-secondary" />
                Presentation Ready!
              </h2>
              <Button variant="outline" onClick={handleReset} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                New Presentation
              </Button>
            </div>

            {/* Template Selection for Download */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Select Design Template
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {designTemplates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setSelectedTemplate(template.id)}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all text-left",
                      selectedTemplate === template.id
                        ? "border-secondary bg-secondary/10"
                        : "border-border hover:border-muted-foreground/50"
                    )}
                  >
                    <div className="flex gap-1 mb-3">
                      {template.colors.map((color, idx) => (
                        <div
                          key={idx}
                          className="w-6 h-6 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <h4 className="font-bold text-foreground">{template.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="bg-muted/30 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-primary mb-4">{generatedContent.title}</h3>
              <p className="text-muted-foreground mb-4">
                Total Slides: {generatedContent.slides.length + 3} (including Title, Table of Contents, Summary & Thank You)
              </p>
              
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {generatedContent.slides.map((slide, index) => (
                  <div key={index} className="bg-background/50 rounded-lg p-4 flex gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-2">
                        Slide {index + 1}: {slide.title}
                      </h4>
                      <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
                        {slide.points.slice(0, 3).map((point, pIndex) => (
                          <li key={pIndex}>{point}</li>
                        ))}
                        {slide.points.length > 3 && (
                          <li className="text-muted-foreground/60">+{slide.points.length - 3} more points</li>
                        )}
                      </ul>
                    </div>
                    {slide.imageUrl && (
                      <div className="w-24 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img src={slide.imageUrl} alt="Slide visual" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={handleDownload} className="w-full gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground">
              <Download className="w-5 h-5" />
              Download PowerPoint ({designTemplates.find(t => t.id === selectedTemplate)?.name} Template)
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-card p-8 animate-fade-in">
            {/* Team Members Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Members
              </h3>
              
              <div className="space-y-3">
                {teamMembers.map((member, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`name-${index}`} className="text-xs">Name *</Label>
                        <Input
                          id={`name-${index}`}
                          value={member.name}
                          onChange={(e) => handleTeamMemberChange(index, 'name', e.target.value)}
                          placeholder="Full Name"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`id-${index}`} className="text-xs">Student ID *</Label>
                        <Input
                          id={`id-${index}`}
                          value={member.id}
                          onChange={(e) => handleTeamMemberChange(index, 'id', e.target.value)}
                          placeholder="e.g., 2024001234"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    {teamMembers.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTeamMember(index)}
                        className="mt-6 text-destructive hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {teamMembers.length < 6 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTeamMember}
                  className="mt-3 gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Team Member
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Institution Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Institution Details</h3>
                
                <div>
                  <Label htmlFor="collegeName">College/University *</Label>
                  <Input
                    id="collegeName"
                    name="collegeName"
                    value={formData.collegeName}
                    onChange={handleChange}
                    placeholder="e.g., Faculty of Engineering"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="departmentName">Department (Optional)</Label>
                  <Input
                    id="departmentName"
                    name="departmentName"
                    value={formData.departmentName}
                    onChange={handleChange}
                    placeholder="e.g., Computer Science Department"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="universityLogo">University Logo URL (Optional)</Label>
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

              {/* Presentation Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Presentation Details</h3>

                <div>
                  <Label htmlFor="subjectName">Subject/Course *</Label>
                  <Input
                    id="subjectName"
                    name="subjectName"
                    value={formData.subjectName}
                    onChange={handleChange}
                    placeholder="e.g., Artificial Intelligence"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="professorName">Professor Name (Optional)</Label>
                  <Input
                    id="professorName"
                    name="professorName"
                    value={formData.professorName}
                    onChange={handleChange}
                    placeholder="e.g., Dr. John Smith"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="topic">Presentation Topic *</Label>
                  <Input
                    id="topic"
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    placeholder="e.g., Machine Learning Applications"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="slidesCount">Number of Slides (5-20) *</Label>
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
              </div>
            </div>

            {/* Template Selection */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2 mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Design Template
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {designTemplates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setSelectedTemplate(template.id)}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all text-left",
                      selectedTemplate === template.id
                        ? "border-secondary bg-secondary/10 shadow-lg"
                        : "border-border hover:border-muted-foreground/50"
                    )}
                  >
                    <div className="flex gap-1 mb-3">
                      {template.colors.map((color, idx) => (
                        <div
                          key={idx}
                          className="w-8 h-8 rounded-full shadow-md"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <h4 className="font-bold text-foreground">{template.name}</h4>
                    <p className="text-sm text-muted-foreground">{template.nameAr}</p>
                    <p className="text-xs text-muted-foreground mt-2">{template.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full mt-8 gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground h-12 text-lg">
              <Sparkles className="w-5 h-5" />
              Generate Stunning Presentation
            </Button>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default PresentationGenerator;
