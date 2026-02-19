"use client";
import { useState } from "react";

export default function Home() {
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [link, setLink] = useState("");
  const [modelo, setModelo] = useState("shopee");
  const [resultado, setResultado] = useState("");
  const [copiado, setCopiado] = useState(false);

  async function gerarDescricao() {
  setResultado("Gerando com IA...");

  const response = await fetch("/api/gerar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, preco, link, modelo }),
  });

  const data = await response.json();

  if (!response.ok) {
    setResultado(data?.error || "Erro ao gerar descrição com IA.");
    return;
  }

  setResultado(data.resultado);
}

  function copiarTexto() {
    navigator.clipboard.writeText(resultado);
    setCopiado(true);

    setTimeout(() => {
      setCopiado(false);
    }, 2000);
  }

  const inputStyle = {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    border: "none"
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f172a",
        color: "#fff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        fontFamily: "Arial"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 500,
          backgroundColor: "#1e293b",
          padding: 25,
          borderRadius: 12
        }}
      >
        <h1 style={{ marginBottom: 20 }}>🚀 Shopee Boost</h1>

        <input
          placeholder="Nome do produto"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="Preço"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="Link do produto"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          style={inputStyle}
        />

        <select
          value={modelo}
          onChange={(e) => setModelo(e.target.value)}
          style={inputStyle}
        >
          <option value="shopee">Modelo Shopee</option>
          <option value="instagram">Modelo Instagram</option>
          <option value="whatsapp">Modelo WhatsApp</option>
        </select>

        <button
          onClick={gerarDescricao}
          style={{
            width: "100%",
            padding: 12,
            backgroundColor: "#22c55e",
            border: "none",
            borderRadius: 8,
            fontWeight: "bold",
            cursor: "pointer",
            marginTop: 10
          }}
        >
          Gerar Descrição
        </button>

        {resultado && (
          <>
            <textarea
              value={resultado}
              readOnly
              style={{
                width: "100%",
                marginTop: 20,
                padding: 10,
                borderRadius: 8,
                border: "none",
                height: 180
              }}
            />

            <button
              onClick={copiarTexto}
              style={{
                width: "100%",
                padding: 10,
                marginTop: 10,
                backgroundColor: copiado ? "#16a34a" : "#3b82f6",
                border: "none",
                borderRadius: 8,
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              {copiado ? "Copiado ✅" : "Copiar Texto"}
            </button>
          </>
        )}
      </div>
    </main>
  );
}
