import selectors from '../../support/selectors';

describe('Activate EDX User Account Page', () => {
  context('As a user who fails to activate their account', () => {
    beforeEach(() => {
      const user: UserActivationOptions = {instituteTypeCode: 'SCHOOL', instituteNumber: '99998'};
      cy.task('dataLoad').then(() => {
        cy.task('setup-userActivation', user)
            .then(fixture => {
              cy.wrap(fixture.activationUrl).as('activationUrl');
              cy.wrap(fixture.personalCodeId).as('personalCodeId');
              cy.wrap(fixture.primaryCode).as('primaryCode');
              cy.wrap(fixture.personalCode).as('personalCode');
            });
      });
    });
    afterEach(() => {
      cy.get('@personalCodeId').then(id => cy.task('teardown-userActivationCode', id));
    });

    context('by clicking their activation link too many times', () => {
      it('will not permit more than 2 visits to the activation URL', () => {
        cy.get<string>('@activationUrl').then(url => {
          cy.visit(url).visit(url).visit(url);
          cy.get(selectors.userActivationPage.userActivationErrorMessaageSnackBar)
              .should('be.visible')
              .should(
                  'include.text',
                  'Your activation link has expired. Please contact your administrator for a new activation code.');
        });
      });
    });

    context('by entering an incorrect activation details', () => {
      it('will return an input error message to the user', () => {
        cy.get<string>('@activationUrl').then(url => {
          cy.visit(url);
          cy.get(selectors.loginPage.loginUsername).clear().type('EdxUser11');
          cy.get(selectors.loginPage.loginPassword).clear().type('asdfasdf');
          cy.get(selectors.loginPage.loginContinueButton).click();

          // user Activation Page
          cy.get(selectors.userActivationPage.mincodeInput).type('99998');
          cy.get(selectors.userActivationPage.primaryTextActivationCodeInput).type('1234567890');
          cy.get(selectors.userActivationPage.personalActivationCodeInput).type('1234567890');
          cy.get(selectors.userActivationPage.userActivationSubmitButton).click();
          cy.get(selectors.userActivationPage.userActivationSnackBar).should('include.text',
          'Incorrect activation details have been entered. Please try again.');
        });
      });
    });

    context('by clicking the submit button link many times', () => {
      it('will return an input error message to the user', () => {
        cy.get<string>('@activationUrl').then(url => {
          cy.visit(url);
          cy.get(selectors.loginPage.loginUsername).clear().type('EdxUser11');
          cy.get(selectors.loginPage.loginPassword).clear().type('asdfasdf');
          cy.get(selectors.loginPage.loginContinueButton).click();

          // user Activation Page
          cy.get(selectors.userActivationPage.mincodeInput).type('99998');
          cy.get(selectors.userActivationPage.primaryTextActivationCodeInput).type('1234567890');
          cy.get(selectors.userActivationPage.personalActivationCodeInput).type('1234567890');

          // Click the submit button 4 times for disabling the submit button
          cy.get(selectors.userActivationPage.userActivationSubmitButton).click();
          cy.get(selectors.userActivationPage.userActivationSubmitButton).click();
          cy.get(selectors.userActivationPage.userActivationSubmitButton).click();
          cy.get(selectors.userActivationPage.userActivationSubmitButton).click();
          cy.get(selectors.userActivationPage.userActivationSnackBar).should('include.text',
              'You have exceeded the number of activation attempts allowed. Please contact your administrator for a new activation code.');

          // All buttons should be disabled
          cy.get(selectors.userActivationPage.mincodeInput).should('be.disabled');
          cy.get(selectors.userActivationPage.primaryTextActivationCodeInput).should('be.disabled');
          cy.get(selectors.userActivationPage.personalActivationCodeInput).should('be.disabled');
          cy.get(selectors.userActivationPage.userActivationSubmitButton).should('be.disabled');
        });
      });
    });

  });

  context('As a user who successfully activates their account', () => {

    beforeEach(() => {
      const user: UserActivationOptions = {instituteTypeCode: 'SCHOOL', instituteNumber: '99998'};
      cy.task('dataLoad').then(() => {
        cy.task('setup-userActivation', user)
            .then(fixture => {
              cy.wrap(fixture.activationUrl).as('activationUrl');
              cy.wrap(fixture.personalCodeId).as('personalCodeId');
              cy.wrap(fixture.primaryCode).as('primaryCode');
              cy.wrap(fixture.personalCode).as('personalCode');
            });
      });
    });
    afterEach(() => {
      cy.get('@personadlCodeId').then(id => cy.task('teardown-userActivationCode', id));
    });

    context('by entering an correct activation details', () => {
      it('will confirm correct user has been created', () => {

        cy.get<string>('@activationUrl').then(url => {
          cy.visit(url);
          cy.get(selectors.loginPage.loginUsername).type('EdxUser11');
          cy.get(selectors.loginPage.loginPassword).type('asdfasdf');
          cy.get(selectors.loginPage.loginContinueButton).click();

          // user Activation Page
          cy.get(selectors.userActivationPage.mincodeInput, {timeout:8000}).type('99899998');  // Used timeout as the only exception in this test case.
          cy.get('@primaryCode').then(primaryCode => { // @ts-ignore
            cy.get(selectors.userActivationPage.primaryTextActivationCodeInput).type(primaryCode);
          });

          cy.get('@personalCode').then(personalCode => { // @ts-ignore
            cy.get(selectors.userActivationPage.personalActivationCodeInput).type(personalCode);
          });
          cy.get(selectors.userActivationPage.userActivationSubmitButton).click();
          cy.get(selectors.userActivationPage.userActivationSnackBar, {timeout:9000}).should('include.text',
              'User Activation Completed Successfully. Redirecting to your Dashboard...');

        });
      });
    });


  });
});
