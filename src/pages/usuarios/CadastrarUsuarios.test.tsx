import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";
import { NovoUsuario } from "./CadastrarUsuario";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Cadastrar novo usuário (NovoUsuario)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // evitar alerts reais
    window.alert = jest.fn();
  });

  test("carrega perfis/unidades e envia POST ao salvar", async () => {
    const perfisApi = [
      { id: 1, nome: "Administrador", descricao: "Admin" },
      { id: 2, nome: "Operador", descricao: "Operacional" },
    ];
    const unidadesApi = [
      { id: 10, nome: "2º GB - 2º Grupamento de Bombeiros", sigla: "2GB", pontoBase: "Caruaru" },
      { id: 20, nome: "1º GB - 1º Grupamento", sigla: "1GB", pontoBase: "Recife" },
    ];

    // duas chamadas GET: perfis e unidades (ordem das chamadas conforme useEffect)
    mockedAxios.get
      .mockResolvedValueOnce({ data: perfisApi })
      .mockResolvedValueOnce({ data: unidadesApi });

    // mock do POST de criação do usuário
    mockedAxios.post.mockResolvedValueOnce({ data: { id: 123, nome: "Teste" } });

    render(
      <MemoryRouter>
        <NovoUsuario />
      </MemoryRouter>
    );

    // aguarda perfis / unidades carregarem (perfil aparece como texto/ botão)
    expect(await screen.findByText("Administrador")).toBeInTheDocument();
    // opção da select de unidades
    expect(await screen.findByText(/Caruaru/)).toBeInTheDocument();

    // preencher formulário
    await userEvent.type(screen.getByPlaceholderText(/Nome completo/i), "João Teste");
    await userEvent.type(screen.getByPlaceholderText(/CPF/i), "123.456.789-01");
    await userEvent.type(screen.getByPlaceholderText(/E-mail institucional/i), "TESTE@EXEMPLO.COM ");
    await userEvent.type(screen.getByPlaceholderText(/Telefone/i), "(81) 91234-5678");
    await userEvent.type(screen.getByPlaceholderText(/Matrícula/i), "123456");

    // selecionar unidade (pela label criada: "2º GB - 2º Grupamento de Bombeiros (Caruaru)")
    const selectUnidade = screen.getByLabelText(/Unidade \/ Grupamento/i);
    await userEvent.selectOptions(selectUnidade, String(unidadesApi[0].id));

    // opcional: confirmar perfil clicando no card (garante perfil selecionado)
    const perfilCard = screen.getByText("Administrador");
    await userEvent.click(perfilCard);

    // submeter
    const botaoSalvar = screen.getByRole("button", { name: /Salvar Usuário/i });
    await userEvent.click(botaoSalvar);

    // aguarda chamada ao backend e verifica que o POST foi feito com dados esperados
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining("/users"),
      expect.objectContaining({
        nome: "João Teste",
        matricula: "123456",
        cpf: "12345678901", // máscara removida no submit
        email: "teste@exemplo.com", // sanitizado para lowercase/sem espaços
        senha: "123456",
        perfilId: 1,
        unidadeOperacionalId: unidadesApi[0].id,
      })
    );

    // confirma que alert foi mostrado (sucesso)
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining("Usuário cadastrado com sucesso"));
  });
});