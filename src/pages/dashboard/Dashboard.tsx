/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import {
  ContainerPainel,
  PageTopHeaderRow,
  PageTitle,
  PageSubtitle,
  ActionsRow,
  ResponsiveRow,
  GridColumn,
  MiniGrid,
  BoxInfo,
  SectionTitle,
} from "../../components/EstilosPainel.styles";
import {
  DashboardAlert,
  AlertContent,
  AlertIndicator,
  AlertText,
  MetricCard,
  MetricTrend,
  ChartHeader,
  GraficoRegiaoContainer,
  EixoY,
  ValorEixoY,
  BarraRegiaoContainer,
  BarraRegiao,
  ValorBarra,
  NomeRegiao,
  StatsGrid,
  StatItem,
  GraficoPizza,
} from "./Dashboard.styles";
import { HeatmapOcorrenciasNatureza } from "../../components/Dashboard/HeatmapOcorrenciasNatureza";


type NaturezaOcorrencia = {
  id: string;
  nome: string;
};

type Ocorrencia = {
  naturezaOcorrencia: NaturezaOcorrencia;
  id: string;
  dataTimestamp: number;
  localizacao?: {
    latitude: string;
    longitude: string;
    municipio: string;
    bairro?: string;
  };
  latitude?: string;
  longitude?: string;
  viatura: string;
  tipo: string;
  status: string;
  responsavel: string;
  municipio?: string;
  bairro?: string;
};

