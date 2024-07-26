const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const { validateStudentDemogData } = require('../components/penServices');
const constants = require('../util/constants');
const {getCachedPENServicesData} = require('../components/pen-services-cache');

/*
 * Get results of student demographics validation
 */
router.post('/demog-validation', passport.authenticate('jwt', {session: false}, undefined), auth.isValidBackendToken(), validateStudentDemogData);
router.get('/prbValidationTypeCodes', passport.authenticate('jwt', {session: false}, undefined), auth.isValidBackendToken(), getCachedPENServicesData(constants.CACHE_KEYS.PRB_VALIDATION_ISSUE_TYPE_CODES, 'penServices:prbValidationTypeCodesURL'));

module.exports = router;
