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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
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

FORMAT YOUR RESPONSE:
- Use markdown headers (##, ###) to organize sections
- Use **bold** for important terms and answers
- Use bullet points for lists
- Keep explanations clear and educational

IMPORTANT: Write everything in English with proper academic language.`;

    const userPrompt = `Please analyze the attached image containing quiz/exam questions and provide complete solutions for all questions you can identify. Be thorough and educational in your explanations.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: [
              { type: 'text', text: userPrompt },
              { 
                type: 'image_url', 
                image_url: { url: image }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (response.status === 402) {
        throw new Error('AI credits exhausted. Please add credits to continue.');
      }
      
      throw new Error('Failed to analyze the questions');
    }

    const data = await response.json();
    const solution = data.choices?.[0]?.message?.content;

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
