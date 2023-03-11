
import setupInstituteEntities from '../helpers/institute-set-up-utils';


describe('Sample Tests', () => {
  beforeEach(() => {
    setupInstituteEntities.setUpDistrictAndSchool();
   // cy.fixture('auth').as('auth');
    // Cypress starts out with a blank slate for each test
    // so we must tell it to visit our website with the `cy.visit()` command.
    // Since we want to visit the same URL at the start of all our tests,
    // we include it in our beforeEach function so that it runs before each test
    //cy.visit('https://example.cypress.io/todo')
  })


  it('loads the homepage', () => {
    cy.visit('/')
    //cy.get('h1').contains('Welcome to the-internet') // Implicit assertion
    //cy.get('ul li a').its('length').should('be.at.least', 44) // Explicit assertion
  })
  it('authenticates EDXUser', () => {
    cy.login();
  })
})
