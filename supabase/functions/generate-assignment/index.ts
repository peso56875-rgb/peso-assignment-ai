import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { studentName, studentId, subjectName, professorName, topic, pageCount } = await req.json();
    
    const GEMINI_API_KEY = Deno.env.get('GOOGLE_GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GOOGLE_GEMINI_API_KEY is not configured');
    }

    console.log('Generating assignment for topic:', topic);
    console.log('Page count:', pageCount);

    const wordCount = pageCount * 300;

    const systemPrompt = `You are an expert academic writer who creates professional university assignments. 
You write in perfect English with academic tone. 
Your responses should be well-structured, informative, and professionally written.
Always include proper introduction, body sections with headers, and conclusion.
Include relevant facts, statistics, and academic insights.
Format your response with clear sections using markdown headers (##, ###).
The content should be approximately ${wordCount} words to fill ${pageCount} pages.`;

    const userPrompt = `Create a comprehensive academic assignment about: "${topic}"

Student Information:
- Student Name: ${studentName}
- Student ID: ${studentId}
- Subject: ${subjectName}
- Professor: ${professorName}

Requirements:
1. Write approximately ${wordCount} words (${pageCount} pages)
2. Include an engaging introduction
3. Create 3-5 main sections with clear headers
4. Include relevant examples, facts, and academic insights
5. Write a strong conclusion with key takeaways
6. Use professional academic English
7. Make content informative and educational

Format the response with proper markdown headers and paragraphs.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: systemPrompt + '\n\n' + userPrompt }]
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
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error('No content generated');
    }

    console.log('Assignment generated successfully');

    return new Response(JSON.stringify({ 
      content,
      studentName,
      studentId,
      subjectName,
      professorName,
      topic
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating assignment:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to generate assignment' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
