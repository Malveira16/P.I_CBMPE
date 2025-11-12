describe("Fluxo de Cadastro de Ocorrência (Cypress E2E)", () => {
  beforeEach(() => {
    // intercepts para popular selects e evitar dependências externas
    cy.intercept('GET', '**/naturezasocorrencias', [
      { id: 1, nome: 'Incêndio', sigla: 'INC', pontoBase: '' }
    ]).as('getNaturezas');

    cy.intercept('GET', '**/gruposocorrencias', [
      { id: 10, nome: 'Veículo', naturezaOcorrencia: { id: 1 } }
    ]).as('getGrupos');

    cy.intercept('GET', '**/subgruposocorrencias', [
      { id: 100, nome: 'Carro', grupoOcorrencia: { id: 10 } }
    ]).as('getSubgrupos');

    cy.intercept('GET', '**/unidadesoperacionais', [
      { id: 5, nome: 'CBPE - Base 1', sigla: 'CB', pontoBase: 'Base 1' }
    ]).as('getUnidades');

    cy.intercept('GET', '**/viaturas', [
      { id: 2, tipo: 'Auto Bomba', numero: 'AB-01' }
    ]).as('getViaturas');

    cy.intercept('GET', '**/lesoes', [
      { id: 1, tipoLesao: 'Ileso' }
    ]).as('getLesoes');

    // manter municipios vazio para evitar troca do input para select
    cy.intercept('GET', '**/municipios*', []).as('getMunicipios');

    // intercept para qualquer upload para Cloudinary (retorna url fake)
    cy.intercept('POST', /cloudinary|api.cloudinary|res.cloudinary/, {
      statusCode: 200,
      body: { secure_url: 'https://fake.cloud/assinatura.png' }
    }).as('cloudinaryUpload');

    // intercept para o POST final de ocorrencias (verificaremos o body)
    cy.intercept('POST', '**/ocorrencias', (req) => {
      req.reply({
        statusCode: 201,
        body: { id: 123, ...req.body }
      });
    }).as('postOcorrencia');
  });

  it("preenche o formulário e envia uma ocorrência", () => {
    cy.visit("https://projetochama.netlify.app/ocorrencias/cadastrar");

    // se tiver tela de login na rota, preenche automaticamente (condicional)
    cy.get('body').then(($body) => {
      if ($body.find('input[name="matricula"]').length) {
        cy.get('input[name="matricula"]').clear().type('x');
        cy.get('input[name="senha"]').clear().type('x');
        cy.get('button[type="submit"]').click();
        cy.url({ timeout: 5000 }).should('include', '/dashboard');
        // voltar para o formulário de ocorrência
        cy.visit("http://localhost:5173/ocorrencias/");
      }
    });

    // garantir que selects/populações stubbed carregaram (opcional)
    cy.wait(['@getNaturezas', '@getGrupos', '@getSubgrupos', '@getUnidades', '@getViaturas', '@getLesoes']);

    // Preencher dados principais
    cy.contains('label', 'Natureza da Ocorrência').parent().find('select').select('1');
    cy.contains('label', 'Grupo da Ocorrência').parent().find('select').select('10');
    cy.contains('label', 'Subgrupo da Ocorrência').parent().find('select').select('100');
    cy.contains('label', 'Forma de acionamento').parent().find('select').select('Telefone');
    cy.contains('label', 'Descrição Resumida').parent().find('textarea').type('Teste automatizado Cypress - ocorrência de teste');

    // Localização (o componente inicialmente mostra input "Informe o município")
    cy.get('input[placeholder="Informe o município"]').clear().type('Recife');
    cy.get('input[placeholder="Informe o bairro"]').clear().type('Boa Vista');
    cy.get('input[placeholder="Ex: Av. Norte"]').clear().type('Av. Norte');
    cy.get('input[placeholder="Ex: 458"]').clear().type('458');

    // Equipe / Viatura
    cy.contains('label', 'Unidade Operacional').parent().find('select').select('5');
    cy.contains('label', 'Número da Viatura').parent().find('select').select('2');

    // Adicionar uma pessoa/vítima
    cy.contains('+ Adicionar Pessoa').click();
    cy.get('input').filter('[value=""]').first().type('João de Teste'); // aproximação: primeiro input vazio do card
    // preencher CPF do card recém-criado (formata com pontos)
    cy.get('input[placeholder="000.000.000-00"]').first().type('12345678909');
    // selecionar condição da vítima
    cy.contains('label', 'Condição').parent().find('select').select('1');
    cy.get('textarea[placeholder="Anotações sobre a pessoa, estado, etc."]').type('Sem ferimentos');


    // Salvar ocorrência
    cy.contains('button', 'Salvar Ocorrência').click();

    // aguardar o upload cloudinary (se houver) e o POST final
    cy.wait('@cloudinaryUpload');
    cy.wait('@postOcorrencia').its('request.body').then((body) => {
      // verificações importantes do payload
      expect(body).to.have.property('descricao').that.includes('Cypress');
      expect(body).to.have.property('usuarioId');
      // localizacao deve conter logradouro e bairro preenchidos
      expect(body.localizacao).to.include({ bairro: 'Boa Vista', logradouro: 'Av. Norte', numero: '458' });
    });

    // opcional: verificar que o aplicativo mostra alerta/sucesso (alerts tratadas pelo Cypress)
  });
});
