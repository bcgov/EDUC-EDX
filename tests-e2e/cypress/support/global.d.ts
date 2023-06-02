import { AppSetupData } from "tests-e2e/cypress.config";
import { InstituteSetupOptions } from "../helpers/institute-set-up-utils";

declare global {
    namespace Cypress {
        interface Chainable<Subject> {
            login(): Chainable<any>;
            task<S = InstituteSetupOptions, T = AppSetupData>(event: string, arg?: S): Chainable<T>
        }
    }
}
