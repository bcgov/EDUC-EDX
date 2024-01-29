import { AppSetupData } from 'tests-e2e/cypress.config';
import { EdxUserActivationFixture } from '../services/edx-api-service';
import { InstituteOptions, SchoolOptions } from '../services/institute-api-service';
import { SchoolCollectionOptions, SdcStudentEllOption } from '../services/sdc-collection-api-service';

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      login(): Chainable<Subject>;
      logout(): Chainable<Subject>;

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

      task(
        event: 'setup-secure-exchange',
        schoolId: string,
        options?: Partial<Loggable & Timeoutable>
      ): Chainable<Subject>;

      task<T = SchoolOptions>(
        event: 'recreate-school',
        arg: T,
        options?: Partial<Loggable & Timeoutable>
      ): Chainable<Subject>;

      task(
        event: 'teardown-edxUser',
        edxUserId: string,
        options?: Partial<Loggable & Timeoutable>
      ): Chainable<Subject>;

      task<T = {instituteType: InstituteTypeCode, activationCodeId: string}> (
        event: 'teardown-userActivationCode',
        code: T,
        options?: Partial<Loggable & Timeoutable>
      ): Chainable<Subject>;

      task<T = SdcStudentEllOption, S = SdcStudentEll>(
        event: 'setup-student-ells',
        payload: T[],
        options?: Partial<Loggable & Timeoutable>
      ): Chainable<S[]>;

      task<T = SchoolCollectionOptions, S = SdcSchoolCollection>(
        event: 'setup-collections',
        collectionOptions: T,
        options?: Partial<Loggable & Timeoutable>
      ): Chainable<S>;
    }
  }
}
