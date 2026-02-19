import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { nome, preco, link, modelo } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { error: "OPENAI_API_KEY não configurada no servidor (Vercel)." },
        { status: 500 }
      );
    }

    if (!nome || !preco || !link || !modelo) {
      return Response.json(
        { error: "Preencha nome, preço, link e selecione o modelo." },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const instrucaoPorModelo =
      modelo === "instagram"
        ? "Crie uma legenda curta e chamativa para Instagram, com CTA e 12-18 hashtags no final."
        : modelo === "whatsapp"
        ? "Crie uma mensagem curta e direta para WhatsApp, com CTA e foco em conversão (sem hashtags)."
        : "Crie uma descrição/legenda persuasiva estilo Shopee Video, com CTA e 12-18 hashtags no final.";

    const prompt = `
Você é um copywriter especialista em afiliados.

Produto: ${nome}
Preço: R$ ${preco}
Link: ${link}

Tarefa:
${instrucaoPorModelo}

Regras:
- Comece com um HOOK forte na primeira linha
- Linguagem simples e objetiva
- Use emojis com moderação
- Traga benefícios claros e motivo para comprar agora
- Inclua CTA para clicar no link
- Se for Instagram ou Shopee: inclua 12 a 18 hashtags relevantes no final
Retorne APENAS o texto final pronto para copiar.
`.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Você escreve copy de alta conversão." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    const resultado = completion.choices?.[0]?.message?.content?.trim() || "";

    if (!resultado) {
      return Response.json(
        { error: "A IA não retornou texto. Tente novamente." },
        { status: 500 }
      );
    }

    return Response.json({ resultado });
  } catch (err: any) {
    // Log no servidor (Vercel/terminal)
    console.error("ERRO /api/gerar:", err);

    const msg =
      err?.message ||
      "Falha ao gerar. Verifique a chave/limites e tente novamente.";

    return Response.json({ error: msg }, { status: 500 });
  }
}
