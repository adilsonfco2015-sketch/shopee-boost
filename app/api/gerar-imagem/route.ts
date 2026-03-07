import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function stripCodeFences(text: string) {
  // sem regex pra evitar erro de parser
  return text
    .split("```json").join("")
    .split("```").join("")
    .trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const imageBase64: string | undefined = body?.imageBase64; // "data:image/png;base64,...."
    const nome: string = body?.nome ?? "";
    const preco: string = body?.preco ?? "";
    const link: string = body?.link ?? "";

    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { error: "OPENAI_API_KEY não configurada no servidor." },
        { status: 500 }
      );
    }

    if (!imageBase64) {
      return Response.json(
        { error: "Envie a imagem (imageBase64)." },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `
Você é um copywriter de afiliados.
Analise a IMAGEM enviada (produto/criativo) e gere 3 textos prontos:
1) "shopee": descrição curta para Shopee (com emojis, promessa realista e CTA pro link)
2) "instagram": legenda para Reels/Post (gancho forte + benefício + CTA)
3) "whatsapp": texto curto para grupo/lista (direto, sem ser apelativo, com CTA)

Use o link exatamente como fornecido (se houver).
Dados extras (podem ajudar):
Produto: ${nome || "(não informado)"}
Preço: ${preco || "(não informado)"}
Link: ${link || "(não informado)"}

REGRAS IMPORTANTES:
- Responda SOMENTE um JSON válido (sem markdown, sem crases, sem \`\`\`).
- Formato exato:
{
  "shopee": "...",
  "instagram": "...",
  "whatsapp": "..."
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: imageBase64 } },
          ],
        },
      ],
      temperature: 0.7,
    });

    const raw = completion.choices?.[0]?.message?.content ?? "";
    const cleaned = stripCodeFences(raw);

    // tenta transformar em objeto
    let parsed: any = null;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // fallback: devolve como texto (pra você ver no UI)
      return Response.json(
        { error: "A IA não retornou JSON válido.", raw: cleaned },
        { status: 200 }
      );
    }

    return Response.json(
      {
        shopee: parsed?.shopee ?? "",
        instagram: parsed?.instagram ?? "",
        whatsapp: parsed?.whatsapp ?? "",
      },
      { status: 200 }
    );
  } catch (err: any) {
    return Response.json(
      { error: "Erro ao gerar com IA (imagem).", details: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}