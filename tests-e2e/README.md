# Running Cypress
### Setup
1. From within the tests-e2e dir, run npm install to make sure Cypress is installed
2. Obtain a copy of the cypress.env.json file from a teammate and save within the tests-e2e dir
3. Either run the tests from your IDE or in the terminal - while in the tests-e2e dir, run `npm run cypress:open` (this will open the UI where you can select your browser and then run tests)

### Running against the local environment
The configurations within cypress.config.ts and the env file point the tests at the dev environment. If you want to run 
against your local env, change the `base_url` value in the env file and the `baseURL` value in the config file to `"http://localhost:8081"`.

If login fails due to the cross-domain redirect that occurs, comment out the following line in `tests-e2e/cypress/support/commands.ts`: 

`cy.url().should('eq', Cypress.env('url').base_url + '/');`

If the browser crashes while running one of your tests, it is because it ran out of memory to store the UI snapshots taken by 
Cypress. To prevent this, add the following line to the `defineConfig` method in `cypress.config.ts` before the `e2e` object:

`numTestsKeptInMemory: 0`


### Etiquette 
Before and after running your tests, make sure you communicate with your team - due to how the data seeding works,
if multiple people are running tests at the same time, it can interfere with tests results.