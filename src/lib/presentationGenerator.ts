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
    primary: '1e3a5f',      // Deep navy blue
    secondary: '2dd4bf',    // Teal accent
    accent: 'f59e0b',       // Warm amber
    background: 'f8fafc',   // Clean white
    darkBg: '0f172a',       // Dark slate
    gradient1: '1e3a5f',
    gradient2: '0f766e',
    textLight: 'ffffff',
    textDark: '1e293b',
    headerStyle: 'gradient',
  },
  academic: {
    name: 'Academic',
    primary: '7c3aed',      // Royal purple
    secondary: 'ec4899',    // Magenta pink
    accent: '06b6d4',       // Cyan
    background: 'faf5ff',   // Light purple tint
    darkBg: '2e1065',       // Deep purple
    gradient1: '7c3aed',
    gradient2: 'db2777',
    textLight: 'ffffff',
    textDark: '1e1b4b',
    headerStyle: 'split',
  },
  creative: {
    name: 'Creative',
    primary: 'f97316',      // Vibrant orange
    secondary: '14b8a6',    // Teal
    accent: 'a855f7',       // Purple
    background: 'fffbeb',   // Warm cream
    darkBg: '431407',       // Deep brown
    gradient1: 'ea580c',
    gradient2: 'dc2626',
    textLight: 'ffffff',
    textDark: '292524',
    headerStyle: 'bold',
  },
};

