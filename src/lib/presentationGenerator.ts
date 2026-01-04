import pptxgen from 'pptxgenjs';

interface Slide {
  title: string;
  points: string[];
  imageUrl?: string;
}

interface PresentationContent {
  title: string;
  slides: Slide[];
}

interface TeamMember {
  name: string;
  id: string;
}

export type DesignTemplate = 'professional' | 'academic' | 'creative';

interface PresentationData {
  teamMembers: TeamMember[];
  subjectName: string;
  professorName?: string;
  collegeName: string;
  departmentName?: string;
  universityLogo?: string;
  topic: string;
  content: PresentationContent;
  template: DesignTemplate;
}

// Design templates with stunning color schemes
const templates = {
  professional: {
    name: 'Professional',
    primary: '1e3a5f',
    secondary: '2dd4bf',
    accent: 'f59e0b',
    background: 'ffffff',
    darkBg: '0f172a',
    textLight: 'ffffff',
    textDark: '1e293b',
    bulletColor: '2dd4bf',
  },
  academic: {
    name: 'Academic',
    primary: '7c3aed',
    secondary: 'ec4899',
    accent: '06b6d4',
    background: 'ffffff',
    darkBg: '2e1065',
    textLight: 'ffffff',
    textDark: '1e1b4b',
    bulletColor: 'ec4899',
  },
  creative: {
    name: 'Creative',
    primary: 'f97316',
    secondary: '14b8a6',
    accent: 'a855f7',
    background: 'ffffff',
    darkBg: '431407',
    textLight: 'ffffff',
    textDark: '292524',
    bulletColor: '14b8a6',
  },
};

// Helper function to truncate text
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

