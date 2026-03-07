"use client";

import React, { useMemo, useState } from "react";

type CanalResult = {
  shopee: string;
  instagram: string;
  whatsapp: string;
};

function copyToClipboard(text: string) {
  if (!text) return;
  navigator.clipboard.writeText(text);
}

export default function Page() {
  const [tab, setTab] = useState<"texto" | "imagem">("imagem");

  // ======= CAMPOS COMUNS =======
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [link, setLink] = useState("");

  // ======= ABA TEXTO (modelo simples sem IA, só template) =======
  const textoGerado = useMemo(() => {
    const n = nome?.trim() || "Produto";
    const p = preco?.trim() || "R$ ??";
    const l = link?.trim() || "";

    return `🔥 ${n} com SUPER OFERTA!

💰 Apenas ${p}

👉 Confira aqui: ${l}

⚡ Produto ideal para quem busca qualidade e custo-benefício.
🚀 Aproveite antes que acabe!`;
  }, [nome, preco, link]);

  // ======= ABA IMAGEM + MULTICANAL =======
  const [imageBase64, setImageBase64] = useState<string>("");
  const [imagemPreview, setImagemPreview] = useState<string>("");

  const [loadingImagem, setLoadingImagem] = useState(false);
  const [erroImagem, setErroImagem] = useState("");
  const [resultadoImagem, setResultadoImagem] = useState<CanalResult>({
    shopee: "",
    instagram: "",
    whatsapp: "",
  });

  function onSelectImage(file?: File) {
    if (!file) return;

    setErroImagem("");
    setResultadoImagem({ shopee: "", instagram: "", whatsapp: "" });

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result); // data:image/...;base64,...
      setImageBase64(dataUrl);
      setImagemPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  async function gerarImagemIA() {
    try {
      setErroImagem("");
      setLoadingImagem(true);
      setResultadoImagem({ shopee: "", instagram: "", whatsapp: "" });

      if (!imageBase64) {
        setErroImagem("Selecione uma imagem antes de gerar.");
        return;
      }

      const response = await fetch("/api/gerar-imagem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          nome,
          preco,
          link,
        }),
      });

      const data = await response.json();

      // Se a API devolver { error: "..."} ou status != 200
      if (!response.ok) {
        setErroImagem(data?.error || "Erro ao gerar com IA (imagem).");
        return;
      }

      // Se a API devolveu raw por não conseguir parsear JSON
      if (data?.raw && !data?.shopee) {
        setErroImagem(
          "A IA retornou um formato inesperado. Veja 'raw' no console."
        );
        console.log("RAW:", data.raw);
        return;
      }

      setResultadoImagem({
        shopee: data?.shopee ?? "",
        instagram: data?.instagram ?? "",
        whatsapp: data?.whatsapp ?? "",
      });
    } catch (e: any) {
      setErroImagem("Erro ao gerar com IA (imagem).");
      console.log("Erro gerarImagemIA:", e?.message ?? e);
    } finally {
      setLoadingImagem(false);
    }
  }

  const box: React.CSSProperties = {
    maxWidth: 980,
    margin: "24px auto",
    padding: 16,
    border: "1px solid #e5e5e5",
    borderRadius: 12,
    fontFamily: "Arial, sans-serif",
  };

  const label: React.CSSProperties = { fontSize: 12, opacity: 0.75 };
  const input: React.CSSProperties = {
    width: "100%",
    padding: 10,
    borderRadius: 10,
    border: "1px solid #ddd",
    marginTop: 6,
  };

  const btn: React.CSSProperties = {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
  };

  const btnPrimary: React.CSSProperties = {
    ...btn,
    border: "1px solid #111",
    fontWeight: 700,
  };

  const tabBtn = (active: boolean): React.CSSProperties => ({
    ...btn,
    border: active ? "2px solid #111" : "1px solid #ddd",
    fontWeight: active ? 700 : 500,
  });

  const card: React.CSSProperties = {
    border: "1px solid #e5e5e5",
    borderRadius: 12,
    padding: 12,
    background: "#fff",
  };

  const textarea: React.CSSProperties = {
    width: "100%",
    minHeight: 140,
    padding: 10,
    borderRadius: 10,
    border: "1px solid #ddd",
    marginTop: 8,
    whiteSpace: "pre-wrap",
  };

  return (
    <div style={box}>
      <h2 style={{ margin: 0 }}>Shopee Boost</h2>
      <p style={{ marginTop: 6, opacity: 0.75 }}>
        Gerador de texto e modo imagem + multicanal (Shopee / Instagram / WhatsApp)
      </p>

      {/* TABS */}
      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <button style={tabBtn(tab === "texto")} onClick={() => setTab("texto")}>
          Texto (modelo)
        </button>
        <button style={tabBtn(tab === "imagem")} onClick={() => setTab("imagem")}>
          Imagem + Multicanal (IA)
        </button>
      </div>

      {/* CAMPOS BASE */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 16 }}>
        <div>
          <div style={label}>Nome do produto</div>
          <input style={input} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Carregador Turbo 20W" />
        </div>
        <div>
          <div style={label}>Preço</div>
          <input style={input} value={preco} onChange={(e) => setPreco(e.target.value)} placeholder="Ex: R$ 49,90" />
        </div>
        <div>
          <div style={label}>Link</div>
          <input style={input} value={link} onChange={(e) => setLink(e.target.value)} placeholder="Link do produto" />
        </div>
      </div>

      {/* ABA TEXTO */}
      {tab === "texto" && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0 }}>Texto gerado (modelo simples)</h3>
            <button style={btn} onClick={() => copyToClipboard(textoGerado)}>
              Copiar
            </button>
          </div>

          <textarea style={textarea} readOnly value={textoGerado} />
          <p style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>
            * Esse modo é template (não usa IA). Use a aba “Imagem + Multicanal” para gerar pela IA.
          </p>
        </div>
      )}

      {/* ABA IMAGEM */}
      {tab === "imagem" && (
        <div style={{ marginTop: 16 }}>
          <h3 style={{ marginTop: 0 }}>Imagem + Multicanal (IA)</h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={card}>
              <div style={label}>Upload da imagem do produto</div>
              <input
                style={{ ...input, padding: 8 }}
                type="file"
                accept="image/*"
                onChange={(e) => onSelectImage(e.target.files?.[0])}
              />

              {imagemPreview ? (
                <div style={{ marginTop: 10 }}>
                  <div style={label}>Preview</div>
                  <img
                    src={imagemPreview}
                    alt="preview"
                    style={{ width: "100%", borderRadius: 12, border: "1px solid #eee", marginTop: 6 }}
                  />
                </div>
              ) : (
                <p style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
                  Selecione uma imagem para ativar o modo IA.
                </p>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <button style={btnPrimary} onClick={gerarImagemIA} disabled={loadingImagem}>
                  {loadingImagem ? "Gerando..." : "Gerar com IA"}
                </button>
                <button
                  style={btn}
                  onClick={() => {
                    setImageBase64("");
                    setImagemPreview("");
                    setResultadoImagem({ shopee: "", instagram: "", whatsapp: "" });
                    setErroImagem("");
                  }}
                  disabled={loadingImagem}
                >
                  Limpar
                </button>
              </div>

              {erroImagem && (
                <div style={{ marginTop: 10, padding: 10, borderRadius: 10, background: "#fff4f4", border: "1px solid #ffd0d0" }}>
                  <b>Erro:</b> {erroImagem}
                </div>
              )}
            </div>

            <div style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <b>Resultado (IA)</b>
                <button
                  style={btn}
                  onClick={() =>
                    copyToClipboard(
                      `🛒 SHOPEE:\n${resultadoImagem.shopee}\n\n📸 INSTAGRAM:\n${resultadoImagem.instagram}\n\n💬 WHATSAPP:\n${resultadoImagem.whatsapp}`
                    )
                  }
                >
                  Copiar tudo
                </button>
              </div>

              <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
                <div style={card}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <b>🛒 Shopee</b>
                    <button style={btn} onClick={() => copyToClipboard(resultadoImagem.shopee)}>
                      Copiar
                    </button>
                  </div>
                  <textarea style={textarea} readOnly value={resultadoImagem.shopee} />
                </div>

                <div style={card}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <b>📸 Instagram</b>
                    <button style={btn} onClick={() => copyToClipboard(resultadoImagem.instagram)}>
                      Copiar
                    </button>
                  </div>
                  <textarea style={textarea} readOnly value={resultadoImagem.instagram} />
                </div>

                <div style={card}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <b>💬 WhatsApp</b>
                    <button style={btn} onClick={() => copyToClipboard(resultadoImagem.whatsapp)}>
                      Copiar
                    </button>
                  </div>
                  <textarea style={textarea} readOnly value={resultadoImagem.whatsapp} />
                </div>
              </div>
            </div>
          </div>

          <p style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
            Dica: se estiver no Vercel e não gerar, provavelmente falta a variável <b>OPENAI_API_KEY</b> no projeto.
          </p>
        </div>
      )}
    </div>
  );
}