export const generatePowerPoint = async (data: PresentationData): Promise<void> => {
  const pptx = new pptxgen();
  const template = templates[data.template];

  // Set presentation properties
  pptx.author = data.teamMembers.map(m => m.name).join(', ');
  pptx.title = data.content.title || data.topic;
  pptx.subject = data.subjectName;
  pptx.company = data.collegeName;
  pptx.layout = 'LAYOUT_WIDE';

  // ==================== TITLE SLIDE ====================
  const titleSlide = pptx.addSlide();
  
  // Stunning gradient background
  titleSlide.addShape('rect', {
    x: 0, y: 0, w: '100%', h: '100%',
    fill: { 
      type: 'solid',
      color: template.darkBg,
    },
  });

  // Decorative gradient overlay
  titleSlide.addShape('rect', {
    x: 0, y: 0, w: '60%', h: '100%',
    fill: { 
      type: 'solid',
      color: template.gradient1,
    },
  });

  // Diagonal accent shape
  titleSlide.addShape('rect', {
    x: 8, y: 0, w: 6, h: '100%',
    fill: { color: template.secondary },
    rotate: 15,
  });

  // Add university logo if available
  if (data.universityLogo) {
    try {
      titleSlide.addImage({
        path: data.universityLogo,
        x: 0.5,
        y: 0.4,
        w: 1.2,
        h: 1.2,
      });
    } catch (e) {
      console.log('Could not add logo:', e);
    }
  }

  // Main title with impact
  titleSlide.addText(data.content.title || data.topic, {
    x: 0.5,
    y: 1.8,
    w: 7,
    h: 1.8,
    fontSize: 40,
    bold: true,
    color: template.textLight,
    fontFace: 'Arial Black',
    align: 'left',
    valign: 'middle',
  });

  // Accent line under title
  titleSlide.addShape('rect', {
    x: 0.5, y: 3.7, w: 3, h: 0.08,
    fill: { color: template.secondary },
  });

  // Team members section
  const teamText = data.teamMembers.map((member, idx) => ({
    text: `${member.name}\n`,
    options: { bold: true, fontSize: 16, color: template.textLight }
  }));
  
  const teamIds = data.teamMembers.map((member) => ({
    text: `ID: ${member.id}\n\n`,
    options: { fontSize: 12, color: 'b0b0b0' }
  }));

  // Interleave names and IDs
  const teamDisplay: any[] = [];
  data.teamMembers.forEach((member, idx) => {
    teamDisplay.push({ text: member.name, options: { bold: true, fontSize: 16, color: template.textLight } });
    teamDisplay.push({ text: ` (${member.id})\n`, options: { fontSize: 12, color: 'c0c0c0' } });
  });

  titleSlide.addText(teamDisplay, {
    x: 0.5,
    y: 4,
    w: 7,
    h: 1.2,
    fontFace: 'Arial',
    align: 'left',
  });

  // College and department info with style
  const collegeInfo = data.departmentName 
    ? `${data.collegeName} | ${data.departmentName}` 
    : data.collegeName;

  titleSlide.addText(collegeInfo, {
    x: 0.5,
    y: 5.2,
    w: 7,
    h: 0.4,
    fontSize: 14,
    color: template.secondary,
    fontFace: 'Arial',
    bold: true,
  });

  // Subject and professor
  const subjectInfo = data.professorName 
    ? `${data.subjectName} • Prof. ${data.professorName}`
    : data.subjectName;

  titleSlide.addText(subjectInfo, {
    x: 0.5,
    y: 5.6,
    w: 7,
    h: 0.3,
    fontSize: 12,
    color: 'a0a0a0',
    fontFace: 'Arial',
  });

  // ==================== TABLE OF CONTENTS ====================
  const tocSlide = pptx.addSlide();
  tocSlide.bkgd = template.background;

  // Header section
  tocSlide.addShape('rect', {
    x: 0, y: 0, w: '100%', h: 1.4,
    fill: { color: template.primary },
  });

  tocSlide.addText('Table of Contents', {
    x: 0.5, y: 0.4, w: 10, h: 0.8,
    fontSize: 32, bold: true, color: template.textLight,
    fontFace: 'Arial Black',
  });

  // TOC items with numbers
  const tocItems = data.content.slides.map((slide, idx) => ({
    text: `${String(idx + 1).padStart(2, '0')}   ${slide.title}\n\n`,
    options: { 
      fontSize: 16, 
      color: template.textDark,
      bold: idx === 0,
    }
  }));

  tocSlide.addText(tocItems, {
    x: 0.8, y: 1.8, w: 12, h: 4,
    fontFace: 'Arial',
    valign: 'top',
  });

  // Side accent bar
  tocSlide.addShape('rect', {
    x: 12.8, y: 1.4, w: 0.5, h: '100%',
    fill: { color: template.secondary },
  });

  // ==================== CONTENT SLIDES ====================
  for (let index = 0; index < data.content.slides.length; index++) {
    const slideData = data.content.slides[index];
    const slide = pptx.addSlide();
    slide.bkgd = template.background;

    // Dynamic header based on template style
    if (template.headerStyle === 'gradient') {
      // Gradient header
      slide.addShape('rect', {
        x: 0, y: 0, w: '100%', h: 1.4,
        fill: { color: template.primary },
      });
      // Secondary accent
      slide.addShape('rect', {
        x: 0, y: 1.3, w: '100%', h: 0.15,
        fill: { color: template.secondary },
      });
    } else if (template.headerStyle === 'split') {
      // Split header
      slide.addShape('rect', {
        x: 0, y: 0, w: 3, h: 1.4,
        fill: { color: template.primary },
      });
      slide.addShape('rect', {
        x: 3, y: 0, w: 10.33, h: 1.4,
        fill: { color: template.secondary },
      });
    } else {
      // Bold header
      slide.addShape('rect', {
        x: 0, y: 0, w: '100%', h: 1.4,
        fill: { color: template.primary },
      });
      slide.addShape('rect', {
        x: 11.5, y: -0.3, w: 2, h: 2,
        fill: { color: template.secondary },
      });
    }

    // Slide number badge
    slide.addShape('rect', {
      x: 12, y: 0.2, w: 0.9, h: 0.9,
      fill: { color: template.accent },
    });

    slide.addText(`${index + 1}`, {
      x: 12, y: 0.25, w: 0.9, h: 0.8,
      fontSize: 20, bold: true, color: template.textLight,
      align: 'center', valign: 'middle',
      fontFace: 'Arial Black',
    });

    // Slide title
    slide.addText(slideData.title, {
      x: 0.5, y: 0.35, w: 11, h: 0.9,
      fontSize: 28, bold: true, color: template.textLight,
      fontFace: 'Arial Black',
    });

    // Content area with image if available
    const hasImage = slideData.imageUrl && slideData.imageUrl.startsWith('data:');
    const contentWidth = hasImage ? 7 : 12;

    // Content points with beautiful bullets
    const bulletPoints = slideData.points.map((point, pIdx) => ({
      text: point,
      options: {
        bullet: { 
          type: 'bullet' as const, 
          color: pIdx % 2 === 0 ? template.primary : template.secondary,
        },
        fontSize: 18,
        color: template.textDark,
        breakLine: true,
        paraSpaceAfter: 14,
        paraSpaceBefore: 4,
      },
    }));

    slide.addText(bulletPoints, {
      x: 0.8,
      y: 1.7,
      w: contentWidth,
      h: 3.8,
      fontFace: 'Arial',
      valign: 'top',
    });

    // Add image if available
    if (hasImage && slideData.imageUrl) {
      try {
        slide.addImage({
          data: slideData.imageUrl,
          x: 8.2,
          y: 1.7,
          w: 4.5,
          h: 3.5,
          rounding: true,
        });
        
        // Image frame/border
        slide.addShape('rect', {
          x: 8.1, y: 1.6, w: 4.7, h: 3.7,
          line: { color: template.secondary, width: 2 },
          fill: { type: 'none' },
        });
      } catch (e) {
        console.log('Could not add slide image:', e);
      }
    }

    // Bottom accent bar
    slide.addShape('rect', {
      x: 0, y: 5.5, w: '100%', h: 0.12,
      fill: { color: template.secondary },
    });

    // Footer info
    slide.addText(data.content.title || data.topic, {
      x: 0.5, y: 5.65, w: 10, h: 0.3,
      fontSize: 10, color: '888888',
      fontFace: 'Arial',
    });
  }

  // ==================== SUMMARY SLIDE ====================
  const summarySlide = pptx.addSlide();
  summarySlide.bkgd = template.background;

  summarySlide.addShape('rect', {
    x: 0, y: 0, w: '100%', h: 1.4,
    fill: { color: template.primary },
  });

  summarySlide.addText('Key Takeaways', {
    x: 0.5, y: 0.35, w: 12, h: 0.9,
    fontSize: 32, bold: true, color: template.textLight,
    fontFace: 'Arial Black',
  });

  // Summary points (first point from each slide)
  const keyPoints = data.content.slides
    .slice(0, 6)
    .map((s, idx) => ({
      text: `${s.title}: ${s.points[0] || ''}\n\n`,
      options: { 
        fontSize: 14, 
        color: template.textDark,
        bullet: { type: 'number' as const, color: template.accent },
      }
    }));

  summarySlide.addText(keyPoints, {
    x: 0.8, y: 1.7, w: 12, h: 4,
    fontFace: 'Arial',
    valign: 'top',
  });

  // ==================== THANK YOU SLIDE ====================
  const thanksSlide = pptx.addSlide();
  
  // Full gradient background
  thanksSlide.addShape('rect', {
    x: 0, y: 0, w: '100%', h: '100%',
    fill: { color: template.darkBg },
  });

  // Decorative shapes
  thanksSlide.addShape('rect', {
    x: -2, y: -2, w: 6, h: 6,
    fill: { color: template.primary },
  });

  thanksSlide.addShape('rect', {
    x: 10, y: 3, w: 5, h: 5,
    fill: { color: template.secondary },
  });

  // Thank you text
  thanksSlide.addText('Thank You!', {
    x: 0.5, y: 1.5, w: '90%', h: 1.5,
    fontSize: 56, bold: true, color: template.textLight,
    align: 'center', fontFace: 'Arial Black',
  });

  thanksSlide.addText('Questions & Discussion', {
    x: 0.5, y: 3.2, w: '90%', h: 0.8,
    fontSize: 24, color: template.secondary,
    align: 'center', fontFace: 'Arial',
  });

  // Team members on thank you slide
  const teamFinalDisplay = data.teamMembers.map(m => `${m.name} (${m.id})`).join(' • ');
  
  thanksSlide.addText(teamFinalDisplay, {
    x: 0.5, y: 4.5, w: '90%', h: 0.5,
    fontSize: 14, color: 'c0c0c0',
    align: 'center', fontFace: 'Arial',
  });

  // Contact/college info
  thanksSlide.addText(`${data.collegeName} | ${data.subjectName}`, {
    x: 0.5, y: 5.1, w: '90%', h: 0.4,
    fontSize: 12, color: '808080',
    align: 'center', fontFace: 'Arial',
  });

  // Generate and download
  const fileName = `${data.topic.replace(/[^a-zA-Z0-9]/g, '_')}_presentation.pptx`;
  await pptx.writeFile({ fileName });
};
