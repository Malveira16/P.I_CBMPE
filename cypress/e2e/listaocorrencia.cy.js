describe('Lista de Ocorrências - E2E simples e resiliente', () => {
  const makeOcorrencias = (count = 12) => {
    const statusMap = ['pendente', 'em_andamento', 'concluida', 'nao_atendido'];
    const naturezas = ['Incêndio', 'Acidente', 'Vistoria'];
    return Array.from({ length: count }).map((_, i) => {
      const idx = i + 1;
      return {
        id: idx,
        numeroOcorrencia: `OC-${idx}`,
        dataHoraChamada: new Date(2025, 0, (idx % 28) + 1, 8 + (idx % 6), 15).toISOString(),
        naturezaOcorrencia: { nome: naturezas[idx % naturezas.length] },
        localizacao: { municipio: idx % 2 === 0 ? 'Recife' : 'Olinda', bairro: idx % 3 === 0 ? 'Boa Vista' : 'Centro' },
        viatura: { tipo: idx % 2 === 0 ? 'Auto Bomba' : 'Resgate', numero: `V-${100 + idx}` },
        tipo: { nome: idx % 2 === 0 ? 'Combate' : 'Socorro' },
        statusAtendimento: statusMap[idx % statusMap.length],
        usuario: { nome: idx === 5 ? 'Alice Teste' : `Usuario ${idx}` },
      };
    });
  };

  const ocorrencias = makeOcorrencias(12);
  const naturezasFixture = [...new Set(ocorrencias.map(o => o.naturezaOcorrencia.nome))];

  beforeEach(() => {
    // stub principal (apenas o que realmente precisamos)
    cy.intercept('GET', '**/ocorrencias*', { statusCode: 200, body: ocorrencias }).as('getOcorrencias');
    cy.intercept('GET', '**/naturezasocorrencias*', { statusCode: 200, body: naturezasFixture.map((n, i) => ({ id: i + 1, nome: n })) }).as('getNaturezas');

    // visitar a raiz (HTML) e navegar para a rota da SPA
    cy.visit('https://projetochama.netlify.app');

    cy.get('body').then($body => {
      if ($body.find('a[href="/ocorrencias"]').length) {
        cy.get('a[href="/ocorrencias"]').click();
      } else if ($body.find('a:contains("Ocorrências")').length) {
        cy.contains('a', 'Ocorrências').click();
      } else {
        // fallback: empurra histórico para a rota (funciona em muitas SPAs)
        cy.window().then(win => {
          win.history.pushState({}, 'ocorrencias', '/ocorrencias');
          win.dispatchEvent(new Event('popstate'));
        });
      }
    });

    // não dependemos de todos os aliases — aguardamos o DOM de forma resiliente
    cy.get('table tbody tr', { timeout: 10000 }).then($rows => {
      if ($rows.length === 0) {
        // fallback se o layout não usar tabela: procurar pelo primeiro código OC
        cy.contains('OC-1', { timeout: 8000 }).should('exist');
      } else {
        cy.wrap($rows).should('have.length.at.least', 1);
      }
    });
  });

  it('carrega lista e navega pagina', () => {
    // se houver tabela, verificamos paginação simples (6 por página no componente)
    cy.get('table tbody tr').then($rows => {
      if ($rows.length) {
        cy.wrap($rows).should('have.length', 6);
        cy.contains('button', 'Próximo').click();
        cy.get('table tbody tr').first().should('contain.text', 'OC-7');
      } else {
        cy.contains('OC-1').should('exist');
      }
    });
  });

  it('faz busca livre por responsável e por ID', () => {
    // busca por responsável "Alice"
    cy.get('input[placeholder="Pesquisar por ID, responsável, local..."]').clear().type('Alice');
    cy.get('table tbody tr').should('contain.text', 'Alice Teste');

    // buscar por ID OC-3
    cy.get('input[placeholder="Pesquisar por ID, responsável, local..."]').clear().type('OC-3');
    cy.get('table tbody tr').should('contain.text', 'OC-3');
  });

  it('navega para o formulário de nova ocorrência', () => {
    cy.contains('button', 'Nova Ocorrência').click();
    cy.url({ timeout: 5000 }).should('include', '/ocorrencias/cadastrar');
  });
});