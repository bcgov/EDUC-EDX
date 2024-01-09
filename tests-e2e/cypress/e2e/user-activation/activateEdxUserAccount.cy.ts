import selectors from '../../support/selectors';

function clickingActivationLinkMoreThan2Times() {
    cy.get<string>('@activationUrl').then(url => {
      cy.visit(url).visit(url).visit(url).visit(url).visit(url).visit(url);

        cy.get(selectors.userActivationPage.userActivationErrorMessageSnackBar)
            .should('be.visible')
            .should(
                'include.text',
                'Your activation link has expired. Please contact your administrator for a new activation code.');
    });
}

function clickingSubmitButtonTooManyTimes() {
  cy.get<string>('@activationUrl').then(url => {
    cy.visit(url);
    cy.get(selectors.invitationSelection.loginButtonBCeID).click();
    cy.get(selectors.loginPage.loginUsername).type('EdxUser11');
    cy.get(selectors.loginPage.loginPassword).type('asdfasdf');
    cy.get(selectors.loginPage.loginContinueButton).click();

    // user Activation Page
    cy.get(selectors.userActivationPage.mincodeInput, {timeout:15000}).type('99998');  // Exception for timeout due to multiple api requests
    cy.get(selectors.userActivationPage.primaryTextActivationCodeInput).type('1234567890');
    cy.get(selectors.userActivationPage.userActivationSubmitButton).should('be.disabled');
    cy.get(selectors.userActivationPage.personalActivationCodeInput).type('1234567890');
    cy.get(selectors.userActivationPage.acceptTermsCheckbox).click();
    cy.get(selectors.userActivationPage.userActivationSubmitButton).should('be.enabled');

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
}

function enterIncorrectActivationCodes(mincode: string) {
  cy.get<string>('@activationUrl').then((url: string) => {
    cy.visit(url);
    cy.get(selectors.invitationSelection.loginButtonBCeID).click();
    cy.get(selectors.loginPage.loginUsername).type('EdxUser11');
    cy.get(selectors.loginPage.loginPassword).clear().type('asdfasdf');
    cy.get(selectors.loginPage.loginContinueButton).click();

    // User Activation Page
    cy.get(selectors.userActivationPage.mincodeInput, {timeout:15000}).type(mincode);
    cy.get(selectors.userActivationPage.primaryTextActivationCodeInput).type('1234567890');
    cy.get(selectors.userActivationPage.personalActivationCodeInput).type('1234567890');
    cy.get(selectors.userActivationPage.acceptTermsCheckbox).click();
    cy.get(selectors.userActivationPage.userActivationSubmitButton).click();

    // Exception made for timeout due to multiple api requests
    cy.get(selectors.userActivationPage.userActivationSnackBar, {timeout:15000}).should('include.text',
        'Incorrect activation details have been entered. Please try again.');
  });
}

function enterCorrectActivationCode(mincode: string) {
  cy.get<string>('@activationUrl').then((url: string) => {
    cy.visit(url);
    cy.get(selectors.invitationSelection.loginButtonBCeID).click();
    cy.get(selectors.loginPage.loginUsername).type('EdxUser11');
    cy.get(selectors.loginPage.loginPassword).type('asdfasdf');
    cy.get(selectors.loginPage.loginContinueButton).click();

    // User Activation Page
    cy.get(selectors.userActivationPage.mincodeInput, {timeout:15000}).type(mincode);  // Used timeout as the only exception in this test case.
    cy.get<string>('@primaryCode').then((primaryCode: string) => {
      cy.get(selectors.userActivationPage.primaryTextActivationCodeInput).type(primaryCode);
    });
    cy.get<string>('@personalCode').then((personalCode: string) => {
      cy.get(selectors.userActivationPage.personalActivationCodeInput).type(personalCode);
    });
    cy.get(selectors.userActivationPage.acceptTermsCheckbox).click();
    cy.get(selectors.userActivationPage.userActivationSubmitButton).click();
    cy.get(selectors.userActivationPage.userActivationSnackBar, {timeout:15000}).should('include.text',
        'User Activation Completed Successfully. Redirecting to your Dashboard...');
  });
}

describe('Activate EDX User Account Page', () => {
  context('As a school User', () => {
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

    context('Activation error check by clicking their activation link too many times', () => {
      it('will not permit more than 2 visits to the activation URL', clickingActivationLinkMoreThan2Times);
    });

    context('Activation error check by clicking the submit button link many times', () => {
      it('will return an input error message to the user', clickingSubmitButtonTooManyTimes);
    });

    context('Activation error check by entering an incorrect activation details', () => {
      it('will return an input error message to the user', () =>{
        enterIncorrectActivationCodes('99998');
      });
    });

    context('User successfully activates by entering an correct activation details', () => {
      it('will confirm correct user has been created', ()=> {
        enterCorrectActivationCode('99899998');
      });
    });
  });


  context('As a District User Admin', () => {
    beforeEach(() => {
      const user: UserActivationOptions = {instituteTypeCode: 'DISTRICT', instituteNumber: '006'};
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

    context('Activation error check by  clicking their activation link too many times', () => {
      it('will not permit more than 2 visits to the activation URL', clickingActivationLinkMoreThan2Times);
    });

    context('Activation error check by clicking the submit button link many times', () => {
      it('will return an input error message to the user', clickingSubmitButtonTooManyTimes);
    });

    context('Activation error check by entering an incorrect activation details', () => {
      it('will return an input error message to the user', () => {
        enterIncorrectActivationCodes('006');
      });
    });

    context('User successfully activates by entering an correct activation details', () => {
      it('will confirm correct user has been created', () => {
        enterCorrectActivationCode('006')
      });
    });
  });

});

