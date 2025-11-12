import { PersonCard, PersonCardHeader, PersonRemoveButton, Grid, Field, FullField } from "../../../components/EstilosPainel.styles";
import { formatCPF } from "../../../utils/formatCPF";

type Pessoa = {
  id: number;
  nome: string;
  sexo?: string;
  etnia?: string;
  idade?: number;
  cpf: string;
  tipoAtendimento: string;
  observacoes: string;
  condicao: string;
  destinoVitima?: string;
  condicaoVitima?: number;
};

type Props = {
  pessoas: Pessoa[];
  addPessoa: () => void;
  updatePessoa: (id: number, patch: Partial<Pessoa>) => void;
  removePessoa: (id: number) => void;
  condicoesVitima: { id: number; tipoLesao: string }[];
  loadingCondicaoVitima: boolean;
};

export default function PessoasSection({
  pessoas,
  addPessoa,
  updatePessoa,
  removePessoa,
  condicoesVitima,
  loadingCondicaoVitima,
}: Props) {
  return (
    <div>
      <div style={{ display: "grid", gap: 12 }}>
        {pessoas.length === 0 && (
          <div style={{ gridColumn: "1 / -1", color: "#64748b", padding: 12, justifyContent: "center", display: "flex" }}>
            Nenhuma pessoa adicionada
          </div>
        )}
        {pessoas.map((p, idx) => (
          <PersonCard key={p.id}>
            <PersonCardHeader>
              <strong>Pessoa {idx + 1}</strong>
              <PersonRemoveButton type="button" onClick={() => removePessoa(p.id)}>
                Remover
              </PersonRemoveButton>
            </PersonCardHeader>
            <Grid>
              <Field>
                <label>Nome Completo</label>
                <input value={p.nome} onChange={(e) => updatePessoa(p.id, { nome: e.target.value })} />
              </Field>
              <Field>
                <label>Idade</label>
                <input
                  type="number"
                  value={p.idade ?? ""}
                  onChange={(e) => updatePessoa(p.id, { idade: e.target.value === "" ? undefined : Number(e.target.value) })}
                />
              </Field>
              <Field>
                <label>Sexo</label>
                <select value={p.sexo || ""} onChange={(e) => updatePessoa(p.id, { sexo: e.target.value })}>
                  <option value="">Selecione o sexo</option>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                  <option value="outro">Outro</option>
                </select>
              </Field>
              <Field>
                <label>Etnia</label>
                <select value={p.etnia || ""} onChange={(e) => updatePessoa(p.id, { etnia: e.target.value })}>
                  <option value="">Selecione a etnia</option>
                  <option value="branca">Branca</option>
                  <option value="preta">Preta</option>
                  <option value="parda">Parda</option>
                  <option value="amarela">Amarela</option>
                  <option value="indigena">Indígena</option>
                  <option value="outro">Outro</option>
                </select>
              </Field>
              <Field>
                <label>CPF</label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={p.cpf}
                  onChange={(e) => updatePessoa(p.id, { cpf: formatCPF(e.target.value) })}
                  maxLength={14}
                />
              </Field>
              <Field>
                <label>Tipo de Atendimento</label>
                <input value={p.tipoAtendimento || ""} onChange={(e) => updatePessoa(p.id, { tipoAtendimento: e.target.value })} />
              </Field>
              <Field>
                <label className="required">Condição</label>
                {loadingCondicaoVitima ? (
                  <select disabled>
                    <option>Carregando condição da vítima...</option>
                  </select>
                ) : (
                  <select value={p.condicao || ""} onChange={(e) => updatePessoa(p.id, { condicao: e.target.value })} required>
                    <option value="">Selecione</option>
                    {condicoesVitima.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.tipoLesao}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
              <Field>
                <label>Destino da Vítima</label>
                <input value={p.destinoVitima || ""} onChange={(e) => updatePessoa(p.id, { destinoVitima: e.target.value })} />
              </Field>
              <FullField>
                <label>Observações</label>
                <textarea placeholder="Anotações sobre a pessoa, estado, etc." value={p.observacoes || ""} onChange={(e) => updatePessoa(p.id, { observacoes: e.target.value })} />
              </FullField>
            </Grid>
          </PersonCard>
        ))}
        <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "center" }}>
          <button type="button" onClick={addPessoa} style={{ padding: "8px 12px", borderRadius: 6 }}>
            + Adicionar Pessoa
          </button>
        </div>
      </div>
    </div>
  );
}