/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
    ContainerPainel,
    PageTitle,
    PageSubtitle,
    ResponsiveRow,
    GridColumn,
    BoxInfo,
    Grid,
    Field,
    Table,
    ActionsRow,
    PageTopHeaderRow,
    PageTopHeaderColumn,
    TableWrapper,
    MobileCard,
    MobileCardWrapper,
} from "../../components/EstilosPainel.styles";
import { PlusIcon, PencilIcon, TrashIcon, DotsThreeIcon } from "@phosphor-icons/react";
import { Button } from "../../components/Button";
import { useNavigate } from "react-router-dom";

export function GestaoUsuarios() {
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({
        search: "",
        perfil: "Todos",
        unidade: "Todos",
        status: "Todos",
    });
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const navigate = useNavigate();

    const handleLogin = () => {
        navigate("/usuarios/cadastrar");
    };

    // Buscar usuários do backend
    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                const response = await axios.get("https://backend-chama.up.railway.app/users");
                // mapear para o formato esperado na tabela
                const mapped = response.data.map((u: any) => ({
                    nome: u.nome,
                    email: u.email,
                    matricula: u.matricula,
                    perfil: u.perfil?.nome ?? "Sem perfil",
                    unidade: u.unidadeOperacional?.nome ?? "Sem unidade",
                    status: u.status ? "Ativo" : "Inativo",
                    ultimoAcesso: u.ultimoAcesso ?? "-",
                    foto: u.foto ?? `https://i.pravatar.cc/50?img=${Math.floor(Math.random() * 70) + 1}`,
                }));
                setUsuarios(mapped);
            } catch (error: any) {
                console.error("Erro ao carregar usuários:", error.response?.data || error.message);
                alert("Erro ao carregar usuários: " + (error.response?.data?.message || error.message));
            }
            finally {
                setLoading(false);
            }
        };
        fetchUsuarios();
    }, []);

    // opções de filtros
    const perfis = useMemo(() => ["Todos", ...Array.from(new Set(usuarios.map(u => u.perfil)))], [usuarios]);
    const unidades = useMemo(() => ["Todos", ...Array.from(new Set(usuarios.map(u => u.unidade)))], [usuarios]);
    const statuses = useMemo(() => ["Todos", ...Array.from(new Set(usuarios.map(u => u.status)))], [usuarios]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Ativo": return "#dcfce7";
            case "Inativo": return "#fee2e2";
            case "Suspenso": return "#e0f2fe";
            default: return "#f1f5f9";
        }
    };

    const getStatusTextColor = (status: string) => {
        switch (status) {
            case "Ativo": return "#166534";
            case "Inativo": return "#991b1b";
            case "Suspenso": return "#075985";
            default: return "#334155";
        }
    };

    // filtragem
    const filteredUsuarios = useMemo(() => {
        const s = filters.search.trim().toLowerCase();
        return usuarios.filter(u => {
            const matchSearch =
                !s ||
                u.nome.toLowerCase().includes(s) ||
                u.email.toLowerCase().includes(s) ||
                u.matricula.toLowerCase().includes(s);

            const matchPerfil = filters.perfil === "Todos" || u.perfil === filters.perfil;
            const matchUnidade = filters.unidade === "Todos" || u.unidade === filters.unidade;
            const matchStatus = filters.status === "Todos" || u.status === filters.status;

            return matchSearch && matchPerfil && matchUnidade && matchStatus;
        });
    }, [usuarios, filters]);

    useEffect(() => { setCurrentPage(1); }, [filters]);
    useEffect(() => {
        const tp = Math.max(1, Math.ceil(filteredUsuarios.length / pageSize));
        if (currentPage > tp) setCurrentPage(tp);
    }, [filteredUsuarios, currentPage]);

    const totalPages = Math.ceil(filteredUsuarios.length / pageSize);
    const paginatedUsuarios = filteredUsuarios.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    if (loading) return <p>Carregando usuários...</p>;

    return (
        <ContainerPainel>
            <PageTopHeaderRow>
                <PageTopHeaderColumn>
                    <PageTitle>Gestão de Usuários</PageTitle>
                    <PageSubtitle>Gerencie contas, perfis e permissões do sistema.</PageSubtitle>
                </PageTopHeaderColumn>
                <PageTopHeaderColumn>
                    <ActionsRow>
                        <Button
                            variant="danger"
                            text={<><PlusIcon size={16} style={{ marginRight: 8 }} weight="bold" />Adicionar Usuário</>}
                            onClick={handleLogin}
                        />
                    </ActionsRow>
                </PageTopHeaderColumn>
            </PageTopHeaderRow>

            {/* FILTROS */}
            <ResponsiveRow>
                <GridColumn>
                    <BoxInfo>
                        <Grid>
                            <Field>
                                <label>Busca</label>
                                <input
                                    type="text"
                                    placeholder="Nome, e-mail ou matrícula..."
                                    value={filters.search}
                                    onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                                />
                            </Field>

                            <Field>
                                <label>Perfil</label>
                                <select
                                    value={filters.perfil}
                                    onChange={e => setFilters(f => ({ ...f, perfil: e.target.value }))}
                                >
                                    {perfis.map((p, idx) => <option key={idx} value={p}>{p}</option>)}
                                </select>
                            </Field>

                            <Field>
                                <label>Unidade</label>
                                <select
                                    value={filters.unidade}
                                    onChange={e => setFilters(f => ({ ...f, unidade: e.target.value }))}
                                >
                                    {unidades.map((u, idx) => <option key={idx} value={u}>{u}</option>)}
                                </select>
                            </Field>

                            <Field>
                                <label>Status</label>
                                <select
                                    value={filters.status}
                                    onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
                                >
                                    {statuses.map((s, idx) => <option key={idx} value={s}>{s}</option>)}
                                </select>
                            </Field>
                        </Grid>
                    </BoxInfo>
                </GridColumn>
            </ResponsiveRow>

            {/* TABELA */}
            <ResponsiveRow>
                <GridColumn>
                    <BoxInfo>
                        <TableWrapper>
                            <Table>
                                <thead>
                                    <tr>
                                        <th>Usuário</th>
                                        <th>Perfil</th>
                                        <th>Unidade</th>
                                        <th>Status</th>
                                        <th>Último Acesso</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedUsuarios.map((u, i) => (
                                        <tr key={i}>
                                            <td style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                                <img src={u.foto} alt={u.nome} style={{ width: 40, height: 40, borderRadius: "50%" }} />
                                                <div style={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    minWidth: 0,
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap"
                                                }}>
                                                    <strong style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis" }}>{u.nome}</strong>
                                                    <div style={{ fontSize: "0.85rem", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                        {u.email}
                                                    </div>
                                                    <div style={{ fontSize: "0.8rem", color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                        Mat: {u.matricula}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{u.perfil}</td>
                                            <td style={{ maxWidth: 120, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                {u.unidade}
                                            </td>

                                            <td>
                                                <span
                                                    style={{
                                                        background: getStatusColor(u.status),
                                                        color: getStatusTextColor(u.status),
                                                        padding: "4px 10px",
                                                        borderRadius: "20px",
                                                        fontWeight: 500,
                                                        fontSize: "0.8rem",
                                                    }}
                                                >
                                                    {u.status}
                                                </span>
                                            </td>
                                            <td>{u.ultimoAcesso}</td>
                                            <td>
                                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                                    <button style={{ border: "none", background: "transparent", cursor: "pointer", color: "#475569" }}>
                                                        <PencilIcon size={18} />
                                                    </button>
                                                    <button style={{ border: "none", background: "transparent", cursor: "pointer", color: "#dc2625" }}>
                                                        <TrashIcon size={18} />
                                                    </button>
                                                    <button style={{ border: "none", background: "transparent", cursor: "pointer", color: "#475569" }}>
                                                        <DotsThreeIcon size={20} weight="bold" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </TableWrapper>

                        <MobileCardWrapper>
                            {filteredUsuarios.map((u, i) => (
                                <MobileCard key={i}>
                                    <div className="user-header">
                                        <img src={u.foto} alt={u.nome} />
                                        <div className="user-info">
                                            <strong>{u.nome}</strong>
                                            <div className="email">{u.email}</div>
                                            <div className="matricula">Mat: {u.matricula}</div>
                                        </div>
                                    </div>
                                    <div className="user-details">
                                        <div className="detail"><span>Perfil:</span> {u.perfil}</div>
                                        <div className="detail"><span>Unidade:</span> {u.unidade}</div>
                                        <div className="detail status" style={{ background: getStatusColor(u.status), color: getStatusTextColor(u.status) }}>
                                            {u.status}
                                        </div>
                                        <div className="detail"><span>Último Acesso:</span> {u.ultimoAcesso}</div>
                                    </div>
                                    <div className="actions">
                                        <button><PencilIcon size={18} /></button>
                                        <button><TrashIcon size={18} /></button>
                                        <button><DotsThreeIcon size={20} weight="bold" /></button>
                                    </div>
                                </MobileCard>
                            ))}
                        </MobileCardWrapper>


                        {/* Paginação */}
                        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1rem" }}>
                            <Button
                                text="Anterior"
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                variant="secondary"
                            />
                            <span style={{ alignSelf: "center" }}>{currentPage} / {totalPages || 1}</span>
                            <Button
                                text="Próximo"
                                onClick={() => setCurrentPage(Math.min((totalPages || 1), currentPage + 1))}
                                variant="secondary"
                            />
                        </div>

                        <div style={{ textAlign: "center", marginTop: "1.25rem" }}>
                            <p style={{ color: "#64748b" }}>
                                Mostrando {paginatedUsuarios.length} de {filteredUsuarios.length} usuários filtrados
                            </p>
                        </div>
                    </BoxInfo>
                </GridColumn>
            </ResponsiveRow>
        </ContainerPainel>
    );
}
