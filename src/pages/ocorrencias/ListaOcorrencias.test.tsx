import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { ListaOcorrencias } from "./ListaOcorrencias";
import { act } from "react";

describe("ListaOcorrencias", () => {
  const regioes = [{ nome: "Recife" }, { nome: "Cabo de Santo Agostinho" }];
  const naturezas = [{ id: 1, nome: "Incêndio" }, { id: 2, nome: "Atendimento Pré-Hospitalar" }];
  const ocorrencias = [
    {
      id: 30,
      numeroOcorrencia: "OCR202510280011",
      dataHoraChamada: "2025-10-19T18:45:00Z",
      statusAtendimento: "concluida",
      naturezaOcorrencia: { id: 1, nome: "Incêndio" },
      localizacao: { municipio: "Cabo de Santo Agostinho", bairro: "Porto de Suape" },
      viatura: { tipo: "MR", numero: "1031" },
      tipo: { nome: "Incêndio em Meio de Transporte Terrestre" },
      usuario: { nome: "Maria Souza" },
    },
    {
      id: 31,
      numeroOcorrencia: "OCR202510280012",
      dataHoraChamada: "2025-10-20T10:00:00Z",
      statusAtendimento: "pendente",
      naturezaOcorrencia: { id: 2, nome: "Atendimento Pré-Hospitalar" },
      localizacao: { municipio: "Recife", bairro: "Centro" },
      viatura: { tipo: "US", numero: "205" },
      tipo: { nome: "Atendimento" },
      usuario: { nome: "João Silva" },
    },
  ];

  beforeEach(() => {
    jest.resetAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).fetch = jest.fn().mockImplementation(() => {
      const payloads = [regioes, naturezas, ocorrencias];
      return Promise.resolve({ ok: true, json: () => Promise.resolve(payloads.shift()) });
    });
  });

  test("carrega opções e exibe ocorrências na tabela", async () => {
    await act(async () => {
    render(
      <MemoryRouter>
        <ListaOcorrencias />
      </MemoryRouter>
    )});

    // verifica selects
    const selectRegiao = screen.getByLabelText("Localização") as HTMLSelectElement;
    expect(within(selectRegiao).getByRole("option", { name: "Recife" })).toBeInTheDocument();
    expect(within(selectRegiao).getByRole("option", { name: "Cabo de Santo Agostinho - Porto de Suape" })).toBeInTheDocument();
  });
});
