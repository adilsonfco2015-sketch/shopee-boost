"use client";

import React, { useState } from "react";

type Tab = "texto" | "imagem";

type CanalResult = {
  shopee: string;
  instagram: string;
  whatsapp: string;
};

type VariacaoTexto = {
  nome: string;
  shopee: string;
  instagram: string;
  whatsapp: string;
};

function copyToClipboard(text: string) {
  if (!text) return;
  navigator.clipboard.writeText(text);
}

function CanalCard({
  titulo,
  emoji,
  cor,
  texto,
}: {
  titulo: string;
  emoji: string;
  cor: string;
  texto: string;
}) {
  const [copiado, setCopiado] = useState(false);

  function copiar() {
    if (!texto) return;
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1400);
  }

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${cor}`,
        borderRadius: 16,
        padding: 14,
        boxShadow: `0 0 0 1px rgba(255,255,255,0.03), 0 10px 30px rgba(0,0,0,0.18)`,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontWeight: 700,
            fontSize: 18,
            color: "#ffffff",
          }}
        >
          <span>{emoji}</span>
          <span>{titulo}</span>
        </div>

        <button
          onClick={copiar}
          style={{
            background: cor,
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "8px 12px",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          {copiado ? "Copiado!" : "Copiar"}
        </button>
      </div>

      <textarea
        value={texto}
        readOnly
        style={{
          width: "100%",
          minHeight: 180,
          resize: "vertical",
          padding: 12,
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(0,0,0,0.18)",
          color: "#e8eefc",
          outline: "none",
          lineHeight: 1.5,
        }}
      />
    </div>
  );
}

export default function Page() {
  const [tab, setTab] = useState<Tab>("texto");

  // ===== CAMPOS COMUNS =====
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [link, setLink] = useState("");

  // ===== MODO TEXTO COM IA =====
  const [objetivoTexto, setObjetivoTexto] = useState("vender rápido");
  const [loadingTexto, setLoadingTexto] = useState(false);
  const [erroTexto, setErroTexto] = useState("");
  const [variacoesTexto, setVariacoesTexto] = useState<VariacaoTexto[]>([]);
  const [variacaoAtiva, setVariacaoAtiva] = useState(0);

  async function gerarTextoIA() {
    try {
      setErroTexto("");
      setLoadingTexto(true);
      setVariacoesTexto([]);
      setVariacaoAtiva(0);

      const response = await fetch("/api/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, preco, link, objetivo: objetivoTexto }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErroTexto(data?.error || "Erro ao gerar com IA (texto).");
        return;
      }

      setVariacoesTexto(data?.variacoes ?? []);
    } catch (e: any) {
      setErroTexto("Erro ao gerar com IA (texto).");
      console.log("Erro gerarTextoIA:", e?.message ?? e);
    } finally {
      setLoadingTexto(false);
    }
  }

  function copiarTudoTexto() {
    const atual = variacoesTexto[variacaoAtiva];
    if (!atual) return;

    const texto = `🛒 SHOPEE

${atual.shopee}

📸 INSTAGRAM

${atual.instagram}

💬 WHATSAPP

${atual.whatsapp}`;

    copyToClipboard(texto);
  }

  // ===== MODO IMAGEM + MULTICANAL =====
  const [imageBase64, setImageBase64] = useState("");
  const [imagemPreview, setImagemPreview] = useState("");
  const [objetivoImagem, setObjetivoImagem] = useState("vender rápido");

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
    setResultadoImagem({
      shopee: "",
      instagram: "",
      whatsapp: "",
    });

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      setImageBase64(dataUrl);
      setImagemPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  async function gerarImagemIA() {
    try {
      setErroImagem("");
      setLoadingImagem(true);
      setResultadoImagem({
        shopee: "",
        instagram: "",
        whatsapp: "",
      });

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
          objetivo: objetivoImagem,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErroImagem(data?.error || "Erro ao gerar com IA (imagem).");
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

  function copiarTudoImagem() {
    const texto = `🛒 SHOPEE

${resultadoImagem.shopee}

📸 INSTAGRAM

${resultadoImagem.instagram}

💬 WHATSAPP

