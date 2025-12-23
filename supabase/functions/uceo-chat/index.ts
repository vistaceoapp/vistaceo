import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// CEO Digital System Prompt - Premium AI Assistant
const SYSTEM_PROMPT = `Eres el CEO Digital, un asistente de IA premium para dueños de restaurantes, cafeterías, bares y negocios gastronómicos. Tu nombre interno de código es "el asistente" pero en la conversación simplemente ayudas sin referirte a ti mismo por nombre.

## Tu Personalidad
- **Directo y práctico**: Vas al grano con consejos accionables, sin rodeos
- **Empático**: Entiendes los desafíos de manejar un negocio gastronómico pequeño
- **Experto**: Dominas operaciones, marketing local, finanzas básicas, servicio al cliente y gestión de personal
- **Local**: Entiendes el contexto latinoamericano (economía, cultura gastronómica, estacionalidad, proveedores)
- **Motivador**: Celebras los logros y das ánimo en momentos difíciles

## Tu Rol Principal
1. **Decisiones del día a día**: Ayudar con problemas operativos inmediatos
2. **Análisis de señales**: Interpretar datos de ventas, reseñas, tráfico
3. **Acciones específicas**: Siempre dar al menos UNA acción concreta que el dueño pueda hacer HOY
4. **Estrategia práctica**: Guiar hacia mejoras de largo plazo sin abrumar

## Áreas de Expertise
- **Marketing local**: Redes sociales, promociones, fidelización, delivery apps
- **Operaciones**: Tiempos de servicio, mise en place, inventario, proveedores
- **Finanzas**: Control de costos, pricing, ticket promedio, márgenes
- **Servicio**: Experiencia del cliente, manejo de quejas, reseñas
- **Equipo**: Contratación, capacitación, motivación, turnos

## Reglas de Comunicación
- Respuestas concisas: 2-4 párrafos máximo (salvo que el usuario pida más detalle)
- Siempre incluir al menos una acción concreta
- Usar ejemplos relevantes a gastronomía local
- Mantener tono profesional pero cercano (tuteo cuando sea apropiado)
- Responder en español salvo que el usuario escriba en otro idioma
- NO inventar datos específicos que no tengas - sé honesto sobre limitaciones
- Cuando no sepas algo, sugiere cómo el usuario puede obtener esa información

## Formato de Respuestas (cuando aplique)
- Usa **negritas** para destacar puntos clave
- Usa listas cuando hay múltiples pasos o opciones
- Si das una acción, empieza con "👉 Acción:" o similar
- Si celebras un logro, usa emojis apropiados pero con moderación`;

// Build rich context from business data and memory
function buildContextMessage(businessContext: any, memoryContext: any): string {
  let context = "";
  
  if (businessContext) {
    context += `\n\n## Contexto del Negocio
- **Nombre**: ${businessContext.name || "No especificado"}
- **Tipo**: ${formatCategory(businessContext.category)}
- **País**: ${formatCountry(businessContext.country)}
- **Ticket promedio**: ${businessContext.avg_ticket ? `$${businessContext.avg_ticket}` : "No especificado"}
- **Rating promedio**: ${businessContext.avg_rating ? `${businessContext.avg_rating}★` : "No especificado"}
- **Horarios configurados**: ${businessContext.service_slots ? JSON.stringify(businessContext.service_slots) : "Estándar"}`;
  }

  if (memoryContext) {
    if (memoryContext.recentActions && memoryContext.recentActions.length > 0) {
      context += `\n\n## Acciones Recientes
${memoryContext.recentActions.map((a: any) => `- ${a.title} (${a.status})`).join("\n")}`;
    }

    if (memoryContext.activeMissions && memoryContext.activeMissions.length > 0) {
      context += `\n\n## Misiones Activas
${memoryContext.activeMissions.map((m: any) => `- ${m.title} (paso ${m.current_step + 1})`).join("\n")}`;
    }

    if (memoryContext.recentCheckins && memoryContext.recentCheckins.length > 0) {
      const avgTraffic = memoryContext.recentCheckins.reduce((acc: number, c: any) => acc + (c.traffic_level || 0), 0) / memoryContext.recentCheckins.length;
      context += `\n\n## Check-ins Recientes
- Promedio de tráfico últimos días: ${avgTraffic.toFixed(1)}/5`;
    }

    if (memoryContext.lessons && memoryContext.lessons.length > 0) {
      context += `\n\n## Lecciones Aprendidas
${memoryContext.lessons.slice(0, 3).map((l: string) => `- ${l}`).join("\n")}`;
    }
  }

  return context;
}

function formatCategory(category: string | null): string {
  const categories: Record<string, string> = {
    restaurant: "Restaurante",
    cafeteria: "Cafetería",
    bar: "Bar",
    fast_casual: "Fast Casual",
    heladeria: "Heladería",
    panaderia: "Panadería",
    dark_kitchen: "Dark Kitchen",
  };
  return category ? categories[category] || category : "No especificado";
}

function formatCountry(country: string | null): string {
  const countries: Record<string, string> = {
    AR: "Argentina",
    MX: "México",
    CL: "Chile",
    CO: "Colombia",
    BR: "Brasil",
    UY: "Uruguay",
    CR: "Costa Rica",
    PA: "Panamá",
    US: "Estados Unidos",
  };
  return country ? countries[country] || country : "No especificado";
}

// Fetch memory context from database
async function fetchMemoryContext(supabase: any, businessId: string) {
  try {
    const [actionsRes, missionsRes, checkinsRes, messagesRes] = await Promise.all([
      // Recent actions
      supabase
        .from("daily_actions")
        .select("title, status, completed_at")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(5),
      // Active missions
      supabase
        .from("missions")
        .select("title, current_step")
        .eq("business_id", businessId)
        .eq("status", "active")
        .limit(3),
      // Recent checkins
      supabase
        .from("checkins")
        .select("traffic_level, slot, created_at")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(7),
      // Lessons from retros
      supabase
        .from("chat_messages")
        .select("content, metadata")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    // Extract lessons from retro messages
    const lessons: string[] = [];
    if (messagesRes.data) {
      for (const msg of messagesRes.data) {
        if (msg.metadata?.type === "weekly_retro" && msg.metadata?.lesson) {
          lessons.push(msg.metadata.lesson);
        }
        if (msg.metadata?.type === "micro_question") {
          lessons.push(`${msg.metadata.answer} (sobre ${msg.metadata.category})`);
        }
      }
    }

    return {
      recentActions: actionsRes.data || [],
      activeMissions: missionsRes.data || [],
      recentCheckins: checkinsRes.data || [],
      lessons: lessons.slice(0, 5),
    };
  } catch (error) {
    console.error("Error fetching memory context:", error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, businessContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Fetch memory context if we have business ID
    let memoryContext = null;
    if (businessContext?.id && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      memoryContext = await fetchMemoryContext(supabase, businessContext.id);
    }

    // Build rich context
    const contextMessage = buildContextMessage(businessContext, memoryContext);
    const systemPrompt = SYSTEM_PROMPT + contextMessage;

    console.log("Calling AI gateway with", messages.length, "messages");

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
          ...messages.slice(-20).map((m: { role: string; content: string }) => ({
            role: m.role,
            content: m.content,
          })),
        ],
        stream: false,
        temperature: 0.7,
        max_tokens: 1024,
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
    console.error("chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
