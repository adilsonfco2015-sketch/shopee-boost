import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { nome, preco, link, modelo } = await req.json();

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });


export async function POST(req: Request) {
  try {
    const { nome, preco, link, modelo } = await req.json();

    const promptPorModelo =
      modelo === "instagram"
        ? "Crie uma legenda curta, chamativa e com hashtags para Instagram."
        : modelo === "whatsapp"
        ? "Crie uma mensagem curta e direta para WhatsApp, bem vendedora."
        : "Crie uma legenda persuasiva para Shopee (estilo Shopee Video).";

    const prompt = `
Você é um especialista em copywriting para afiliados.

Produto: ${nome}
Preço: R$ ${preco}
Link: ${link}

Tarefa:
${promptPorModelo}

Regras:
- Comece com um HOOK forte na primeira linha
- Use benefícios claros e linguagem simples
- Use emojis com moderação
- Inclua um CTA forte
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

    const resultado = completion.choices?.[0]?.message?.content ?? "";

    return Response.json({ resultado });
  } catch (err: any) {
  console.error("ERRO OPENAI:", err);
  console.error("OPENAI_API_KEY existe?", !!process.env.OPENAI_API_KEY);

  return Response.json(
    { error: err?.message || "Erro ao gerar com IA" },
    { status: 500 }
  );
}
}
