import pptxgen from 'pptxgenjs';

interface Slide {
  title: string;
  points: string[];
}

interface PresentationContent {
  title: string;
  slides: Slide[];
}

interface PresentationData {
  studentName: string;
  studentId: string;
  subjectName: string;
  professorName?: string;
  collegeName: string;
  departmentName?: string;
  universityLogo?: string;
  topic: string;
  content: PresentationContent;
}

export const generatePowerPoint = async (data: PresentationData): Promise<void> => {
  const pptx = new pptxgen();

  // Set presentation properties
  pptx.author = data.studentName;
  pptx.title = data.content.title || data.topic;
  pptx.subject = data.subjectName;
  pptx.company = data.collegeName;
  pptx.layout = 'LAYOUT_WIDE';

  // Define colors
  const primaryColor = '6366f1'; // Indigo
  const secondaryColor = '8b5cf6'; // Purple
  const textColor = '1f2937'; // Dark gray
  const lightBg = 'f8fafc'; // Light background

  // Title Slide
  const titleSlide = pptx.addSlide();
  titleSlide.bkgd = primaryColor;

  // Add university logo if available
  if (data.universityLogo) {
    try {
      titleSlide.addImage({
        path: data.universityLogo,
        x: 0.5,
        y: 0.5,
        w: 1.5,
        h: 1.5,
      });
    } catch (e) {
      console.log('Could not add logo:', e);
    }
  }

  // Main title
  titleSlide.addText(data.content.title || data.topic, {
    x: 0.5,
    y: 2,
    w: '90%',
    h: 1.5,
    fontSize: 44,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
    fontFace: 'Arial',
  });

  // Student info
  titleSlide.addText(
    [
      { text: data.studentName, options: { bold: true, fontSize: 24 } },
      { text: `\n${data.studentId}`, options: { fontSize: 18 } },
    ],
    {
      x: 0.5,
      y: 3.8,
      w: '90%',
      h: 1,
      color: 'FFFFFF',
      align: 'center',
      fontFace: 'Arial',
    }
  );

  // College and department info
  const collegeInfo = data.departmentName 
    ? `${data.collegeName} - ${data.departmentName}` 
    : data.collegeName;

  titleSlide.addText(collegeInfo, {
    x: 0.5,
    y: 4.8,
    w: '90%',
    h: 0.5,
    fontSize: 16,
    color: 'E0E0E0',
    align: 'center',
    fontFace: 'Arial',
  });

  // Subject and professor
  if (data.professorName) {
    titleSlide.addText(`${data.subjectName} - د. ${data.professorName}`, {
      x: 0.5,
      y: 5.3,
      w: '90%',
      h: 0.5,
      fontSize: 14,
      color: 'E0E0E0',
      align: 'center',
      fontFace: 'Arial',
    });
  } else {
    titleSlide.addText(data.subjectName, {
      x: 0.5,
      y: 5.3,
      w: '90%',
      h: 0.5,
      fontSize: 14,
      color: 'E0E0E0',
      align: 'center',
      fontFace: 'Arial',
    });
  }

  // Content Slides
  data.content.slides.forEach((slideData, index) => {
    const slide = pptx.addSlide();
    slide.bkgd = lightBg;

    // Header bar
    slide.addShape('rect', {
      x: 0,
      y: 0,
      w: '100%',
      h: 1.2,
      fill: { color: primaryColor },
    });

    // Slide title
    slide.addText(slideData.title, {
      x: 0.5,
      y: 0.3,
      w: '90%',
      h: 0.8,
      fontSize: 28,
      bold: true,
      color: 'FFFFFF',
      fontFace: 'Arial',
    });

    // Slide number
    slide.addText(`${index + 1}`, {
      x: 12,
      y: 0.3,
      w: 0.8,
      h: 0.8,
      fontSize: 20,
      color: 'FFFFFF',
      align: 'center',
      fontFace: 'Arial',
    });

    // Content points
    const bulletPoints = slideData.points.map((point) => ({
      text: point,
      options: {
        bullet: { type: 'bullet' as const, color: secondaryColor },
        fontSize: 20,
        color: textColor,
        breakLine: true,
        paraSpaceAfter: 12,
      },
    }));

    slide.addText(bulletPoints, {
      x: 0.8,
      y: 1.5,
      w: '85%',
      h: 4,
      fontFace: 'Arial',
      valign: 'top',
    });

    // Footer decoration
    slide.addShape('rect', {
      x: 0,
      y: 5.5,
      w: '100%',
      h: 0.1,
      fill: { color: secondaryColor },
    });
  });

  // Thank You Slide
  const thanksSlide = pptx.addSlide();
  thanksSlide.bkgd = secondaryColor;

  thanksSlide.addText('شكراً لاستماعكم', {
    x: 0.5,
    y: 2,
    w: '90%',
    h: 1.5,
    fontSize: 48,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
    fontFace: 'Arial',
  });

  thanksSlide.addText('هل لديكم أي أسئلة؟', {
    x: 0.5,
    y: 3.5,
    w: '90%',
    h: 1,
    fontSize: 28,
    color: 'E0E0E0',
    align: 'center',
    fontFace: 'Arial',
  });

  thanksSlide.addText(data.studentName, {
    x: 0.5,
    y: 4.8,
    w: '90%',
    h: 0.5,
    fontSize: 18,
    color: 'FFFFFF',
    align: 'center',
    fontFace: 'Arial',
  });

  // Generate and download
  const fileName = `${data.topic.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_')}_presentation.pptx`;
  await pptx.writeFile({ fileName });
};
