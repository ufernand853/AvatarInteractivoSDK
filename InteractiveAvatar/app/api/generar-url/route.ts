// app/api/generar-url/route.ts

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { mensaje } = await req.json();

    console.log("🟢 Mensaje recibido:", mensaje);

    const prompt = `Tu tarea es generar URLs válidas de la tienda https://divino.com.uy según las siguientes reglas:
                - Para categorías: usa /<slug>
                - Para productos: usa /producto/<slug> — solo si se menciona un producto específico, no un tipo o categoría genérica.
                - Para términos ambiguos o genéricos que no se puedan identificar como categoría ni producto concreto, devolvé /catalogo?q=<slug>

                Convertí los nombres a slug (todo en minúscula, con guiones en vez de espacios).

                ⚠️ Importante:
                - Solo generá una URL si el mensaje del usuario incluye una consulta concreta sobre un producto o una categoría de producto.
                - Si el mensaje hace referencia general a un tipo de producto o espacio (como “productos de oficina”, “algo para el living”, “muebles”, “productos de dormitorio”), interpretalo como una consulta sobre una categoría y devolvé la URL correspondiente a esa categoría.
                - Si el término es vago o no coincide claramente con una categoría o producto específico, devolvé una búsqueda con /catalogo?q=<slug>
                - No generes una URL si el mensaje es solo un saludo, presentación o una frase genérica sin relación con productos o categorías.

                El usuario dijo: "${mensaje}"

                Respondé EXCLUSIVAMENTE con este JSON sin agregar explicaciones ni texto adicional. No pongas palabras antes ni después:
                {
                  "url": "https://divino.com.uy/..."
                }

                IMPORTANTE: Si no hay una coincidencia útil, devolvé:
                {
                  "url": null
                }

          `;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        temperature: 0,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "";

    console.log("🔎 Contenido recibido de OpenAI:", raw);

    if (!raw || !raw.trim().startsWith("{")) {
      return NextResponse.json({ url: null }, { status: 200 });
    }

    const parsed = JSON.parse(raw);
    return NextResponse.json({ url: parsed.url || null });
  } catch (error) {
    console.error("❌ Error interno en generar-url:", error);
    return NextResponse.json({ url: null }, { status: 500 });
  }
}
