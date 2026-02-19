"use client";

import { useMemo, useState } from "react";

type Modelo = "shopee" | "instagram" | "whatsapp";

export default function Home() {
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [link, setLink] = useState("");
  const [modelo, setModelo] = useState<Modelo>("shopee");

  const [resultado, setResultado] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const podeGerar = useMemo(() => {
    return nome.trim() && preco.trim() && link.trim() && modelo;
  }, [nome, preco, link, modelo]);

  async function gerarDescricao() {
    setCopiado(false);

    if (!podeGerar) {
      setResultado("Preencha Nome, Preço e Link e selecione o modelo.");
      return;
    }

    setCarregando(true);
    setResultado("Gerando com IA...");

    // Timeout para não travar eternamente
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000); // 20s

    try {
      const response = await fetch("/api/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, preco, link, modelo }),
        signal: controller.signal,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setResultado(
          (data && (data.error || data.message)) ||
            `Erro na API (${response.status})`
        );
        return;
      }

      setResultado(data?.resultado || "Sem resposta da IA.");
    } catch (err: any) {
      if (err?.name === "AbortError") {
        setResultado("Demorou demais (timeout). Tente novamente.");
      } else {
        setResultado("Erro de conexão. Tente novamente.");
      }
    } finally {
      clearTimeout(timeout);
      setCarregando(false);
    }
  }

  async function copiarTexto() {
    try {
      await navigator.clipboard.writeText(resultado || "");
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      setResultado("Não consegui copiar. Selecione o texto e copie manualmente.");
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "#e2e8f0",
        display: "flex",
        justifyContent: "center",
        padding: 24,
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji"',
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "#111c33",
          borderRadius: 16,
          padding: 20,
          boxShadow: "0 10px 30px rgba(0,0,0,.35)",
        }}
      >
        <h1 style={{ margin: 0, marginBottom: 16, fontSize: 22 }}>
          🚀 Shopee Boost
        </h1>

        <label style={{ display: "block", marginBottom: 8, opacity: 0.9 }}>
          Nome do produto
        </label>
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: Carregador Turbo 20W"
          style={inputStyle}
        />

        <label style={{ display: "block", marginBottom: 8, marginTop: 14, opacity: 0.9 }}>
          Preço
        </label>
        <input
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          placeholder="Ex: 49,90"
          style={inputStyle}
        />

        <label style={{ display: "block", marginBottom: 8, marginTop: 14, opacity: 0.9 }}>
          Link do produto
        </label>
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="Cole seu link afiliado"
          style={inputStyle}
        />

        <label style={{ display: "block", marginBottom: 8, marginTop: 14, opacity: 0.9 }}>
          Modelo
        </label>
        <select
          value={modelo}
          onChange={(e) => setModelo(e.target.value as Modelo)}
          style={selectStyle}
        >
          <option value="shopee">Modelo Shopee</option>
          <option value="instagram">Modelo Instagram</option>
          <option value="whatsapp">Modelo WhatsApp</option>
        </select>

        <button
          onClick={gerarDescricao}
          disabled={carregando}
          style={{
            marginTop: 16,
            width: "100%",
            padding: "14px 12px",
            borderRadius: 12,
            border: "none",
            background: carregando ? "#16a34a99" : "#16a34a",
            color: "white",
            fontWeight: 700,
            fontSize: 16,
            cursor: carregando ? "not-allowed" : "pointer",
          }}
        >
          {carregando ? "Gerando..." : "Gerar Descrição"}
        </button>

        <div style={{ marginTop: 14 }}>
          <textarea
            value={resultado}
            readOnly
            placeholder="Seu texto vai aparecer aqui..."
            style={textareaStyle}
          />
        </div>

        <button
          onClick={copiarTexto}
          disabled={!resultado || carregando}
          style={{
            marginTop: 10,
            width: "100%",
            padding: "12px 12px",
            borderRadius: 12,
            border: "none",
            background: "#3b82f6",
            color: "white",
            fontWeight: 700,
            cursor: !resultado || carregando ? "not-allowed" : "pointer",
            opacity: !resultado || carregando ? 0.6 : 1,
          }}
        >
          {copiado ? "✅ Copiado!" : "Copiar Texto"}
        </button>

        <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
          Dica: Se der erro, ele aparecerá aqui no texto (não fica travado).
        </div>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 12px",
  borderRadius: 12,
  border: "1px solid rgba(148,163,184,.25)",
  background: "#0b1224",
  color: "#e2e8f0",
  outline: "none",
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 12px",
  borderRadius: 12,
  border: "1px solid rgba(148,163,184,.25)",
  background: "#0b1224",
  color: "#e2e8f0",
  outline: "none",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 180,
  resize: "vertical",
  padding: 12,
  borderRadius: 12,
  border: "1px solid rgba(148,163,184,.25)",
  background: "#0b1224",
  color: "#e2e8f0",
  outline: "none",
};
