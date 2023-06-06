import { AppSetupData } from "tests-e2e/cypress.config";
import { InstituteOptions } from "../services/institute-api-service";

declare global {
    namespace Cypress {
        interface Chainable<Subject> {
            login(): Chainable<any>;
            task<S = InstituteOptions, T = AppSetupData>(event: string, arg?: S): Chainable<T>
        }
    }
}
