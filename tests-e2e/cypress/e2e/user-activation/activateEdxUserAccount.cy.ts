describe('Activate EDX User Account Page', () => {
  context('As a user who fails to activate their account', () => {
    beforeEach(() => {
      const user: UserActivationOptions = {instituteTypeCode: 'SCHOOL', instituteNumber: '99998'};
      cy.task('dataLoad').then(() => {
        cy.task('setup-userActivation', user)
          .then(fixture => {
            cy.wrap(fixture.activationUrl).as('activationUrl');
            cy.wrap(fixture.personalCodeId).as('personalCodeId');
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
          cy.get('#user_activation_error_message')
            .should('be.visible')
            .should(
              'include.text',
              'Your activation link has expired. Please contact your administrator for a new activation code.'
            );
        });
      });
    });
  });
});
