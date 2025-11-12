// javascript
describe('Dashboard Operacional (e2e)', () => {
  it('renderiza a tela do dashboard e responde às mudanças de período', () => {
    const now = new Date();
    const older = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);

    const isoNow = now.toISOString();
    const isoOlder = older.toISOString();

    const ocorrenciasStub = [
      { id: 1, numeroOcorrencia: "OCR-001", dataHoraChamada: isoNow, naturezaOcorrencia: { id: "1", nome: "Assalto" }, localizacao: { municipio: "Cidade A", bairro: "Centro", latitude: "0", longitude: "0" }, viatura: { tipo: "PM", numero: "123" }, tipo: { nome: "Urgente" }, statusAtendimento: "pendente", usuario: { nome: "Operador 1" } },
      { id: 2, numeroOcorrencia: "OCR-002", dataHoraChamada: isoNow, naturezaOcorrencia: { id: "2", nome: "Furto" }, localizacao: { municipio: "Cidade B" }, viatura: null, tipo: { nome: "Rotina" }, statusAtendimento: "concluida", usuario: { nome: "Operador 2" } },
      { id: 3, numeroOcorrencia: "OCR-003", dataHoraChamada: isoOlder, naturezaOcorrencia: { id: "1", nome: "Assalto" }, localizacao: { municipio: "Cidade A", bairro: "Centro" }, viatura: null, tipo: { nome: "Rotina" }, statusAtendimento: "concluida", usuario: { nome: "Operador 3" } }
    ];

    const naturezasStub = [
      { id: "1", nome: "Assalto" },
      { id: "2", nome: "Furto" }
    ];

    cy.intercept('GET', 'https://backend-chama.up.railway.app/ocorrencias', { statusCode: 200, body: ocorrenciasStub }).as('getOcorrencias');
    cy.intercept('GET', 'https://backend-chama.up.railway.app/naturezasocorrencias', { statusCode: 200, body: naturezasStub }).as('getNaturezas');

    cy.visit('https://projetochama.netlify.app/dashboard');

    cy.wait('@getOcorrencias');
    cy.wait('@getNaturezas');

    cy.contains('Dashboard Operacional').should('be.visible');
    // usar first() para evitar erro quando houver mais de um <select> na página
    cy.get('select').first().should('have.value', 'semana');
    cy.contains('Ocorrência por Tipo').should('be.visible');

    // mudar período no primeiro select
    cy.get('select').first().select('mes');
    cy.contains('Ocorrência por Tipo').should('be.visible');
    cy.contains('Ocorrência por Município').should('be.visible');

    cy.get('@getOcorrencias').its('response.statusCode').should('eq', 200);
    cy.get('@getNaturezas').its('response.statusCode').should('eq', 200);
  });
});