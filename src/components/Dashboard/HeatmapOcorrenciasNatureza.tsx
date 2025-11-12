/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import HeatmapLayer from "./HeatmapLayer";

type Natureza = {
  id: number;
  nome: string;
};

type Localizacao = {
  latitude: string;
  longitude: string;
  municipio?: string;
};

type Ocorrencia = {
  id: number;
  dataHora: string;
  naturezaOcorrencia?: Natureza;
  localizacao?: Localizacao;
};

type Props = {
  periodo: { inicio: string; fim: string };
};

export function HeatmapOcorrenciasNatureza({ periodo }: Props) {
  const [naturezas, setNaturezas] = useState<Natureza[]>([]);
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [naturezaSelecionada, setNaturezaSelecionada] = useState<number | "">("");

  // Busca naturezas e ocorrências
  useEffect(() => {
  async function fetchData() {
    try {
      const [ocorrenciasResp, naturezasResp] = await Promise.all([
        fetch("https://backend-chama.up.railway.app/ocorrencias"),
        fetch("https://backend-chama.up.railway.app/naturezasocorrencias"),
      ]);

      const [ocorrenciasData, naturezasData] = await Promise.all([
        ocorrenciasResp.json(),
        naturezasResp.json(),
      ]);

      setNaturezas(naturezasData);

      const mapped = Array.isArray(ocorrenciasData)
        ? ocorrenciasData.map((o: any) => ({
            id: o.id,
            dataHora: o.dataHoraChamada || o.dataHora || new Date().toISOString(),
            naturezaOcorrencia: o.naturezaOcorrencia,
            localizacao: o.localizacao,
          }))
        : [];

      setOcorrencias(mapped);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  }

  fetchData();
}, [periodo]);


  // 🔥 Aplica filtro de período e natureza
  const ocorrenciasFiltradas = useMemo(() => {
    const inicio = new Date(periodo.inicio).getTime();
    const fim = new Date(periodo.fim).getTime();

    return ocorrencias.filter((o) => {
      const dataOcorrencia = new Date(o.dataHora).getTime();
      const dentroDoPeriodo = dataOcorrencia >= inicio && dataOcorrencia <= fim;

      const naturezaOk =
        naturezaSelecionada === "" ||
        o.naturezaOcorrencia?.id === naturezaSelecionada;

      return dentroDoPeriodo && naturezaOk && o.localizacao?.latitude && o.localizacao?.longitude;
    });
  }, [ocorrencias, periodo, naturezaSelecionada]);

  const pontosHeatmap: [number, number, (number | undefined)?][] = ocorrenciasFiltradas.map((o) => [
    parseFloat(o.localizacao!.latitude),
    parseFloat(o.localizacao!.longitude),
    1
  ] as [number, number, number?]);


  return (
    <div style={{ width: "100%", height: "400px", position: "relative" }}>
      {/* Filtro de natureza */}
      <div style={{ position: "absolute", top: 10, right: 10, zIndex: 1000 }}>
        <select
          value={naturezaSelecionada}
          onChange={(e) =>
            setNaturezaSelecionada(
              e.target.value ? Number(e.target.value) : ""
            )
          }
          style={{
            padding: "8px 12px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            background: "white",
          }}
        >
          <option value="">Todas as naturezas</option>
          {naturezas.map((n) => (
            <option key={n.id} value={n.id}>
              {n.nome}
            </option>
          ))}
        </select>
      </div>

      {/* Mapa de calor */}
      <MapContainer
        center={[-8.05, -34.9]}
        zoom={10}
        style={{ width: "100%", height: "100%", borderRadius: "12px" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© OpenStreetMap contribuidores'
        />
        <HeatmapLayer points={pontosHeatmap} />
      </MapContainer>
    </div>
  );
}
