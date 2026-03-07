import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function stripCodeFences(text: string) {
  return text
    .split("```json").join("")
    .split("```").join("")
    .trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const nome: string = body?.nome ?? "";
    const preco: string = body?.preco ?? "";
    const link: string = body?.link ?? "";
    const objetivo: string = body?.objetivo ?? "vender rápido";

    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { error: "OPENAI_API_KEY não configurada no servidor." },
        { status: 500 }
      );
    }

    if (!nome.trim()) {
      return Response.json(
        { error: "Preencha pelo menos o nome do produto." },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `
Você é um copywriter especialista em afiliados no Brasil.

Crie 3 VARIAÇÕES diferentes de copy para o produto abaixo:
- Produto: ${nome}
- Preço: ${preco || "(não informado)"}
- Link: ${link || "(não informado)"}
- Objetivo: ${objetivo}

Para cada variação, gere:
1) "shopee" = texto para Shopee
2) "instagram" = legenda para Instagram
3) "whatsapp" = mensagem curta para WhatsApp

Regras:
- Português do Brasil
- Linguagem persuasiva e clara
- Sem exageros absurdos
- Use CTA quando fizer sentido
- Se houver link, inclua no texto
- Cada variação deve ter estilo um pouco diferente:
  - versão 1: direta
  - versão 2: mais emocional
  - versão 3: mais agressiva/urgência

Responda SOMENTE com JSON válido, sem markdown e sem crases, neste formato exato:

{
  "variacoes": [
    {
      "nome": "Versão 1 - Direta",
      "shopee": "...",
      "instagram": "...",
      "whatsapp": "..."
    },
    {
      "nome": "Versão 2 - Emocional",
      "shopee": "...",
      "instagram": "...",
      "whatsapp": "..."
    },
    {
      "nome": "Versão 3 - Urgência",
      "shopee": "...",
      "instagram": "...",
      "whatsapp": "..."
    }
  ]
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "Você escreve copy de alta conversão para afiliados.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.9,
    });

    const raw = completion.choices?.[0]?.message?.content ?? "";
    const cleaned = stripCodeFences(raw);

    let parsed: any = null;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return Response.json(
        { error: "A IA não retornou JSON válido.", raw: cleaned },
        { status: 500 }
      );
    }

    const variacoes = Array.isArray(parsed?.variacoes)
      ? parsed.variacoes.slice(0, 3).map((item: any, index: number) => ({
          nome: String(item?.nome || `Versão ${index + 1}`),
          shopee: String(item?.shopee || ""),
          instagram: String(item?.instagram || ""),
          whatsapp: String(item?.whatsapp || ""),
        }))
      : [];

    if (!variacoes.length) {
      return Response.json(
        { error: "Nenhuma variação foi gerada." },
        { status: 500 }
      );
    }

    return Response.json({ variacoes });
  } catch (err: any) {
    return Response.json(
      {
        error: "Erro ao gerar com IA (texto).",
        details: String(err?.message ?? err),
      },
      { status: 500 }
    );
  }
}