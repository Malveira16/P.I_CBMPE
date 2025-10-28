/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ContainerPainel,
  PageTopHeaderRow,
  PageTitle,
  PageSubtitle,
  BoxInfo,
  SectionTitle,
  Grid,
  Field,
  DateRange,
  ActionsRow,
  TableWrapper,
  Table,
  ResponsiveRow,
  GridColumn,
  AuditStatCard,
  SavedFilterCard,
  MiniGrid,
  SavedFiltersBoxInfo,
  PageTopHeaderColumn,
  MobileCardWrapper,
  MobileCard
} from "../../components/EstilosPainel.styles";

import {
  PlusIcon,
  EyeIcon,
  UserIcon,
  InfoIcon
} from "@phosphor-icons/react";
import { Button } from "../../components/Button";

interface FiltroSalvo {
  id: string;
  name: string;
  values: typeof defaultFilters;
}

const STATUS_OPTIONS = ["Pendente", "Em andamento", "Concluída", "Não Atendida"];

const defaultFilters = {
  periodoInicio: "",
  periodoFim: "",
  tipo: "todos",
  regiao: "todas",
  viatura: "",
  buscaLivre: "",
  status: [...STATUS_OPTIONS],
  natureza: "todos",
};

export function ListaOcorrencias() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const [savedFilters, setSavedFilters] = useState<FiltroSalvo[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newFilterName, setNewFilterName] = useState("");

  const [ocorrencias, setOcorrencias] = useState<any[]>([]);

  const [regioesDisponiveis, setRegioesDisponiveis] = useState<string[]>([]);
  const [naturezasOcorrencias, setNaturezasOcorrencias] = useState<string[]>([]);

  useEffect(() => {
    async function fetchOptions() {
      try {
        // regiões
        const regResp = await fetch("https://backend-chama.up.railway.app/regioes");
        const regData = await regResp.json();
        setRegioesDisponiveis(regData.map((r: any) => r.nome)); // ajusta conforme seu JSON

        // tipos
        const tipoResp = await fetch("https://backend-chama.up.railway.app/naturezasocorrencias");
        const tipoData = await tipoResp.json();
        setNaturezasOcorrencias(tipoData.map((t: any) => t.nome)); // ajusta conforme seu JSON
      } catch (err) {
        console.error("Erro ao buscar opções:", err);
      }
    }
    fetchOptions();
  }, []);

  useEffect(() => {
    async function fetchOcorrencias() {
      try {
        const response = await fetch("https://backend-chama.up.railway.app/ocorrencias");
        const data = await response.json();

        // Mapeamento do retorno para o formato que a tabela usa
        const mapped = data.map((o: any) => {
          const dataObj = new Date(o.dataHoraChamada);

          const dataFormatada = dataObj.toLocaleDateString("pt-BR");
          const horaFormatada = dataObj.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          });

          return {
            id: o.numeroOcorrencia || `#OCR-${o.id}`,
            data: dataFormatada,
            hora: horaFormatada,
            dataTimestamp: dataObj.getTime(), // <-- ADICIONADO: timestamp para comparações
            dataISO: dataObj.toISOString(),   // opcional: para debug/exibição
            natureza: o.naturezaOcorrencia?.nome || "N/A",
            // localizacao já no formato "municipio - bairro"
            localizacao: o.localizacao
              ? `${o.localizacao.municipio} - ${o.localizacao.bairro}`
              : "Não informada",
            viatura: o.viatura
              ? `${o.viatura.tipo}-${o.viatura.numero}`
              : "Sem viatura",
            // garante nome do tipo se existir
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
          };
        });

        setOcorrencias(mapped);

        // popula regioesDisponiveis a partir das localizacoes únicas presentes
        const uniqueLocs: string[] = Array.from(new Set(
          mapped
            .map((m: any) => m.localizacao)
            .filter((l: string) => l && l !== "Não informada")
        )).map(String);
        setRegioesDisponiveis(uniqueLocs);
      } catch (error) {
        console.error("Erro ao buscar ocorrências:", error);
      }
    }

    fetchOcorrencias();
  }, []);



  // filtragem
  const filteredOcorrencias = useMemo(() => {
    return ocorrencias.filter(o => {
      const { periodoInicio, periodoFim, tipo, regiao, viatura, buscaLivre, status, natureza } = filters;

      const matchTipo = tipo === "todos" || ((o.tipo || "").toLowerCase() === tipo.toLowerCase());
      const matchRegiao = regiao === "todas" || o.localizacao.toLowerCase().includes(regiao.toLowerCase());
      const matchNatureza = natureza === "todos" || o.natureza.toLowerCase() === natureza.toLowerCase();
      const matchViatura = !viatura || o.viatura.toLowerCase().includes(viatura.toLowerCase());
      const matchBusca = !buscaLivre ||
        o.id.toLowerCase().includes(buscaLivre.toLowerCase()) ||
        o.responsavel.toLowerCase().includes(buscaLivre.toLowerCase()) ||
        o.localizacao.toLowerCase().includes(buscaLivre.toLowerCase());

      const matchStatus = status.includes(o.status);

      // Comparar por timestamps (milissegundos) para evitar problemas de formato
      let matchPeriodo = true;
      const ts = o.dataTimestamp ?? (new Date(o.data).getTime());
      if (periodoInicio) {
        const startTs = new Date(periodoInicio + "T00:00:00").getTime();
        matchPeriodo = ts >= startTs;
      }
      if (periodoFim) {
        const endTs = new Date(periodoFim + "T23:59:59.999").getTime();
        matchPeriodo = matchPeriodo && ts <= endTs;
      }

      return matchTipo && matchRegiao && matchNatureza && matchViatura && matchBusca && matchPeriodo && matchStatus;
    });
  }, [ocorrencias, filters]);


  // paginação
  const totalPages = Math.ceil(filteredOcorrencias.length / pageSize);
  const paginatedOcorrencias = filteredOcorrencias.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => setCurrentPage(1), [filters]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Em andamento": return "#3B82F6";
      case "Concluída": return "#10B981";
      case "Pendente": return "#EF4444";
      case "Não Atendida": return "#F59E0B";
      default: return "#6B7280";
    }
  };

  const handleNovaOcorrencia = () => navigate("/ocorrencias/cadastrar");

  const handleSalvarFiltro = () => setShowModal(true);

  const handleConfirmSave = () => {
    if (!newFilterName.trim()) return alert("Informe um nome para o filtro!");
    setSavedFilters([
      ...savedFilters,
      { id: String(Date.now()), name: newFilterName, values: { ...filters } },
    ]);
    setNewFilterName("");
    setShowModal(false);
  };

  const handleApplySavedFilter = (filtro: FiltroSalvo) => setFilters(filtro.values);

  return (
    <ContainerPainel>
      <PageTopHeaderRow>
        <PageTopHeaderColumn>
          <PageTitle>Lista de Ocorrências</PageTitle>
          <PageSubtitle>Visualize e gerencie todas as ocorrências registradas com filtros avançados.</PageSubtitle>
        </PageTopHeaderColumn>
        <ActionsRow>
          <Button variant="danger" text={<><PlusIcon size={16} style={{ marginRight: 8 }} color="#fff" weight="bold" />Nova Ocorrência</>} onClick={handleNovaOcorrencia} />
        </ActionsRow>
      </PageTopHeaderRow>

      <ResponsiveRow>

        <GridColumn weight={1}>

          <MiniGrid>

            <AuditStatCard>
              <h3>{ocorrencias.length}</h3>
              <span>Total de Ocorrências</span>
            </AuditStatCard>

            <AuditStatCard>
              <h3>{ocorrencias.filter(o => o.status === "Pendente").length}</h3>
              <span>Pendentes</span>
            </AuditStatCard>

            <AuditStatCard>
              <h3>{ocorrencias.filter(o => o.status === "Em andamento").length}</h3>
              <span>Em Andamento</span>
            </AuditStatCard>

            <AuditStatCard>
              <h3>{ocorrencias.filter(o => o.status === "Concluída").length}</h3>
              <span>Concluídas</span>
            </AuditStatCard>

            <AuditStatCard>
              <h3>{ocorrencias.filter(o => o.status === "Não Atendida").length}</h3>
              <span>Não Atendidas</span>
            </AuditStatCard>

          </MiniGrid>

        </GridColumn>

      </ResponsiveRow>

      <ResponsiveRow>
        {/* Coluna Filtros */}
        <GridColumn weight={3}>
          <BoxInfo>
            <Grid>
              <Field>
                <label>Período</label>
                <DateRange>
                  <input type="date" value={filters.periodoInicio} onChange={e => setFilters(f => ({ ...f, periodoInicio: e.target.value }))} />
                  <input type="date" value={filters.periodoFim} onChange={e => setFilters(f => ({ ...f, periodoFim: e.target.value }))} />
                </DateRange>
              </Field>
              <Field>
                <label>Natureza da Ocorrência</label>
                <select
                  value={filters.natureza}
                  onChange={e => setFilters(f => ({ ...f, natureza: e.target.value }))}
                >
                  <option value="todos">Todos</option>
                  {naturezasOcorrencias.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </Field>
              <Field>
                <label>Localização</label>
                <select
                  value={filters.regiao}
                  onChange={e => setFilters(f => ({ ...f, regiao: e.target.value }))}
                >
                  <option value="todas">Todas</option>
                  {regioesDisponiveis.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </Field>
              <Field>
                <label>Viatura / Equipe</label>
                <input type="text" placeholder="Digite para buscar..." value={filters.viatura} onChange={e => setFilters(f => ({ ...f, viatura: e.target.value }))} />
              </Field>
              <Field>
                <label>Status</label>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px" }}>
                  {STATUS_OPTIONS.map(s => (
                    <label key={s} style={{ fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <input
                        type="checkbox"
                        checked={filters.status.includes(s)}
                        onChange={e => {
                          setFilters(f => {
                            const newStatus = e.target.checked
                              ? [...f.status, s]
                              : f.status.filter(item => item !== s);
                            return { ...f, status: newStatus.length === 0 ? [] : newStatus };
                          });
                        }}
                      />
                      {s}
                    </label>
                  ))}
                </div>
              </Field>

              <Field>
                <label>Busca Livre</label>
                <input type="text" placeholder="Pesquisar por ID, responsável, local..." value={filters.buscaLivre} onChange={e => setFilters(f => ({ ...f, buscaLivre: e.target.value }))} />
              </Field>
            </Grid>

            <ActionsRow>
              <Button text="Limpar" onClick={() => setFilters(defaultFilters)} variant="secondary" />
              <Button text="Salvar Filtro" onClick={handleSalvarFiltro} variant="primary" />
            </ActionsRow>
          </BoxInfo>
        </GridColumn>

        {/* Coluna Filtros Salvos */}
        <GridColumn weight={1}>
          <SavedFiltersBoxInfo>
            <SectionTitle>Filtros Salvos</SectionTitle>
            <Grid>
              {savedFilters.length === 0 && <p style={{ fontSize: '13px', color: '#6b7280' }}>Nenhum filtro salvo.</p>}

              {savedFilters.map(f => {
                const { tipo, regiao, viatura, periodoInicio, periodoFim, natureza, buscaLivre } = f.values;

                const descricaoParts: string[] = [];

                if (tipo && tipo !== "todos") descricaoParts.push(`Tipo: ${tipo}`);
                if (regiao && regiao !== "todas") descricaoParts.push(`Região: ${regiao}`);
                if (viatura) descricaoParts.push(`Viatura: ${viatura}`);
                if (natureza && natureza !== "todos") descricaoParts.push(`Natureza: ${natureza}`);
                if (buscaLivre) descricaoParts.push(`Busca: ${buscaLivre}`);
                if (f.values.status && f.values.status.length > 0) {
                  if (f.values.status.length !== 4) descricaoParts.push(`Status: ${f.values.status.join(", ")}`);
                }
                if (periodoInicio || periodoFim) {
                  descricaoParts.push(`Período: ${periodoInicio || "..."} até ${periodoFim || "..."}`);
                }

                const descricao = descricaoParts.length > 0 ? descricaoParts.join(", ") : "Todos os registros";

                const handleRemoveFilter = (id: string) => {
                  setSavedFilters(prev => prev.filter(item => item.id !== id));
                };

                return (
                  <SavedFilterCard key={f.id}>
                    <div
                      className="filter-name"
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                      onClick={() => handleApplySavedFilter(f)}
                    >
                      <span>{f.name}</span>
                      <button
                        style={{
                          border: "none",
                          background: "transparent",
                          color: "#ef4444",
                          cursor: "pointer",
                          fontWeight: "bold",
                          marginLeft: "8px",
                        }}
                        onClick={(e) => {
                          e.stopPropagation(); // evita que o clique aplique o filtro
                          handleRemoveFilter(f.id);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                    <div className="filter-description">{descricao}</div>
                  </SavedFilterCard>
                );
              })}

            </Grid>

          </SavedFiltersBoxInfo>
        </GridColumn>
      </ResponsiveRow>

      {/* Modal simples */}
      {
        showModal && (
          <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center",
            zIndex: 9999
          }}>
            <BoxInfo style={{ width: 300, padding: "1rem" }}>
              <h3>Salvar Filtro</h3>
              <input
                type="text"
                placeholder="Nome do filtro"
                value={newFilterName}
                onChange={e => setNewFilterName(e.target.value)}
                style={{ width: "100%", marginBottom: "1rem", padding: "4px 8px" }}
              />
              <ActionsRow>
                <Button text="Cancelar" onClick={() => setShowModal(false)} variant="secondary" />
                <Button text="Salvar" onClick={handleConfirmSave} variant="primary" />
              </ActionsRow>
            </BoxInfo>
          </div>
        )
      }
      <ResponsiveRow>
        <GridColumn weight={3}>
          <BoxInfo>
            <SectionTitle>Resultados</SectionTitle>
            <TableWrapper>
              <Table>
                <thead>
                  <tr>
                    <th></th>
                    <th>ID</th>
                    <th>Data/Hora</th>
                    <th>Tipo</th>
                    <th>Localização</th>
                    <th>Viatura</th>
                    <th>Status</th>
                    <th>Responsável</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOcorrencias.map(o => (
                    <tr key={o.id}>
                      <td><input type="checkbox" /></td>
                      <td>{o.id}</td>
                      <td>{o.data}<br /><small>{o.hora}</small></td>
                      <td>{o.natureza}</td>
                      <td>{o.localizacao}</td>
                      <td>{o.viatura}</td>
                      <td style={{ color: getStatusColor(o.status), fontWeight: 600 }}>{o.status}</td>
                      <td>{o.responsavel}</td>
                      <td>
                        <button style={{ border: "none", paddingRight: "0.5rem", background: "transparent", cursor: "pointer" }}>
                          <EyeIcon size={18} />
                        </button>
                        <button style={{ border: "none", paddingRight: "0.5rem", background: "transparent", cursor: "pointer" }}>
                          <UserIcon size={18} />
                        </button>
                        <button style={{ border: "none", background: "transparent", cursor: "pointer" }}>
                          <InfoIcon size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableWrapper>

            <MobileCardWrapper>
              {paginatedOcorrencias.map((o, i) => (
              <MobileCard key={i}>
                <div className="ocorrencia-header">
                  <div className="ocorrencia-info">
                    <strong>Ocorrência #{o.id}</strong>
                    <div className="data-hora"> {o.data} <small>{o.hora}</small>
                    </div> <div className="tipo">{o.natureza}</div> </div>
                    <div className="status"
                    style={{ color: getStatusColor(o.status),
                    fontWeight: 600 }}> {o.status} </div> </div>
                <div className="ocorrencia-details">
                  <div className="detail"><span>Localização:</span> {o.localizacao}</div>
                  <div className="detail"><span>Viatura:</span> {o.viatura}</div>
                  <div className="detail"><span>Responsável:</span> {o.responsavel}</div>
                </div>

                <div className="actions">
                  <button title="Visualizar" style={{ border: "none", background: "transparent", cursor: "pointer" }}>
                    <EyeIcon size={18} />
                  </button>
                  <button title="Atribuir" style={{ border: "none", background: "transparent", cursor: "pointer" }}>
                    <UserIcon size={18} />
                  </button>
                  <button title="Detalhes" style={{ border: "none", background: "transparent", cursor: "pointer" }}>
                    <InfoIcon size={18} />
                  </button>
                </div>
              </MobileCard>
            ))} </MobileCardWrapper>


            {/* Paginação */}
            <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1rem" }}>
              <Button text="Anterior" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} variant="secondary" />
              <span style={{ alignSelf: "center" }}>{currentPage} / {totalPages || 1}</span>
              <Button text="Próximo" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} variant="secondary" />
            </div>

            <div style={{ textAlign: "center", marginTop: "1rem", color: "#64748b" }}>
              Mostrando {paginatedOcorrencias.length} de {filteredOcorrencias.length} ocorrências filtradas
            </div>
          </BoxInfo>
        </GridColumn>
      </ResponsiveRow>

    </ContainerPainel >
  );
}
