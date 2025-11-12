describe('Gestão de Usuários - filtros e paginação', () => {
  const makeUsers = () => {
    return Array.from({ length: 25 }).map((_, i) => {
      const idx = i + 1;
      return {
        id: idx,
        nome: `User ${idx}`,
        email: `user${idx}@example.com`,
        matricula: `M${1000 + idx}`,
        perfil: { nome: idx % 2 === 0 ? 'Operador' : 'Administrador' },
        unidadeOperacional: { nome: idx % 3 === 0 ? 'Base 2' : 'Base 1' },
        status: idx % 4 === 0 ? false : true, // alguns inativos
        ultimoAcesso: null,
        foto: null,
      };
    });
  };

  const users = makeUsers();
  const pageSize = 10;
  const totalPages = Math.ceil(users.length / pageSize);
  const countOperador = users.filter(u => u.perfil.nome === 'Operador').length;
  const countBase2 = users.filter(u => u.unidadeOperacional.nome === 'Base 2').length;
  const countInativo = users.filter(u => u.status === false).length;

  beforeEach(() => {
    cy.intercept('GET', '**/users', { statusCode: 200, body: users }).as('getUsers');
    cy.visit('https://projetochama.netlify.app/usuarios');
    cy.wait(10000, '@getUsers');
  });

  it('exibe lista paginada por padrão e navega entre páginas', () => {
    // tabela na primeira página deve ter pageSize linhas
    cy.get('table tbody tr').should('have.length', pageSize);

    // primeira linha tem User 1
    cy.get('table tbody tr').first().should('contain.text', 'User 1');

    // indicador de página 1 / totalPages
    cy.contains('button', 'Anterior').parent().find('span').should('contain.text', `1 / ${totalPages}`);

    // avançar página
    cy.contains('button', 'Próximo').click();
    cy.contains('button', 'Anterior').parent().find('span').should('contain.text', `2 / ${totalPages}`);
    // primeira linha da página 2 deve ser User 11 (10 por página)
    cy.get('table tbody tr').first().should('contain.text', 'User 11');

    // ir para última página
    cy.contains('button', 'Próximo').click();
    cy.contains('button', 'Anterior').parent().find('span').should('contain.text', `3 / ${totalPages}`);
    // última página terá os itens restantes (25 -> 5)
    cy.get('table tbody tr').should('have.length', users.length - pageSize * 2);
  });

  it('filtra por busca e reinicia paginação', () => {
    // buscar por um usuário específico (único)
    cy.get('input[placeholder="Nome, e-mail ou matrícula..."]').clear().type('User 23');
    // espera debounce/atualização (se houver)
    cy.wait(200);
    // deve exibir apenas o resultado correspondente
    cy.get('table tbody tr').should('have.length', 1).and('contain.text', 'User 23');
    // paginação mostra 1 / 1
    cy.contains('button', 'Anterior').parent().find('span').should('contain.text', '1 / 1');
  });

  it('filtra por Perfil (Operador) e mostra paginação correta', () => {
    cy.contains('label', 'Perfil').parent().find('select').select('Operador');
    cy.wait(200);
    const pagesFiltered = Math.ceil(countOperador / pageSize) || 1;
    const expectedVisible = Math.min(countOperador, pageSize);
    cy.get('table tbody tr').should('have.length', expectedVisible);
    cy.contains('button', 'Anterior').parent().find('span').should('contain.text', `1 / ${pagesFiltered}`);
    // garantir que todas as linhas mostradas possuem "Operador" na coluna de perfil
    cy.get('table tbody tr').each($tr => {
      cy.wrap($tr).find('td').eq(1).should('contain.text', 'Operador');
    });
  });

  it('filtra por Unidade (Base 2) e Status (Inativo) combinados', () => {
    // selecionar Unidade
    cy.contains('label', 'Unidade').parent().find('select').select('Base 2');
    // selecionar Status -> aqui opções são "Todos" e nomes reais dos status ("Ativo"/"Inativo")
    cy.contains('label', 'Status').parent().find('select').select('Inativo');
    cy.wait(200);
    // calcular quantos usuários atendem ambos os filtros a partir do fixture
    const combined = users.filter(u => (u.unidadeOperacional.nome === 'Base 2') && (u.status === false));
    const pagesCombined = Math.ceil(combined.length / pageSize) || 1;
    cy.get('table tbody tr').should('have.length', Math.min(combined.length, pageSize));
    cy.contains('button', 'Anterior').parent().find('span').should('contain.text', `1 / ${pagesCombined}`);
    // se houver resultados, verificar que a coluna unidade e status batem
    if (combined.length > 0) {
      cy.get('table tbody tr').first().within(() => {
        cy.get('td').eq(2).should('contain.text', 'Base 2'); // coluna unidade
        cy.get('td').eq(3).should('contain.text', 'Inativo'); // coluna status
      });
    } else {
      // nenhum resultado: tabela pode mostrar 0 linhas
      cy.get('table tbody tr').should('have.length', 0);
    }
  });

  it('botão "Adicionar Usuário" navega para a tela de cadastro', () => {
    cy.contains('button', 'Adicionar Usuário').click();
    // valida que navegou para o formulário de cadastro
    cy.url().should('include', '/usuarios/cadastrar');
  });
});