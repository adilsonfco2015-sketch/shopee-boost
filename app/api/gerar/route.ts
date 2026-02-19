import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { nome, preco, link, modelo } = await req.json();

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: `Crie uma descrição de Shopee para o produto:

Produto: ${nome}
Preço: ${preco}
Link: ${link}
Estilo: ${modelo}

Use emojis e linguagem de vendas.`,
      },
    ],
  });

  return Response.json({
    resultado: completion.choices[0].message.content,
  });
}
