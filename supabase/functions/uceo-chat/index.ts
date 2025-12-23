import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const UCEO_SYSTEM_PROMPT = `Eres UCEO, el asistente de IA para dueños de restaurantes, cafeterías y bares en Latinoamérica. 
Tu personalidad es:
- Directo y práctico: vas al grano con consejos accionables
- Empático: entiendes los desafíos de manejar un negocio gastronómico
- Experto: conoces operaciones, marketing, finanzas, y servicio al cliente
- Local: entiendes el contexto latinoamericano (precios, cultura, estacionalidad)

Tu rol:
- Ayudar con decisiones del día a día del negocio
- Analizar datos y dar insights accionables
- Sugerir acciones específicas basadas en el contexto
- Responder preguntas sobre operaciones, marketing, personal, finanzas

Reglas:
- Respuestas concisas (máximo 3 párrafos)
- Siempre dar al menos una acción concreta
- Usar ejemplos relevantes a gastronomía
- Mantener tono profesional pero cercano
- Responder en español`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, businessContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context from business data
    let contextMessage = "";
    if (businessContext) {
      contextMessage = `\n\nContexto del negocio:
- Nombre: ${businessContext.name || "No especificado"}
- Categoría: ${businessContext.category || "No especificado"}
- País: ${businessContext.country || "No especificado"}
- Ticket promedio: ${businessContext.avg_ticket ? `$${businessContext.avg_ticket}` : "No especificado"}
- Rating promedio: ${businessContext.avg_rating || "No especificado"}`;
    }

    const systemPrompt = UCEO_SYSTEM_PROMPT + contextMessage;

    console.log("Calling AI gateway with messages:", JSON.stringify(messages.slice(-5)));

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m: { role: string; content: string }) => ({
            role: m.role,
            content: m.content,
          })),
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Límite de solicitudes excedido. Intenta de nuevo en unos segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Se requiere agregar créditos a la cuenta." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content;

    if (!assistantMessage) {
      throw new Error("No response from AI");
    }

    console.log("AI response received successfully");

    return new Response(
      JSON.stringify({ message: assistantMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("uceo-chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
