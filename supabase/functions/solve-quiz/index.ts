import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image, fileName, fileType } = await req.json();

    if (!image) {
      throw new Error('No image provided');
    }

    console.log(`Processing quiz/sheet: ${fileName} (${fileType})`);

    const GEMINI_API_KEY = Deno.env.get('GOOGLE_GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GOOGLE_GEMINI_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert academic tutor and problem solver. Your task is to analyze questions from uploaded images and provide comprehensive, accurate solutions.

INSTRUCTIONS:
1. Carefully read and identify all questions in the image
2. For each question, provide:
   - The question number/identifier
   - A clear, step-by-step solution
   - The final answer highlighted
3. Explain your reasoning and methodology
4. Use proper academic formatting
5. If there are multiple choice questions, explain why the correct answer is right and why others are wrong
6. For mathematical problems, show all calculation steps
7. For theoretical questions, provide detailed explanations with examples where helpful

MATHEMATICAL NOTATION - VERY IMPORTANT:
- Write ALL mathematical expressions using LaTeX notation wrapped in $...$ for inline math
- Use $$...$$ for display/block math equations
- Examples of correct formatting:
  - Fractions: $\\frac{a}{b}$ or $\\frac{x+1}{x-1}$
  - Exponents/Powers: $x^2$, $e^{x}$, $2^{n}$
  - Square roots: $\\sqrt{x}$, $\\sqrt[3]{x}$ for cube root
  - Greek letters: $\\alpha$, $\\beta$, $\\theta$, $\\pi$, $\\Delta$
  - Subscripts: $x_1$, $a_{n}$
  - Summation: $\\sum_{i=1}^{n} x_i$
  - Integration: $\\int_{a}^{b} f(x) dx$
  - Limits: $\\lim_{x \\to \\infty}$
  - Matrices: Use \\begin{pmatrix}...\\end{pmatrix}
  - Inequalities: $\\leq$, $\\geq$, $\\neq$
  - Arrows: $\\rightarrow$, $\\Rightarrow$
  - Trigonometry: $\\sin$, $\\cos$, $\\tan$
  - Logarithms: $\\log$, $\\ln$
  - Absolute value: $|x|$ or $\\left|x\\right|$
  - Multiplication: Use $\\times$ or $\\cdot$
  - Division: Use $\\div$ or fractions
- NEVER use plain text for math symbols like *, /, ^, sqrt
- ALWAYS wrap mathematical expressions in $ or $$

FORMAT YOUR RESPONSE:
- Use markdown headers (##, ###) to organize sections
- Use **bold** for important terms and answers
- Use bullet points for lists
- Keep explanations clear and educational
- Wrap ALL math in LaTeX notation

IMPORTANT: Write everything in English with proper academic language.`;

    const userPrompt = `Please analyze the attached image containing quiz/exam questions and provide complete solutions for all questions you can identify. Be thorough and educational in your explanations.`;

    // Extract base64 data from data URL
    let imageData = image;
    let mimeType = 'image/jpeg';
    
    if (image.startsWith('data:')) {
      const matches = image.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        mimeType = matches[1];
        imageData = matches[2];
      }
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: systemPrompt + '\n\n' + userPrompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: imageData
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      
      throw new Error('Failed to analyze the questions');
    }

    const data = await response.json();
    const solution = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!solution) {
      throw new Error('Failed to generate solution');
    }

    console.log('Solution generated successfully');

    return new Response(
      JSON.stringify({ solution }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in solve-quiz function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An unexpected error occurred' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
