

declare namespace Cypress {
    interface Chainable<Subject> {
        login(): Chainable<any>

        getAccessToken(): Chainable<Cypress.Response<any>>
        makeAPIRequest(endPoint: string, methodType: string, params: {},payload: {}): Chainable<Cypress.Response<any>>


        // isProductDisplay(productName: string, expResult : boolean) :Chainable<Cypress.Response<any>>
    }
}
