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
let headers: any

let requestBody: any = {}

Cypress.Commands.add('login', () => {
  
  // Replace with your app's login page URL
  // or use cy.get('#my-account-button').click() command (or similar) to open a login modal
  cy.visit('/login');
  cy.get('#login-button').click();
  cy.get('input[name="user"]').type(Cypress.env('USER_ID'));
  cy.get('input[name="password"]').type(Cypress.env('PASSWORD'));
  cy.get('input[name="btnSubmit"][value="Continue"]').click();
})

Cypress.Commands.add('getAccessToken', () => {
  cy.log('< Get Token')
  cy.request({
    method: 'POST',
    url: Cypress.env('TOKEN_URL'),
    body: {
      grant_type: 'client_credentials',
      scope: 'openid',
      client_id: Cypress.env('CLIENT_ID') ,
      client_secret: Cypress.env('CLIENT_SECRET') ,
    },
    form: true,
    failOnStatusCode: false
  }).then((res) => {
    cy.wrap(res).as('accessTokenResponse')
    // expect(res.status).to.eq(200)
  })
  cy.log('> Get Token')
})

Cypress.Commands.add('makeAPIRequest', (endPoint: string, methodType: string, params: {} , payload: {}) => {
  let body = {}
  cy.getAccessToken().then(() => {
    cy.get('@accessTokenResponse').then((res: any) => {
      headers={
        Authorization: `Bearer ${res.body.access_token}`,
            'Content-Type': 'application/json'
      }
      if (methodType.toUpperCase() === 'PUT' || methodType.toUpperCase() === 'POST') {
        body = payload
      }
      return cy.request({
        url: endPoint,
        method: methodType,
        body: body,
        headers: headers,
        qs: params,
        failOnStatusCode: false
      })
    })
  })
})