${resultadoImagem.whatsapp}`;

    copyToClipboard(texto);
  }

  const box: React.CSSProperties = {
    maxWidth: 1180,
    margin: "24px auto",
    padding: 20,
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20,
    fontFamily: "Arial, sans-serif",
    background: "linear-gradient(180deg, #081224 0%, #0b1730 100%)",
    color: "#e8eefc",
    boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
  };

  const label: React.CSSProperties = {
    fontSize: 13,
    opacity: 0.85,
    marginBottom: 6,
    display: "block",
  };

  const input: React.CSSProperties = {
    width: "100%",
    padding: 12,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.22)",
    color: "#e8eefc",
    outline: "none",
    marginTop: 6,
  };

  const btn: React.CSSProperties = {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.06)",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
  };

  const btnPrimary: React.CSSProperties = {
    ...btn,
    background: "linear-gradient(90deg, #16a34a 0%, #22c55e 100%)",
    border: "none",
    boxShadow: "0 8px 24px rgba(34,197,94,0.35)",
  };

  const tabBtn = (active: boolean): React.CSSProperties => ({
    ...btn,
    flex: 1,
    background: active
      ? "linear-gradient(90deg, rgba(59,130,246,0.25) 0%, rgba(34,197,94,0.20) 100%)"
      : "rgba(255,255,255,0.05)",
    border: active
      ? "1px solid rgba(96,165,250,0.45)"
      : "1px solid rgba(255,255,255,0.08)",
  });

  const card: React.CSSProperties = {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 14,
    background: "rgba(255,255,255,0.03)",
  };

  const variacaoAtual = variacoesTexto[variacaoAtiva];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #10244a 0%, #071121 45%, #050c18 100%)",
        padding: 20,
      }}
    >
      <div style={box}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <div style={{ fontSize: 24 }}>🚀</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 26 }}>Shopee Boost PRO</h1>
            <div style={{ opacity: 0.75, marginTop: 4 }}>
              Gerador de anúncios multicanal com IA
            </div>
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: "flex", gap: 10, marginTop: 18, marginBottom: 18 }}>
          <button style={tabBtn(tab === "texto")} onClick={() => setTab("texto")}>
            ✍️ Modo Texto + IA
          </button>
          <button style={tabBtn(tab === "imagem")} onClick={() => setTab("imagem")}>
            🖼️ Imagem + Multicanal
          </button>
        </div>

        {/* CAMPOS BASE */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 14,
            marginBottom: 18,
          }}
        >
          <div>
            <label style={label}>Nome do produto</label>
            <input
              style={input}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Carregador Turbo 20W"
            />
          </div>

          <div>
            <label style={label}>Preço</label>
            <input
              style={input}
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              placeholder="Ex: R$ 49,90"
            />
          </div>

          <div>
            <label style={label}>Link do produto</label>
            <input
              style={input}
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="Cole seu link afiliado"
            />
          </div>
        </div>

        {/* ABA TEXTO */}
        {tab === "texto" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "400px 1fr",
              gap: 18,
              alignItems: "start",
            }}
          >
            <div style={card}>
              <h3 style={{ marginTop: 0 }}>Entrada da campanha</h3>

              <div style={{ marginTop: 14 }}>
                <label style={label}>Objetivo</label>
                <select
                  value={objetivoTexto}
                  onChange={(e) => setObjetivoTexto(e.target.value)}
                  style={input}
                >
                  <option value="vender rápido">Vender rápido</option>
                  <option value="queimar estoque">Queimar estoque</option>
                  <option value="tráfego">Gerar tráfego</option>
                  <option value="engajamento">Engajamento</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button style={{ ...btnPrimary, flex: 1 }} onClick={gerarTextoIA} disabled={loadingTexto}>
                  {loadingTexto ? "Gerando..." : "Gerar 3 variações"}
                </button>

                <button
                  style={btn}
                  onClick={() => {
                    setVariacoesTexto([]);
                    setVariacaoAtiva(0);
                    setErroTexto("");
                  }}
                  disabled={loadingTexto}
                >
                  Limpar
                </button>
              </div>

              {erroTexto && (
                <div
                  style={{
                    marginTop: 12,
                    padding: 12,
                    borderRadius: 12,
                    background: "rgba(255,0,0,0.08)",
                    border: "1px solid rgba(255,80,80,0.25)",
                    color: "#ffd6d6",
                  }}
                >
                  <b>Erro:</b> {erroTexto}
                </div>
              )}

              <p style={{ marginTop: 14, fontSize: 12, opacity: 0.75 }}>
                Esse modo agora gera 3 variações automáticas com IA.
              </p>
            </div>

            <div style={card}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <div>
                  <h3 style={{ margin: 0 }}>Resultados do texto (3 variações)</h3>
                  <div style={{ opacity: 0.72, marginTop: 4 }}>
                    Escolha uma variação e copie por canal
                  </div>
                </div>

                <button style={btn} onClick={copiarTudoTexto}>
                  Copiar tudo
                </button>
              </div>

              {variacoesTexto.length > 0 && (
                <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
                  {variacoesTexto.map((v, i) => (
                    <button
                      key={i}
                      onClick={() => setVariacaoAtiva(i)}
                      style={{
                        ...btn,
                        background:
                          variacaoAtiva === i
                            ? "linear-gradient(90deg, rgba(249,115,22,0.25) 0%, rgba(168,85,247,0.18) 100%)"
                            : "rgba(255,255,255,0.05)",
                        border:
                          variacaoAtiva === i
                            ? "1px solid rgba(249,115,22,0.45)"
                            : "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      {v.nome}
                    </button>
                  ))}
                </div>
              )}

              {variacaoAtual ? (
                <div style={{ display: "grid", gap: 14 }}>
                  <CanalCard
                    titulo="Shopee"
                    emoji="🛒"
                    cor="#f97316"
                    texto={variacaoAtual.shopee}
                  />

                  <CanalCard
                    titulo="Instagram"
                    emoji="📸"
                    cor="#a855f7"
                    texto={variacaoAtual.instagram}
                  />

                  <CanalCard
                    titulo="WhatsApp"
                    emoji="💬"
                    cor="#22c55e"
                    texto={variacaoAtual.whatsapp}
                  />
                </div>
              ) : (
                <div style={{ opacity: 0.7, fontSize: 14 }}>
                  Gere uma campanha para ver as 3 variações aqui.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ABA IMAGEM */}
        {tab === "imagem" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "400px 1fr",
              gap: 18,
              alignItems: "start",
            }}
          >
            <div style={card}>
              <h3 style={{ marginTop: 0 }}>Entrada da campanha</h3>

              <label style={label}>Imagem do produto</label>
              <input
                style={{ ...input, padding: 8 }}
                type="file"
                accept="image/*"
                onChange={(e) => onSelectImage(e.target.files?.[0])}
              />

              {imagemPreview ? (
                <div style={{ marginTop: 12 }}>
                  <div style={{ ...label, marginBottom: 8 }}>Preview</div>
                  <img
                    src={imagemPreview}
                    alt="preview"
                    style={{
                      width: "100%",
                      borderRadius: 14,
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  />
                </div>
              ) : (
                <p style={{ marginTop: 12, fontSize: 12, opacity: 0.75 }}>
                  Selecione uma imagem para ativar a geração por IA.
                </p>
              )}

              <div style={{ marginTop: 14 }}>
                <label style={label}>Objetivo</label>
                <select
                  value={objetivoImagem}
                  onChange={(e) => setObjetivoImagem(e.target.value)}
                  style={input}
                >
                  <option value="vender rápido">Vender rápido</option>
                  <option value="queimar estoque">Queimar estoque</option>
                  <option value="tráfego">Gerar tráfego</option>
                  <option value="engajamento">Engajamento</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button style={{ ...btnPrimary, flex: 1 }} onClick={gerarImagemIA} disabled={loadingImagem}>
                  {loadingImagem ? "Gerando..." : "Gerar com IA"}
                </button>

                <button
                  style={btn}
                  onClick={() => {
                    setImageBase64("");
                    setImagemPreview("");
                    setResultadoImagem({
                      shopee: "",
                      instagram: "",
                      whatsapp: "",
                    });
                    setErroImagem("");
                  }}
                  disabled={loadingImagem}
                >
                  Limpar
                </button>
              </div>

              {erroImagem && (
                <div
                  style={{
                    marginTop: 12,
                    padding: 12,
                    borderRadius: 12,
                    background: "rgba(255,0,0,0.08)",
                    border: "1px solid rgba(255,80,80,0.25)",
                    color: "#ffd6d6",
                  }}
                >
                  <b>Erro:</b> {erroImagem}
                </div>
              )}

              <p style={{ marginTop: 14, fontSize: 12, opacity: 0.75 }}>
                Dica: use print do anúncio ou foto do produto com benefícios visíveis.
              </p>
            </div>

            <div style={card}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <div>
                  <h3 style={{ margin: 0 }}>Resultados (3 canais)</h3>
                  <div style={{ opacity: 0.72, marginTop: 4 }}>
                    Copie individualmente ou tudo de uma vez
                  </div>
                </div>

                <button style={btn} onClick={copiarTudoImagem}>
                  Copiar tudo
                </button>
              </div>

              <div style={{ display: "grid", gap: 14 }}>
                <CanalCard
                  titulo="Shopee"
                  emoji="🛒"
                  cor="#f97316"
                  texto={resultadoImagem.shopee}
                />

                <CanalCard
                  titulo="Instagram"
                  emoji="📸"
                  cor="#a855f7"
                  texto={resultadoImagem.instagram}
                />

                <CanalCard
                  titulo="WhatsApp"
                  emoji="💬"
                  cor="#22c55e"
                  texto={resultadoImagem.whatsapp}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}