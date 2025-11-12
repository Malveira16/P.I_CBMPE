import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserIcon, TreeViewIcon, ShieldCheckIcon } from "@phosphor-icons/react";
import { Breadcrumb } from "../../components/Breadcrumb";
import {
  ContainerPainel,
  PageTopHeader,
  PageTitle,
  PageSubtitle,
  RequiredNotice,
  ResponsiveRow,
  GridColumn,
  BoxInfo,
  SectionTitle,
  Grid,
  Field,
  ToggleSwitch,
  ToggleRow,
} from "../../components/EstilosPainel.styles";
import { PerfilCard } from "../../components/NewUserPerfilCard/NewUserPerfilCards";
import { Button } from "../../components/Button";
import axios from "axios";
import { formatCPF } from "../../utils/formatCPF";
import { formatPhone } from "../../utils/formatPhone";

export function NovoUsuario() {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  const [matricula, setMatricula] = useState("");
  const [perfil, setPerfil] = useState("Administrador");
  const [status, setStatus] = useState("Ativo");
  const [unidade, setUnidade] = useState("");
  const [patente, setPatente] = useState("");
  const [funcao, setFuncao] = useState("");

  const [perfisDisponiveis, setPerfisDisponiveis] = useState<
    { id: number; nome: string; descricao: string; color?: string }[]
  >([]);

  const [loadingPerfis, setLoadingPerfis] = useState(true);

  useEffect(() => {
    const fetchPerfis = async () => {
      try {
        const response = await axios.get("https://backend-chama.up.railway.app/perfis");
        // opcional: adicionar cores aos perfis
        const cores = ["#dc2625", "#f59e0b", "#3b82f6", "#10b981"];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const perfisComCor = response.data.map((p: any, idx: number) => ({
          ...p,
          color: cores[idx % cores.length],
        }));
        setPerfisDisponiveis(perfisComCor);
      } catch (error) {
        console.error("Erro ao carregar perfis:", error);
        alert("Erro ao carregar perfis");
      } finally {
        setLoadingPerfis(false);
      }
    };

    fetchPerfis();
  }, []);


  const [unidadesOperacionais, setUnidadesOperacionais] = useState<
    { id: number; nome: string; sigla: string; pontoBase: string }[]
  >([]);
  const [loadingUnidades, setLoadingUnidades] = useState(true);

  useEffect(() => {
    const fetchUnidades = async () => {
      try {
        const response = await axios.get("https://backend-chama.up.railway.app/unidadesoperacionais");
        setUnidadesOperacionais(response.data);
      } catch (error) {
        console.error("Erro ao carregar unidades:", error);
        alert("Erro ao carregar unidades operacionais");
      } finally {
        setLoadingUnidades(false);
      }
    };

    fetchUnidades();
  }, []);

  const sanitizeEmail = (value: string) => {
    let v = value.trim().toLowerCase();
    v = v.replace(/\s+/g, "");
    v = v.replace(/[^a-z0-9@._+-]/g, "");
    const parts = v.split("@");
    if (parts.length > 2) v = parts.shift() + "@" + parts.join("");
    return v.slice(0, 254);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Busca o perfil selecionado a partir da lista carregada
    const selectedPerfil = perfisDisponiveis.find((p) => p.nome === perfil);

    // Monta o objeto no formato que o backend espera
    const newUser = {
      nome,
      matricula,
      cpf: cpf.replace(/\D/g, ""),
      patente,
      funcao,
      email,
      senha: "123456",
      perfilId: selectedPerfil?.id ?? null,
      unidadeOperacionalId: unidade ? Number(unidade) : null,
    };

    try {
      const response = await axios.post("https://backend-chama.up.railway.app/users", newUser);
      console.log("✅ Usuário cadastrado com sucesso:", response.data);
      alert("Usuário cadastrado com sucesso!");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("❌ Erro ao cadastrar usuário:", error);
        const remoteMessage = (error.response?.data as { message?: string } | undefined)?.message;
        alert("Erro ao cadastrar usuário: " + (remoteMessage ?? error.message));
      } else {
        console.error("❌ Erro ao cadastrar usuário:", error);
        alert("Erro ao cadastrar usuário: " + String(error));
      }
    }
  };



  return (
    <ContainerPainel>
      <PageTopHeader>
        <Breadcrumb
          items={[
            { label: "Usuários", onClick: () => navigate("/usuarios") },
            { label: "Cadastrar Usuário" },
          ]}
        />
        <PageTitle>Cadastrar novo usuário</PageTitle>
        <PageSubtitle>Preencha os dados do usuário e defina o tipo de perfil de acesso.</PageSubtitle>
        <RequiredNotice>
          <span>*</span>Campos obrigatórios
        </RequiredNotice>
      </PageTopHeader>

      <form onSubmit={handleSubmit}>
        <ResponsiveRow>
          <GridColumn weight={1}>
            {/* INFORMAÇÕES PESSOAIS */}
            <BoxInfo>
              <SectionTitle>
                <UserIcon size={22} weight="fill" />
                Informações Pessoais
              </SectionTitle>
              <Grid>
                <Field>
                  <label className="required">Nome completo</label>
                  <input
                    type="text"
                    placeholder="Ex: João da Silva"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                  />
                </Field>

                <Field>
                  <label className="required">CPF</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(formatCPF(e.target.value))}
                    maxLength={14}

                  />
                </Field>

                <Field>
                  <label className="required">E-mail institucional</label>
                  <input
                    type="email"
                    placeholder="usuario@cbm.pe.gov.br"
                    value={email}
                    onChange={(e) => setEmail(sanitizeEmail(e.target.value))}

                  />
                </Field>

                <Field>
                  <label className="required">Telefone</label>
                  <input
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={telefone}
                    onChange={(e) => setTelefone(formatPhone(e.target.value))}
                    maxLength={15}

                  />
                </Field>

                <Field>
                  <label className="required">Matrícula</label>
                  <input
                    type="text"
                    placeholder="Ex: 123456"
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value)}

                  />
                </Field>

                <Field>
                  <label>Status do usuário</label>
                  <ToggleRow>
                    <ToggleSwitch
                      type="button"
                      active={status === "Ativo"}
                      onClick={() => setStatus((s) => (s === "Ativo" ? "Inativo" : "Ativo"))}
                      aria-pressed={status === "Ativo"}
                      aria-label="Alternar status do usuário"
                    />
                    <span>{status}</span>
                  </ToggleRow>
                </Field>
              </Grid>
            </BoxInfo>
          </GridColumn>
        </ResponsiveRow>
        <ResponsiveRow>
          <GridColumn weight={1}>
            {/* PERMISSÕES E FUNÇÃO */}
            <BoxInfo>
              <SectionTitle>
                <ShieldCheckIcon size={22} weight="fill" />
                Permissões e Função
              </SectionTitle>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "1rem",
                }}
              >
                {loadingPerfis ? (
                  <p>Carregando perfis...</p>
                ) : (
                  perfisDisponiveis.map((p) => (
                    <PerfilCard
                      key={p.id}
                      titulo={p.nome}
                      descricao={p.descricao}
                      ativo={perfil === p.nome}
                      color={p.color}
                      onClick={() => setPerfil(p.nome)}
                    />
                  ))
                )}
              </div>
            </BoxInfo>

          </GridColumn>
        </ResponsiveRow>
        <ResponsiveRow>
          <GridColumn weight={1}>
            {/* VINCULAÇÃO HIERÁRQUICA */}
            <BoxInfo>
              <SectionTitle>
                <TreeViewIcon size={22} weight="fill" />
                Vinculação Hierárquica
              </SectionTitle>
              <Grid>
                <Field>
                  <label>Unidade / Grupamento</label>
                  {loadingUnidades ? (
                    <select disabled>
                      <option>Carregando unidades...</option>
                    </select>
                  ) : (
                    <select
                      value={unidade}
                      onChange={(e) => setUnidade(e.target.value)}
                      required
                    >
                      <option value="">Selecione a unidade</option>
                      {unidadesOperacionais.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.nome} ({u.pontoBase})
                        </option>
                      ))}
                    </select>
                  )}
                  
                </Field>
                <Field>
                  <label>Patente</label>
                  <select value={patente} onChange={(e) => setPatente(e.target.value)}>
                    <option value="">Selecione a patente</option>

                    <optgroup label="Oficiais">
                      <option>Coronel</option>
                      <option>Tenente-Coronel</option>
                      <option>Major</option>
                      <option>Capitão</option>
                      <option>1º Tenente</option>
                      <option>2º Tenente</option>
                      <option>Aspirante a Oficial</option>
                    </optgroup>

                    <optgroup label="Praças">
                      <option>Subtenente</option>
                      <option>1º Sargento</option>
                      <option>2º Sargento</option>
                      <option>3º Sargento</option>
                      <option>Cabo</option>
                      <option>Soldado</option>
                    </optgroup>

                    <optgroup label="Em formação">
                      <option>Aluno Oficial</option>
                      <option>Aluno Soldado</option>
                    </optgroup>
                  </select>
                </Field>
                <Field>
                  <label>Função</label>
                  <select value={funcao} onChange={(e) => setFuncao(e.target.value)}>
                    <option value="">Selecione a função</option>

                    {/* Funções operacionais */}
                    <option>Combate a Incêndio</option>
                    <option>Busca e Salvamento</option>
                    <option>Atendimento Pré-Hospitalar (APH)</option>
                    <option>Brigadista</option>
                    <option>Socorrista</option>
                    <option>Motorista Operacional</option>
                    <option>Mergulhador de Resgate</option>
                    <option>Operador de Resgate Veicular</option>

                    {/* Funções técnicas e de apoio */}
                    <option>Vistoriador / Fiscal de Segurança Contra Incêndio</option>
                    <option>Perito em Incêndio</option>
                    <option>Instrutor / Treinador</option>
                    <option>Operador de Comunicação</option>
                    <option>Técnico de Material Bélico</option>
                    <option>Técnico em Defesa Civil</option>
                    <option>Condutor de Cães (Cinotécnico)</option>

                    {/* Funções administrativas / estratégicas */}
                    <option>Comandante / Subcomandante</option>
                    <option>Chefe de Seção / Divisão</option>
                    <option>Planejamento e Gestão Operacional</option>
                    <option>Assessoria Técnica / Jurídica</option>
                  </select>
                </Field>

              </Grid>
            </BoxInfo>

          </GridColumn>
        </ResponsiveRow>

        <ResponsiveRow>
          <GridColumn weight={1}>
            {/* BOTÕES */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <Button
                text="Cancelar"
                type="button"
                variant="secondary"
                onClick={() => console.log("Cancelar")}
                style={{ padding: "8px 14px", borderRadius: 6 }}
              />
              <Button
                text="Salvar Usuário"
                type="submit"
                variant="danger"
                style={{ padding: "8px 14px", borderRadius: 6 }}
              />
            </div>
          </GridColumn>
        </ResponsiveRow>
      </form>
    </ContainerPainel>
  );
}