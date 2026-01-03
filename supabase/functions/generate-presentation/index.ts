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
    const { topic, slidesCount, studentName, subjectName } = await req.json();

    if (!topic || !slidesCount) {
      return new Response(
        JSON.stringify({ error: 'Topic and slides count are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `أنت خبير في إنشاء عروض تقديمية أكاديمية احترافية. 
مهمتك هي إنشاء محتوى عرض تقديمي مفصل ومنظم.

يجب أن يكون الرد بصيغة JSON فقط بدون أي نص إضافي، بالهيكل التالي:
{
  "title": "عنوان العرض",
  "slides": [
    {
      "title": "عنوان الشريحة",
      "points": ["نقطة 1", "نقطة 2", "نقطة 3"]
    }
  ]
}

قواعد مهمة:
- العنوان الرئيسي يجب أن يكون واضحاً ومختصراً
- كل شريحة يجب أن تحتوي على 3-5 نقاط
- النقاط يجب أن تكون مختصرة ومفيدة
- استخدم لغة أكاديمية واضحة
- أضف معلومات قيمة وموثوقة`;

    const userPrompt = `أنشئ عرض تقديمي عن الموضوع التالي:
الموضوع: ${topic}
عدد الشرائح المطلوب: ${slidesCount} شريحة (بدون شريحة العنوان والشكر)
اسم المادة: ${subjectName || 'غير محدد'}

ملاحظة: لا تضم شريحة العنوان أو شريحة الشكر، سأضيفهم تلقائياً.`;

    console.log('Calling Lovable AI for presentation generation...');

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
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'يرجى إضافة رصيد للحساب' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const contentText = data.choices?.[0]?.message?.content;

    if (!contentText) {
      throw new Error('No content received from AI');
    }

    console.log('Raw AI response:', contentText);

    // Parse JSON from the response
    let presentationContent;
    try {
      // Try to extract JSON from the response
      const jsonMatch = contentText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        presentationContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Failed to parse presentation content');
    }

    console.log('Presentation generated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        content: presentationContent,
        studentName,
        topic
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in generate-presentation:', error);
    const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء إنشاء العرض التقديمي';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