export function DashboardOperacional() {
  const [filtroPeriodo, setFiltroPeriodo] = useState<"dia" | "semana" | "mes" | "bimestre" | "trimestre" | "semestre" | "ano">("semana");
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [naturezas, setNaturezas] = useState<NaturezaOcorrencia[]>([]);

  function getPeriodoAnterior(periodo: typeof filtroPeriodo, dataFimAtual: Date) {
    const fimAtual = new Date(dataFimAtual);
    const inicioAnterior = new Date(fimAtual);
    const fimAnterior = new Date(fimAtual);

    switch (periodo) {
      case "dia":
        inicioAnterior.setDate(fimAtual.getDate() - 1);
        fimAnterior.setDate(fimAtual.getDate() - 1);
        break;
      case "semana":
        inicioAnterior.setDate(fimAtual.getDate() - 13); // 7 dias atrás
        fimAnterior.setDate(fimAtual.getDate() - 7);
        break;
      case "mes":
        inicioAnterior.setMonth(fimAtual.getMonth() - 1);
        fimAnterior.setMonth(fimAtual.getMonth() - 1);
        fimAnterior.setDate(new Date(fimAnterior.getFullYear(), fimAnterior.getMonth() + 1, 0).getDate());
        break;
      case "bimestre":
        inicioAnterior.setMonth(fimAtual.getMonth() - 2);
        fimAnterior.setMonth(fimAtual.getMonth() - 2);
        fimAnterior.setDate(new Date(fimAnterior.getFullYear(), fimAnterior.getMonth() + 1, 0).getDate());
        break;
      case "trimestre":
        inicioAnterior.setMonth(fimAtual.getMonth() - 3);
        fimAnterior.setMonth(fimAtual.getMonth() - 3);
        fimAnterior.setDate(new Date(fimAnterior.getFullYear(), fimAnterior.getMonth() + 1, 0).getDate());
        break;
      case "semestre":
        inicioAnterior.setMonth(fimAtual.getMonth() - 6);
        fimAnterior.setMonth(fimAtual.getMonth() - 6);
        fimAnterior.setDate(new Date(fimAnterior.getFullYear(), fimAnterior.getMonth() + 1, 0).getDate());
        break;
      case "ano":
        inicioAnterior.setFullYear(fimAtual.getFullYear() - 1);
        fimAnterior.setFullYear(fimAtual.getFullYear() - 1);
        fimAnterior.setMonth(11);
        fimAnterior.setDate(31);
        break;
      default:
        inicioAnterior.setDate(fimAtual.getDate() - 7);
        fimAnterior.setDate(fimAtual.getDate() - 1);
    }

    inicioAnterior.setHours(0, 0, 0, 0);
    fimAnterior.setHours(23, 59, 59, 999);

    return [inicioAnterior, fimAnterior] as [Date, Date];
  }

  type Trend = "up" | "down" | "neutral";

  function calcularDiferencaAtualAnterior(totalAtual: number, totalAnterior: number): { diff: number; percentual: number; sinal: Trend } {
    const diff = totalAtual - totalAnterior;
    let percentual = 0;

    if (totalAnterior > 0) {
      percentual = (diff / totalAnterior) * 100;
    } else if (totalAtual > 0) {
      percentual = 100; // se antes era zero e agora tem, considera 100%
    }

    const sinal: Trend = diff > 0 ? "up" : diff < 0 ? "down" : "neutral";

    return { diff, percentual, sinal };
  }

  // Buscar dados da API
  useEffect(() => {
    async function fetchData() {
      try {
        const [ocorrenciasResp, naturezasResp] = await Promise.all([
          fetch("https://backend-chama.up.railway.app/ocorrencias"),
          fetch("https://backend-chama.up.railway.app/naturezasocorrencias"),
        ]);

        const [ocorrenciasData] = await Promise.all([
          ocorrenciasResp.json(),
        ]);

        

        const naturezasData: NaturezaOcorrencia[] = await naturezasResp.json();

        setNaturezas(naturezasData);

        const mapped: Ocorrencia[] = Array.isArray(ocorrenciasData)
          ? ocorrenciasData.map((o: any) => {
            const dt = new Date(o.dataHoraChamada || o.dataHora || Date.now());
            return {
              id: o.numeroOcorrencia || `#OCR-${o.id}`,
              dataTimestamp: dt.getTime(),
              naturezaOcorrencia: o.naturezaOcorrencia
                ? { id: o.naturezaOcorrencia.id, nome: o.naturezaOcorrencia.nome }
                : { id: "0", nome: "N/A" },
              localizacao: o.localizacao
                ? {
                  latitude: o.localizacao.latitude,
                  longitude: o.localizacao.longitude,
                  municipio: o.localizacao.municipio,
                  bairro: o.localizacao.bairro,
                }
                : undefined,
              latitude: o.localizacao?.latitude,
              longitude: o.localizacao?.longitude,
              viatura: o.viatura ? `${o.viatura.tipo}-${o.viatura.numero}` : "Sem viatura",
              tipo: o.tipo?.nome || o.tipo || "N/A",
              status:
                o.statusAtendimento === "pendente"
                  ? "Pendente"
                  : o.statusAtendimento === "em_andamento"
                    ? "Em andamento"
                    : o.statusAtendimento === "concluida"
                      ? "Concluída"
                      : o.statusAtendimento === "nao_atendido"
                        ? "Não Atendida"
                        : "Desconhecido",
              responsavel: o.usuario?.nome || "N/A",
              municipio: o.localizacao?.municipio || undefined,
            };
          })
          : [];



        setOcorrencias(mapped);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      }
    }
    fetchData();
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");
  const formatDateCompact = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;

  const [dataInicio, dataFim] = useMemo(() => {
    const hoje = new Date();
    const inicio = new Date(hoje);
    const fim = new Date(hoje);

    switch (filtroPeriodo) {
      case "dia": break;
      case "semana": inicio.setDate(hoje.getDate() - 6); break;
      case "mes": inicio.setMonth(hoje.getMonth() - 1); break;
      case "bimestre": inicio.setMonth(hoje.getMonth() - 2); break;
      case "trimestre": inicio.setMonth(hoje.getMonth() - 3); break;
      case "semestre": inicio.setMonth(hoje.getMonth() - 6); break;
      case "ano": inicio.setFullYear(hoje.getFullYear() - 1); break;
      default: inicio.setDate(hoje.getDate() - 6);
    }
    inicio.setHours(0, 0, 0, 0);
    fim.setHours(23, 59, 59, 999);
    return [inicio, fim];
  }, [filtroPeriodo]);

    const dadosGraficoPeriodo = useMemo(() => {
    const ocorrenciasNoPeriodo = ocorrencias.filter(
      (o) => o.dataTimestamp >= dataInicio.getTime() && o.dataTimestamp <= dataFim.getTime()
    );

    if (filtroPeriodo === "dia") {
      return { dados: [{ data: "Últimas 24h", ocorrencias: ocorrenciasNoPeriodo.length }], orientation: "none" as const };
    }

    const counts: Record<string, number> = {};

    ocorrenciasNoPeriodo.forEach((o) => {
      const dt = new Date(o.dataTimestamp);
      let label = "";

      switch (filtroPeriodo) {
        case "semana": {
          const diaDaSemana = dt.getDay();
          const inicioSemana = new Date(dt); inicioSemana.setDate(dt.getDate() - diaDaSemana);
          const fimSemana = new Date(inicioSemana); fimSemana.setDate(inicioSemana.getDate() + 6);
          label = `${formatDateCompact(inicioSemana)} a ${formatDateCompact(fimSemana)}`;
          break;
        }
        case "mes": {
          // Agrupa por "semanas do mês" e gera label no formato "DD/MM a DD/MM"
          const weekIndex = Math.floor((dt.getDate() - 1) / 7); // 0-based
          const startDay = weekIndex * 7 + 1;
          const lastDayOfMonth = new Date(dt.getFullYear(), dt.getMonth() + 1, 0).getDate();
          const endDay = Math.min(startDay + 6, lastDayOfMonth);
          const inicio = new Date(dt.getFullYear(), dt.getMonth(), startDay);
          const fimSemana = new Date(dt.getFullYear(), dt.getMonth(), endDay);
          label = `${formatDateCompact(inicio)} a ${formatDateCompact(fimSemana)}`;
          break;
        }
        case "bimestre":
        case "trimestre":
        case "semestre":
          label = `${dt.getMonth() + 1}/${dt.getFullYear()}`;
          break;
        case "ano": {
          const trimestre = Math.floor(dt.getMonth() / 3) + 1;
          label = `T${trimestre}/${dt.getFullYear()}`;
          break;
        }
        default:
          label = formatDateCompact(dt);
      }

      counts[label] = (counts[label] || 0) + 1;
    });

    const sortedBuckets = Object.keys(counts).sort((a, b) => {
      const parseLabel = (lbl: string) => {
        if (filtroPeriodo === "semana") {
          const [inicio] = lbl.split(" a ").map(s => {
            const [d, m] = s.split("/").map(Number);
            return new Date(dataInicio.getFullYear(), m - 1, d);
          });
          return inicio.getTime();
        }
        if (filtroPeriodo === "mes") {
          // Esperamos labels no formato "DD/MM a DD/MM" para semanas do mês.
          if (lbl.includes(" a ")) {
            const [inicioStr] = lbl.split(" a ").map(s => s.trim());
            const [d, m] = inicioStr.split("/").map(Number);
            return new Date(dataInicio.getFullYear(), (m || 1) - 1, d || 1).getTime();
          }
          return 0;
        }
        if (filtroPeriodo === "ano") {
          const match = lbl.match(/T(\d+)\/(\d+)/);
          if (match) {
            const trimestre = Number(match[1]);
            const ano = Number(match[2]);
            return new Date(ano, (trimestre - 1) * 3, 1).getTime();
          }
        }
        const [dia, mes, ano] = lbl.split("/").map(Number);
        return new Date(ano || dataInicio.getFullYear(), (mes || 1) - 1, dia || 1).getTime();
      };
      return parseLabel(a) - parseLabel(b);
    });

    const dados = sortedBuckets.map((b) => ({ data: b, ocorrencias: counts[b] }));
    return { dados, orientation: "horizontal" as const };
  }, [filtroPeriodo, ocorrencias, dataInicio, dataFim]);

  const metricasPeriodo = useMemo(() => {
    const [inicioAnterior, fimAnterior] = getPeriodoAnterior(filtroPeriodo, dataFim);

    const totalAtual = ocorrencias.filter(
      o => o.dataTimestamp >= dataInicio.getTime() && o.dataTimestamp <= dataFim.getTime()
    ).length;

    const totalAnterior = ocorrencias.filter(
      o => o.dataTimestamp >= inicioAnterior.getTime() && o.dataTimestamp <= fimAnterior.getTime()
    ).length;

    const pendentesAtual = ocorrencias.filter(
      o => o.dataTimestamp >= dataInicio.getTime() && o.dataTimestamp <= dataFim.getTime() && o.status === "Pendente"
    ).length;

    const pendentesAnterior = ocorrencias.filter(
      o => o.dataTimestamp >= inicioAnterior.getTime() && o.dataTimestamp <= fimAnterior.getTime() && o.status === "Pendente"
    ).length;

    return {
      total: calcularDiferencaAtualAnterior(totalAtual, totalAnterior),
      pendentes: calcularDiferencaAtualAnterior(pendentesAtual, pendentesAnterior),
    };
  }, [ocorrencias, dataInicio, dataFim, filtroPeriodo]);


  const alertaPeriodo = useMemo(() => {
    const [inicioAnterior, fimAnterior] = getPeriodoAnterior(filtroPeriodo, dataFim);

    const totalAtual = ocorrencias.filter(
      o => o.dataTimestamp >= dataInicio.getTime() && o.dataTimestamp <= dataFim.getTime()
    ).length;

    const totalAnterior = ocorrencias.filter(
      o => o.dataTimestamp >= inicioAnterior.getTime() && o.dataTimestamp <= fimAnterior.getTime()
    ).length;

    const aumento = totalAtual - totalAnterior;
    if (aumento <= 0) return null; // não mostrar alerta se não houver aumento


    // Região com maior crescimento (Município - Bairro)
    const contagemAtual: Record<string, number> = {};
    const contagemAnterior: Record<string, number> = {};

    ocorrencias.forEach(o => {
      if (!o.localizacao) return;
      const chave = o.localizacao.municipio + (o.localizacao.bairro ? ` - ${o.localizacao.bairro}` : "");
      if (o.dataTimestamp >= dataInicio.getTime() && o.dataTimestamp <= dataFim.getTime()) {
        contagemAtual[chave] = (contagemAtual[chave] || 0) + 1;
      } else if (o.dataTimestamp >= inicioAnterior.getTime() && o.dataTimestamp <= fimAnterior.getTime()) {
        contagemAnterior[chave] = (contagemAnterior[chave] || 0) + 1;
      }
    });


    let maiorRegiao = "";
    let maiorCrescimento = 0;

    Object.keys(contagemAtual).forEach(regiao => {
      const diff = (contagemAtual[regiao] || 0) - (contagemAnterior[regiao] || 0);
      if (diff > 0 && diff > maiorCrescimento) { // só considerar aumento positivo
        maiorCrescimento = diff;
        maiorRegiao = regiao;
      }
    });

    return { aumento, maiorRegiao, aumentoRegiao: maiorCrescimento };
  }, [ocorrencias, filtroPeriodo, dataInicio, dataFim]);



  const estatisticasRapidas = useMemo(() => {
    const ocorrenciasNoPeriodo = ocorrencias.filter(
      o => o.dataTimestamp >= dataInicio.getTime() && o.dataTimestamp <= dataFim.getTime()
    );

    const counts = {
      pendente: 0,
      em_andamento: 0,
      concluida: 0,
      nao_atendida: 0,
    };

    ocorrenciasNoPeriodo.forEach(o => {
      if (o.status === "Pendente") counts.pendente++;
      else if (o.status === "Em andamento") counts.em_andamento++;
      else if (o.status === "Concluída") counts.concluida++;
      else if (o.status === "Não Atendida") counts.nao_atendida++;
    });

    return counts;
  }, [ocorrencias, dataInicio, dataFim]);



  const dadosPorNatureza = useMemo(() => {
    const ocorrenciasNoPeriodo = ocorrencias.filter(
      o => o.dataTimestamp >= dataInicio.getTime() && o.dataTimestamp <= dataFim.getTime()
    );

    const counts: Record<string, number> = {};

    naturezas.forEach(n => {
      counts[n.nome] = 0; // inicializa todas com 0
    });

    ocorrenciasNoPeriodo.forEach(o => {
      const nome = o.naturezaOcorrencia?.nome;
      if (nome) counts[nome] = (counts[nome] || 0) + 1;
    });

    const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a);
    const topNatureza = sorted.length > 0 ? sorted[0][0] : "N/A";

    return { counts, sorted, topNatureza };
  }, [ocorrencias, naturezas, dataInicio, dataFim]);


  const dadosPorMunicipio = useMemo(() => {
    const ocorrenciasNoPeriodo = ocorrencias.filter(
      o => o.dataTimestamp >= dataInicio.getTime() && o.dataTimestamp <= dataFim.getTime()
    );

    const counts: Record<string, number> = {};

    ocorrenciasNoPeriodo.forEach(o => {
      if (!o.municipio) return; // ignora ocorrências sem município
      const chave = o.bairro ? `${o.municipio} - ${o.bairro}` : o.municipio;
      counts[chave] = (counts[chave] || 0) + 1;
    });

    const sortedTop5 = Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5); // top 5 regiões com mais ocorrências

    return Object.fromEntries(sortedTop5);
  }, [ocorrencias, dataInicio, dataFim]);




  const GraficoBarras = ({
    dados,
    orientation = "vertical"
  }: {
    dados: { data: string; ocorrencias: number }[];
    orientation?: "horizontal" | "vertical" | "none";
    alturaMaxima?: number;
  }) => {
    if (!dados || dados.length === 0) return <div style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280" }}>Nenhuma ocorrência no período selecionado</div>;

    const maxOcorrencias = Math.max(...dados.map(d => d.ocorrencias), 1);

    if (orientation === "none") {
      const total = dados.reduce((s, d) => s + d.ocorrencias, 0);
      return (
        <div style={{ padding: 24, textAlign: "center" }}>
          <div style={{ fontSize: 36, fontWeight: 700 }}>{total}</div>
          <div style={{ color: "#6B7280" }}>Ocorrências no período</div>
        </div>
      );
    }

    if (orientation === "horizontal") {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {dados.map((item, idx) => {
            const pct = Math.round((item.ocorrencias / maxOcorrencias) * 100);
            return (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 120, textAlign: "right", fontSize: 12, color: "#374151" }}>{item.data}</div>
                <div style={{ flex: 1, height: 24, background: "#E5E7EB", borderRadius: 6, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: "#dc2625" }} />
                </div>
                <div style={{ width: 48, textAlign: "right", fontWeight: 600 }}>{item.ocorrencias}</div>
              </div>
            );
          })}
        </div>
      );
    }
  }

  return (
    <ContainerPainel>
      <PageTopHeaderRow>
        <div>
          <PageTitle>Dashboard Operacional</PageTitle>
          <PageSubtitle>Visão geral das métricas e indicadores operacionais</PageSubtitle>
        </div>
        <ActionsRow>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <select
              value={filtroPeriodo}
              onChange={(e) => setFiltroPeriodo(e.target.value as "dia" | "semana" | "mes" | "bimestre" | "trimestre" | "semestre" | "ano")}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: 'white',
                fontSize: '14px'
              }}
            >
              <option value="dia">Hoje</option>
              <option value="semana">Última Semana</option>
              <option value="mes">Último Mês</option>
              <option value="bimestre">Último Bimestre</option>
              <option value="trimestre">Último Trimestre</option>
              <option value="semestre">Último Semestre</option>
              <option value="ano">Último Ano</option>
            </select>
          </div>
        </ActionsRow>
      </PageTopHeaderRow>

      {alertaPeriodo && (
        <DashboardAlert>
          <AlertContent>
            <AlertIndicator />
            <AlertText>
              <strong>
                Alerta: Aumento de {alertaPeriodo.aumento} ocorrência(s) em relação {filtroPeriodo === "dia" ? "a ontem" :
                  filtroPeriodo === "semana" ? "à semana passada" :
                    filtroPeriodo === "mes" ? "ao mês passado" :
                      filtroPeriodo === "bimestre" ? "ao bimestre anterior" :
                        filtroPeriodo === "trimestre" ? "ao trimestre anterior" :
                          filtroPeriodo === "semestre" ? "ao semestre anterior" :
                            "ao ano passado"}
              </strong>
              {alertaPeriodo.maiorRegiao && alertaPeriodo.aumentoRegiao > 0 && (
                <div>Região com maior crescimento: {alertaPeriodo.maiorRegiao} ({alertaPeriodo.aumentoRegiao} ocorrência(s) a mais)</div>
              )}
            </AlertText>
          </AlertContent>
        </DashboardAlert>
      )}

      <ResponsiveRow>
        <HeatmapOcorrenciasNatureza periodo={{ inicio: dataInicio.toISOString(), fim: dataFim.toISOString() }} />
      </ResponsiveRow>


      <ResponsiveRow>
        <GridColumn weight={2}>
          <MiniGrid>
            <MetricCard>
              <h3>{/* total geral no período atual */ String(ocorrencias.filter(o => {
                // mesma lógica do período atual para cálculo rápido do total exibido no card
                const hoje = new Date();
                let dataInicio = new Date();
                switch (filtroPeriodo) {
                  case "dia": dataInicio = new Date(hoje); break;
                  case "semana": dataInicio = new Date(hoje); dataInicio.setDate(hoje.getDate() - 6); break;
                  case "mes": dataInicio = new Date(hoje); dataInicio.setMonth(hoje.getMonth() - 1); break;
                  case "bimestre": dataInicio = new Date(hoje); dataInicio.setMonth(hoje.getMonth() - 2); break;
                  case "trimestre": dataInicio = new Date(hoje); dataInicio.setMonth(hoje.getMonth() - 3); break;
                  case "semestre": dataInicio = new Date(hoje); dataInicio.setMonth(hoje.getMonth() - 6); break;
                  case "ano": dataInicio = new Date(hoje); dataInicio.setFullYear(hoje.getFullYear() - 1); break;
                  default: dataInicio = new Date(hoje); dataInicio.setDate(hoje.getDate() - 6);
                }
                dataInicio.setHours(0, 0, 0, 0);
                const dataFim = new Date(); dataFim.setHours(23, 59, 59, 999);
                return o.dataTimestamp >= dataInicio.getTime() && o.dataTimestamp <= dataFim.getTime();
              }).length)}</h3>
              <span>Total de Ocorrências</span>
              {metricasPeriodo.total.sinal !== "neutral" && (
                <MetricTrend trend={metricasPeriodo.total.sinal}>
                  {metricasPeriodo.total.sinal === "up" ? "▲" : "▼"} {Math.abs(metricasPeriodo.total.percentual).toFixed(1)}% vs {filtroPeriodo === "dia" ? "ontem" :
                    filtroPeriodo === "semana" ? "semana passada" :
                      filtroPeriodo === "mes" ? "mês passado" :
                        filtroPeriodo === "bimestre" ? "bimestre anterior" :
                          filtroPeriodo === "trimestre" ? "trimestre anterior" :
                            filtroPeriodo === "semestre" ? "semestre anterior" :
                              "ano passado"}
                </MetricTrend>
              )}
            </MetricCard>

            <MetricCard>
              <h3>{/* pendentes no período */ String(ocorrencias.filter(o => o.status === "Pendente").length)}</h3>
              <span>Ocorrências Pendentes</span>
              {metricasPeriodo.pendentes.sinal !== "neutral" && (
                <MetricTrend trend={metricasPeriodo.pendentes.sinal}>
                  {metricasPeriodo.pendentes.sinal === "up" ? "+" : "—"} {Math.abs(metricasPeriodo.pendentes.diff)} {filtroPeriodo === "dia" ? "desde ontem" :
                    filtroPeriodo === "semana" ? "vs semana passada" :
                      filtroPeriodo === "mes" ? "vs mês passado" :
                        filtroPeriodo === "bimestre" ? "vs bimestre anterior" :
                          filtroPeriodo === "trimestre" ? "vs trimestre anterior" :
                            filtroPeriodo === "semestre" ? "vs semestre anterior" :
                              "vs ano passado"}
                </MetricTrend>
              )}
            </MetricCard>

            <MetricCard>
              <h3>{dadosPorNatureza.sorted.length > 0 ? dadosPorNatureza.sorted[0][1] : 0}</h3>
              <span>{dadosPorNatureza.topNatureza} (Top 1)</span>
              <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>
                {/* Se quiser, pode listar os próximos mais comuns */}
                {dadosPorNatureza.sorted.slice(1, 4).map(([nome, qtd]) => (
                  <div key={nome}>{nome}: {qtd}</div>
                ))}
              </div>
            </MetricCard>
          </MiniGrid>
        </GridColumn>
      </ResponsiveRow>

      <ResponsiveRow style={{ marginTop: '1.5rem' }}>
        <GridColumn weight={2}>
          <BoxInfo>
            <ChartHeader>
              <SectionTitle>Ocorrência por Período</SectionTitle>
              <div style={{ fontSize: '14px', color: '#6B7280' }}>
                {filtroPeriodo === 'dia' && 'Último dia'}
                {filtroPeriodo === 'semana' && 'Última semana'}
                {filtroPeriodo === 'mes' && 'Último mês'}
                {filtroPeriodo === 'bimestre' && 'Último bimestre'}
                {filtroPeriodo === 'trimestre' && 'Último trimestre'}
                {filtroPeriodo === 'semestre' && 'Último semestre'}
                {filtroPeriodo === 'ano' && 'Último ano'}
              </div>
            </ChartHeader>

            <GraficoBarras dados={dadosGraficoPeriodo.dados} orientation={dadosGraficoPeriodo.orientation} />
          </BoxInfo>
        </GridColumn>

        <GridColumn weight={1}>
          <BoxInfo style={{ textAlign: 'center' }}>
            <SectionTitle>Ocorrência por Tipo</SectionTitle>
            <GraficoPizza
              dados={Object.entries(dadosPorNatureza.counts).map(([nome, qtd]) => ({ label: nome, value: qtd }))}
              cores={['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#F43F5E']}
            />
          </BoxInfo>
        </GridColumn>
      </ResponsiveRow>

      <ResponsiveRow style={{ marginTop: '1.5rem' }}>
        <GridColumn weight={2}>
          <BoxInfo>
            <SectionTitle>Ocorrência por Município</SectionTitle>
            <GraficoRegiaoContainer>
              {/*
                Calcula ticks dinâmicos com base no maior valor de dadosPorMunicipio
                e deixa um espaço à esquerda para os rótulos do eixo Y (marginLeft).
              */}
              {(() => {
                const entries = Object.entries(dadosPorMunicipio)
                  .sort(([, a], [, b]) => b - a);

                const maxValue = entries.length > 0 ? Math.max(...entries.map(([, v]) => v)) : 0;
                // define 5 ticks (0 .. max) com passo arredondado
                const step = Math.max(1, Math.ceil(maxValue / 4));
                const ticks = [0, step, step * 2, step * 3, step * 4];

                return (
                  <>
                    <EixoY>
                      {ticks.slice().reverse().map((valor) => (
                        <ValorEixoY key={valor}>{valor}</ValorEixoY>
                      ))}
                    </EixoY>

                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginLeft: 60, overflowX: 'auto', paddingBottom: 12 }}>
                      {entries.map(([municipio, quantidade]) => {
                        const altura = maxValue > 0 ? (quantidade / maxValue) * 120 : 4;
                        return (
                          <BarraRegiaoContainer key={municipio} style={{ minWidth: 80 }}>
                            <BarraRegiao altura={Math.max(4, altura)} />
                            <ValorBarra>{quantidade}</ValorBarra>
                            <NomeRegiao style={{ whiteSpace: 'nowrap' }}>{municipio}</NomeRegiao>
                          </BarraRegiaoContainer>
                        );
                      })}

                      {entries.length === 0 && (
                        <div style={{ color: '#6B7280', padding: '1rem 0' }}>Nenhuma ocorrência no período</div>
                      )}
                    </div>
                  </>
                );
              })()}
            </GraficoRegiaoContainer>
          </BoxInfo>
        </GridColumn>

        <GridColumn weight={1}>
          <BoxInfo>
            <SectionTitle>Estatísticas Rápidas</SectionTitle>
            <StatsGrid>
              <StatItem style={{ color: '#EF4444' }}>
                <div>{estatisticasRapidas.pendente}</div>
                <div>Pendentes</div>
              </StatItem>

              <StatItem style={{ color: '#3B82F6' }}>
                <div>{estatisticasRapidas.em_andamento}</div>
                <div>Em andamento</div>
              </StatItem>

              <StatItem style={{ color: '#10B981' }}>
                <div>{estatisticasRapidas.concluida}</div>
                <div>Concluídas</div>
              </StatItem>

              <StatItem style={{ color: '#F59E0B' }}>
                <div>{estatisticasRapidas.nao_atendida}</div>
                <div>Não atendidas</div>
              </StatItem>
            </StatsGrid>

          </BoxInfo>
        </GridColumn>
      </ResponsiveRow>
    </ContainerPainel>
  );
}