export const generatePowerPoint = async (data: PresentationData): Promise<void> => {
  const pptx = new pptxgen();
  const template = templates[data.template];

  // Set presentation properties
  pptx.author = data.teamMembers.map(m => m.name).join(', ');
  pptx.title = data.content.title || data.topic;
  pptx.subject = data.subjectName;
  pptx.company = data.collegeName;
  pptx.layout = 'LAYOUT_WIDE'; // 13.33" x 7.5"

  // ==================== TITLE SLIDE ====================
  const titleSlide = pptx.addSlide();
  
  // Full background
  titleSlide.addShape('rect', {
    x: 0, y: 0, w: '100%', h: '100%',
    fill: { color: template.darkBg },
  });

  // Left accent panel
  titleSlide.addShape('rect', {
    x: 0, y: 0, w: 0.4, h: '100%',
    fill: { color: template.secondary },
  });

  // Bottom accent line
  titleSlide.addShape('rect', {
    x: 0.4, y: 6.8, w: 13, h: 0.7,
    fill: { color: template.primary },
  });

  // Add university logo if available
  if (data.universityLogo) {
    try {
      titleSlide.addImage({
        path: data.universityLogo,
        x: 11.5, y: 0.4, w: 1.5, h: 1.5,
      });
    } catch (e) {
      console.log('Could not add logo:', e);
    }
  }

  // Main title
  titleSlide.addText(data.content.title || data.topic, {
    x: 1, y: 2, w: 11, h: 1.5,
    fontSize: 44, bold: true, color: template.textLight,
    fontFace: 'Arial',
  });

  // Accent line under title
  titleSlide.addShape('rect', {
    x: 1, y: 3.6, w: 4, h: 0.08,
    fill: { color: template.secondary },
  });

  // Team members
  const teamNames = data.teamMembers.map(m => m.name).join('  |  ');
  const teamIds = data.teamMembers.map(m => m.id).join('  |  ');

  titleSlide.addText(teamNames, {
    x: 1, y: 4, w: 11, h: 0.5,
    fontSize: 18, bold: true, color: template.textLight,
    fontFace: 'Arial',
  });

  titleSlide.addText(teamIds, {
    x: 1, y: 4.5, w: 11, h: 0.4,
    fontSize: 14, color: 'a0a0a0',
    fontFace: 'Arial',
  });

  // College info
  const collegeInfo = data.departmentName 
    ? `${data.collegeName}  •  ${data.departmentName}` 
    : data.collegeName;

  titleSlide.addText(collegeInfo, {
    x: 1, y: 5.2, w: 11, h: 0.4,
    fontSize: 14, color: template.secondary,
    fontFace: 'Arial',
  });

  // Subject info
  const subjectInfo = data.professorName 
    ? `${data.subjectName}  •  Prof. ${data.professorName}`
    : data.subjectName;

  titleSlide.addText(subjectInfo, {
    x: 1, y: 5.6, w: 11, h: 0.3,
    fontSize: 12, color: '808080',
    fontFace: 'Arial',
  });

  // ==================== TABLE OF CONTENTS ====================
  const tocSlide = pptx.addSlide();
  tocSlide.bkgd = template.background;

  // Header bar
  tocSlide.addShape('rect', {
    x: 0, y: 0, w: '100%', h: 1.2,
    fill: { color: template.primary },
  });

  // Header accent
  tocSlide.addShape('rect', {
    x: 0, y: 1.2, w: '100%', h: 0.08,
    fill: { color: template.secondary },
  });

  tocSlide.addText('Table of Contents', {
    x: 0.5, y: 0.3, w: 12, h: 0.8,
    fontSize: 32, bold: true, color: template.textLight,
    fontFace: 'Arial',
  });

  // TOC items - two columns
  const leftItems = data.content.slides.slice(0, Math.ceil(data.content.slides.length / 2));
  const rightItems = data.content.slides.slice(Math.ceil(data.content.slides.length / 2));

  leftItems.forEach((slide, idx) => {
    const yPos = 1.6 + (idx * 0.6);
    tocSlide.addText(`${String(idx + 1).padStart(2, '0')}`, {
      x: 0.5, y: yPos, w: 0.6, h: 0.5,
      fontSize: 16, bold: true, color: template.secondary,
      fontFace: 'Arial',
    });
    tocSlide.addText(truncateText(slide.title, 35), {
      x: 1.2, y: yPos, w: 5, h: 0.5,
      fontSize: 14, color: template.textDark,
      fontFace: 'Arial',
    });
  });

  rightItems.forEach((slide, idx) => {
    const actualIdx = idx + leftItems.length;
    const yPos = 1.6 + (idx * 0.6);
    tocSlide.addText(`${String(actualIdx + 1).padStart(2, '0')}`, {
      x: 7, y: yPos, w: 0.6, h: 0.5,
      fontSize: 16, bold: true, color: template.secondary,
      fontFace: 'Arial',
    });
    tocSlide.addText(truncateText(slide.title, 35), {
      x: 7.7, y: yPos, w: 5, h: 0.5,
      fontSize: 14, color: template.textDark,
      fontFace: 'Arial',
    });
  });

  // ==================== CONTENT SLIDES ====================
  for (let index = 0; index < data.content.slides.length; index++) {
    const slideData = data.content.slides[index];
    const slide = pptx.addSlide();
    slide.bkgd = template.background;

    // Header bar
    slide.addShape('rect', {
      x: 0, y: 0, w: '100%', h: 1.2,
      fill: { color: template.primary },
    });

    // Header accent line
    slide.addShape('rect', {
      x: 0, y: 1.2, w: '100%', h: 0.08,
      fill: { color: template.secondary },
    });

    // Slide number
    slide.addShape('rect', {
      x: 12.2, y: 0.2, w: 0.8, h: 0.8,
      fill: { color: template.accent },
    });

    slide.addText(`${index + 1}`, {
      x: 12.2, y: 0.2, w: 0.8, h: 0.8,
      fontSize: 18, bold: true, color: template.textLight,
      align: 'center', valign: 'middle',
      fontFace: 'Arial',
    });

    // Slide title
    slide.addText(truncateText(slideData.title, 60), {
      x: 0.5, y: 0.3, w: 11, h: 0.8,
      fontSize: 26, bold: true, color: template.textLight,
      fontFace: 'Arial',
    });

    // Check for image
    const hasImage = slideData.imageUrl && slideData.imageUrl.startsWith('data:');
    const contentWidth = hasImage ? 7.5 : 12;

    // Content points - properly formatted bullets
    const limitedPoints = slideData.points.slice(0, 5); // Max 5 points per slide
    
    limitedPoints.forEach((point, pIdx) => {
      const yPos = 1.6 + (pIdx * 0.85);
      const truncatedPoint = truncateText(point, hasImage ? 80 : 120);
      
      // Bullet point circle
      slide.addShape('rect', {
        x: 0.6, y: yPos + 0.15, w: 0.18, h: 0.18,
        fill: { color: template.bulletColor },
      });

      // Point text
      slide.addText(truncatedPoint, {
        x: 1, y: yPos, w: contentWidth - 0.5, h: 0.8,
        fontSize: 15, color: template.textDark,
        fontFace: 'Arial',
        valign: 'top',
      });
    });

    // Add image if available
    if (hasImage && slideData.imageUrl) {
      try {
        // Image container background
        slide.addShape('rect', {
          x: 8.2, y: 1.5, w: 4.6, h: 3.8,
          fill: { color: 'f0f0f0' },
          line: { color: template.secondary, width: 2 },
        });

        slide.addImage({
          data: slideData.imageUrl,
          x: 8.3, y: 1.6, w: 4.4, h: 3.6,
        });
      } catch (e) {
        console.log('Could not add slide image:', e);
      }
    }

    // Bottom bar
    slide.addShape('rect', {
      x: 0, y: 7, w: '100%', h: 0.5,
      fill: { color: template.primary },
    });

    // Footer text
    slide.addText(truncateText(data.content.title || data.topic, 50), {
      x: 0.5, y: 7.05, w: 10, h: 0.4,
      fontSize: 10, color: 'a0a0a0',
      fontFace: 'Arial',
    });

    slide.addText(`${index + 1} / ${data.content.slides.length}`, {
      x: 11.5, y: 7.05, w: 1.5, h: 0.4,
      fontSize: 10, color: 'a0a0a0', align: 'right',
      fontFace: 'Arial',
    });
  }

  // ==================== SUMMARY SLIDE ====================
  const summarySlide = pptx.addSlide();
  summarySlide.bkgd = template.background;

  // Header
  summarySlide.addShape('rect', {
    x: 0, y: 0, w: '100%', h: 1.2,
    fill: { color: template.primary },
  });

  summarySlide.addShape('rect', {
    x: 0, y: 1.2, w: '100%', h: 0.08,
    fill: { color: template.secondary },
  });

  summarySlide.addText('Key Takeaways', {
    x: 0.5, y: 0.3, w: 12, h: 0.8,
    fontSize: 32, bold: true, color: template.textLight,
    fontFace: 'Arial',
  });

  // Summary points
  const keySlides = data.content.slides.slice(0, 6);
  keySlides.forEach((s, idx) => {
    const yPos = 1.6 + (idx * 0.8);
    
    // Number
    summarySlide.addText(`${idx + 1}`, {
      x: 0.5, y: yPos, w: 0.5, h: 0.5,
      fontSize: 16, bold: true, color: template.accent,
      fontFace: 'Arial',
    });

    // Title and first point
    summarySlide.addText(truncateText(s.title, 40), {
      x: 1.1, y: yPos, w: 11, h: 0.4,
      fontSize: 14, bold: true, color: template.textDark,
      fontFace: 'Arial',
    });

    summarySlide.addText(truncateText(s.points[0] || '', 80), {
      x: 1.1, y: yPos + 0.35, w: 11, h: 0.4,
      fontSize: 12, color: '666666',
      fontFace: 'Arial',
    });
  });

  // ==================== THANK YOU SLIDE ====================
  const thanksSlide = pptx.addSlide();
  
  // Background
  thanksSlide.addShape('rect', {
    x: 0, y: 0, w: '100%', h: '100%',
    fill: { color: template.darkBg },
  });

  // Left accent
  thanksSlide.addShape('rect', {
    x: 0, y: 0, w: 0.4, h: '100%',
    fill: { color: template.secondary },
  });

  // Decorative square
  thanksSlide.addShape('rect', {
    x: 10, y: 4.5, w: 4, h: 4,
    fill: { color: template.primary },
  });

  // Thank you text
  thanksSlide.addText('Thank You!', {
    x: 1, y: 2, w: 10, h: 1.2,
    fontSize: 54, bold: true, color: template.textLight,
    fontFace: 'Arial',
  });

  // Accent line
  thanksSlide.addShape('rect', {
    x: 1, y: 3.3, w: 3, h: 0.08,
    fill: { color: template.secondary },
  });

  thanksSlide.addText('Questions & Discussion', {
    x: 1, y: 3.6, w: 10, h: 0.7,
    fontSize: 22, color: template.secondary,
    fontFace: 'Arial',
  });

  // Team info
  const teamFinal = data.teamMembers.map(m => `${m.name} (${m.id})`).join('  •  ');
  
  thanksSlide.addText(teamFinal, {
    x: 1, y: 5, w: 10, h: 0.5,
    fontSize: 13, color: 'b0b0b0',
    fontFace: 'Arial',
  });

  thanksSlide.addText(`${data.collegeName}  |  ${data.subjectName}`, {
    x: 1, y: 5.5, w: 10, h: 0.4,
    fontSize: 11, color: '808080',
    fontFace: 'Arial',
  });

  // Generate and download
  const fileName = `${data.topic.replace(/[^a-zA-Z0-9]/g, '_')}_presentation.pptx`;
  await pptx.writeFile({ fileName });
};
