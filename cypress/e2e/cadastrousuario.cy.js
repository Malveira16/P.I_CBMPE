describe("Cadastro de Usuário (Cypress E2E)", () => {
  beforeEach(() => {
    // stub perfis e unidades para não depender do backend
    cy.intercept('GET', '**/perfis', [
      { id: 1, nome: 'Administrador', descricao: 'Acesso total' },
      { id: 2, nome: 'Operador', descricao: 'Acesso operacional' }
    ]).as('getPerfis');

    cy.intercept('GET', '**/unidadesoperacionais', [
      { id: 5, nome: 'CBPE - Base 1', sigla: 'CB', pontoBase: 'Base 1' }
    ]).as('getUnidades');

    // intercept para o POST de criação de usuário (capturamos o body para asserções)
    cy.intercept('POST', '**/users', (req) => {
      req.reply({
        statusCode: 201,
        body: { id: 77, ...req.body }
      });
    }).as('postUser');
  });

  it("preenche todos os campos obrigatórios, seleciona perfis/unidade/patente/função e salva", () => {
    cy.visit("https://projetochama.netlify.app/usuarios/cadastrar");

    // se houver tela de login (detectar campo senha), faz login rápido e volta
    cy.get('body').then(($body) => {
      if ($body.find('input[name="senha"]').length) {
        cy.get('input[name="matricula"]').clear().type('x');
        cy.get('input[name="senha"]').clear().type('x');
        cy.get('button[type="submit"]').click();
        cy.url({ timeout: 5000 }).should('include', '/dashboard');
        cy.visit("https://projetochama.netlify.app/usuarios/cadastrar");
      }
    });

    // aguarda os stubs carregarem
    cy.wait(['@getPerfis', '@getUnidades']);

    // Preencher informações pessoais
    cy.contains('label', 'Nome completo').parent().find('input').clear().type('João da Silva');
    cy.get('input[placeholder="000.000.000-00"]').clear().type('12345678909'); // CPF (será sanitizado no submit)
    cy.get('input[placeholder="usuario@cbm.pe.gov.br"]').clear().type('joao.silva@cbm.pe.gov.br');
    cy.get('input[placeholder="(00) 00000-0000"]').clear().type('(81) 99999-0000');
    cy.contains('label', 'Matrícula').parent().find('input').clear().type('123456');

    // Toggle status (opcional: alterna para testar o componente)
    cy.contains('label', 'Status do usuário').parent().find('button[aria-pressed]').click();

    // Selecionar perfil (clica no card do perfil Operador)
    cy.contains('Operador').click();

    // Selecionar unidade (by value id)
    cy.contains('label', 'Unidade / Grupamento').parent().find('select').select('5');

    // Selecionar patente e função (por texto da option)
    cy.contains('label', 'Patente').parent().find('select').select('Cabo');
    cy.contains('label', 'Função').parent().find('select').select('Combate a Incêndio');

    // Submeter o formulário
    cy.contains('button', 'Salvar Usuário').click();

    // Verificar POST e payload enviado ao backend
    cy.wait('@postUser').its('request.body').then((body) => {
      expect(body).to.have.property('nome', 'João da Silva');
      expect(body).to.have.property('matricula', '123456');
      // CPF deve ser enviado sem formatação
      expect(body).to.have.property('cpf', '12345678909');
      expect(body).to.have.property('email', 'joao.silva@cbm.pe.gov.br');
      // senha default definida no frontend
      expect(body).to.have.property('senha', '123456');
      // perfilId corresponde ao perfil clicado (Operador -> id 2)
      expect(body).to.have.property('perfilId', 2);
      // unidadeOperacionalId deve ser numérico (5)
      expect(body).to.have.property('unidadeOperacionalId', 5);
      // patente e funcao são strings
      expect(body).to.have.property('patente').that.is.a('string');
      expect(body).to.have.property('funcao').that.is.a('string');
    });

    // opcional: confirmar que a aplicação mostra feedback (alert), caso exista
  });
});