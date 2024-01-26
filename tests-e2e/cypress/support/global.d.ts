import { AppSetupData } from 'tests-e2e/cypress.config';
import { EdxUserActivationFixture } from '../services/edx-api-service';
import { InstituteOptions, SchoolOptions } from '../services/institute-api-service';
import {SchoolCollection} from '../services/sdc-collection-api-service';

declare global {
    namespace Cypress {
        interface Chainable<Subject> {
            login(): Chainable<void>;
            logout(): Chainable<void>;

            task<T = InstituteOptions, S = AppSetupData>(
                event: 'dataLoad',
                arg: T,
                options?: Partial<Loggable & Timeoutable>
            ): Chainable<S>;

            task<T = DistrictUserOptions, S = EdxUserEntity>(
                event: 'setup-districtUser',
                arg: T,
                options?: Partial<Loggable & Timeoutable>
            ): Chainable<S>;

            task<T = SchoolUserOptions, S = EdxUserEntity>(
                event: 'setup-schoolUser',
                arg: T,
                options?: Partial<Loggable & Timeoutable>
            ): Chainable<S>;

            task<T = UserActivationOptions, S = EdxUserActivationFixture>(
                event: 'setup-userActivation',
                arg: T,
                options?: Partial<Loggable & Timeoutable>
            ): Chainable<S>;

            task<T = SchoolCollection, S = SdcSchoolCollection>(
                event: 'setup-collections',
                schoolCollection: T,
                options?: Partial<Loggable & Timeoutable>
            ): Chainable<S>;

            task(
                event: 'setup-secure-exchange',
                schoolId: string,
                options?: Partial<Loggable & Timeoutable>
            ): Chainable<void>;

            task<T = SchoolOptions>(
                event: 'recreate-school',
                arg: T,
                options?: Partial<Loggable & Timeoutable>
            ): Chainable<void>;

            task(
                event: 'teardown-edxUser',
                edxUserId: string,
                options?: Partial<Loggable & Timeoutable>
            ): Chainable<void>;

            task<T = {instituteType: InstituteTypeCode, activationCodeId: string}> (
                event: 'teardown-userActivationCode',
                code: T,
                options?: Partial<Loggable & Timeoutable>
            ): Chainable<void>
        }
    }
}
