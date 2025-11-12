import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";
import { GestaoUsuarios } from "./GestaoUsuarios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

test("renderiza lista de usuários após carregar do backend", async () => {
  const apiUsers = [
    {
      nome: "João Silva",
      email: "joao@ex.com",
      matricula: "CBMPE00001",
      perfil: { nome: "Admin" },
      unidadeOperacional: { nome: "1º GB" },
      status: true,
      ultimoAcesso: "2025-10-20T12:00:00.000Z",
    },
    {
      nome: "Maria Souza",
      email: "maria@ex.com",
      matricula: "CBMPE00002",
      perfil: { nome: "Operador" },
      unidadeOperacional: { nome: "2º GB" },
      status: false,
      ultimoAcesso: null,
    },
  ];

  mockedAxios.get.mockResolvedValueOnce({ data: apiUsers });

  render(
    <MemoryRouter>
      <GestaoUsuarios />
    </MemoryRouter>
  );

  // seleciona a tabela de usuários
  const tabela = await screen.findByRole("table");

  // verifica os nomes dentro da tabela
  expect(within(tabela).getByText("João Silva")).toBeInTheDocument();
  expect(within(tabela).getByText("Maria Souza")).toBeInTheDocument();

  // verifica também e-mail de um dos usuários
  expect(within(tabela).getByText("joao@ex.com")).toBeInTheDocument();
});
