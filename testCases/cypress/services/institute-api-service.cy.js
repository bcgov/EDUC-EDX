export class OAuthUtil {
    makeOAuthRequest() {
        debugger
        cy.getAccessToken().then(() => {
            debugger
            cy.get('@accessTokenResponse').then((token_res) => {
                expect(token_res.status).to.be.equal(200)
                return token_res.body.access_token

            })
        })
    }
}