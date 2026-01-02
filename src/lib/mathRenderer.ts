import katex from 'katex';

/**
 * Renders LaTeX math expressions in a string to HTML
 * Supports both inline ($...$) and display ($$...$$) math
 */
export const renderMath = (text: string): string => {
  if (!text) return '';
  
  let result = text;
  
  // First, handle display math ($$...$$)
  result = result.replace(/\$\$([\s\S]*?)\$\$/g, (match, latex) => {
    try {
      return katex.renderToString(latex.trim(), {
        displayMode: true,
        throwOnError: false,
        strict: false,
        trust: true,
        macros: {
          "\\R": "\\mathbb{R}",
          "\\N": "\\mathbb{N}",
          "\\Z": "\\mathbb{Z}",
          "\\Q": "\\mathbb{Q}",
          "\\C": "\\mathbb{C}",
        }
      });
    } catch (e) {
      console.warn('KaTeX display render error:', e);
      return match;
    }
  });
  
  // Then, handle inline math ($...$) - but not escaped \$
  result = result.replace(/(?<!\\)\$([^\$\n]+?)(?<!\\)\$/g, (match, latex) => {
    try {
      return katex.renderToString(latex.trim(), {
        displayMode: false,
        throwOnError: false,
        strict: false,
        trust: true,
        macros: {
          "\\R": "\\mathbb{R}",
          "\\N": "\\mathbb{N}",
          "\\Z": "\\mathbb{Z}",
          "\\Q": "\\mathbb{Q}",
          "\\C": "\\mathbb{C}",
        }
      });
    } catch (e) {
      console.warn('KaTeX inline render error:', e);
      return match;
    }
  });
  
  return result;
};

/**
 * Processes content line by line, rendering math and converting markdown
 */
export const processContentWithMath = (content: string): string => {
  if (!content) return '';
  
  // First render all math expressions
  let processed = renderMath(content);
  
  // Then convert markdown to HTML
  processed = processed
    .replace(/### (.*)/g, '<h3>$1</h3>')
    .replace(/## (.*)/g, '<h2>$1</h2>')
    .replace(/# (.*)/g, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  
  // Split into paragraphs
  const lines = processed.split('\n').filter(line => line.trim());
  const result = lines.map(line => {
    // Skip lines that are already HTML elements
    if (line.startsWith('<h') || line.startsWith('<ul') || line.startsWith('<ol')) {
      return line;
    }
    // Handle bullet points
    if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
      return `<li>${line.replace(/^[\s]*[-•]\s*/, '')}</li>`;
    }
    return `<p>${line}</p>`;
  }).join('');
  
  return result;
};

/**
 * KaTeX CSS for PDF export
 */
export const katexCSS = `
/* KaTeX Math Styling */
.katex { 
  font-size: 1.1em; 
  font-family: KaTeX_Main, 'Times New Roman', serif;
}
.katex-display { 
  display: block; 
  margin: 1em 0; 
  text-align: center; 
}
.katex-display > .katex { 
  display: inline-block; 
}
.katex .mord { color: inherit; }
.katex .mbin { margin: 0 0.22em; }
.katex .mrel { margin: 0 0.28em; }
.katex .mopen, .katex .mclose { color: inherit; }
.katex .mfrac .frac-line { border-bottom-color: currentColor; }
.katex .sqrt > .root { margin-left: 0.28em; }
.inline-code {
  background: rgba(0,0,0,0.05);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9em;
}
`;
