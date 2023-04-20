export class OAuthUtil {
    makeOAuthRequest() {
        cy.getAccessToken().then(() => {
            cy.get('@accessTokenResponse').then((token_res) => {
                // @ts-ignore
                expect(token_res.status).to.be.equal(200)
                // @ts-ignore
                return token_res.body.access_token
            })
        })
    }
}