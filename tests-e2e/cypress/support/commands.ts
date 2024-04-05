// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
import 'cypress-downloadfile/lib/downloadFileCommand';

let headers: any

let requestBody: any = {}

function createLoginSession(username: string = Cypress.env('USER_ID'), password: string = Cypress.env('PASSWORD')) {
  cy.session(
    [username, password],
    () => {
      cy.visit('/login');
      cy.get('#login-button-bceid').click();
      cy.get('input[name="user"]').type(username);
      cy.get('input[name="password"]').type(password);
      cy.get('input[name="btnSubmit"][value="Continue"]').click();
      cy.url({timeout: 10000}).should('eq', Cypress.env('url').base_url + '/');
    },
    {
      validate() {
        cy.request(Cypress.env('url').session_token).its('status').should('eq', 200);
      }
    })
}

Cypress.Commands.add('login', createLoginSession);
Cypress.Commands.add('logout', () => { cy.request(Cypress.env('url').logout) });

Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
});

declare global {
    namespace Cypress {
        interface Chainable {
            /**
             * Custom command to download files.
             * @example cy.downloadFile('https://example.com/file.pdf', 'myFolder', 'file.pdf')
             */
            downloadFile(url: string, directory: string, filename: string): Chainable<Element>
        }
    }
}