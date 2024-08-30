const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const { validateStudentDemogData } = require('../components/penServices');
const constants = require('../util/constants');
const {getCachedPENServicesData} = require('../components/pen-services-cache');
const {
  validateAccessToken,
  checkEdxUserPermission,
  findSdcSchoolCollectionID_params,
  loadSdcSchoolCollection,
  checkSdcSchoolCollectionAccess
} = require('../components/permissionUtils');
const {PERMISSION} = require('../util/Permission');
const validate = require('../components/validator');
const { validateStudentSchema } = require('../validations/penServices');

/*
 * Get results of student demographics validation
 */
router.post('/sdcSchoolCollection/:sdcSchoolCollectionID/demog-validation', passport.authenticate('jwt', {session: false}, undefined), auth.isValidBackendToken(), validateAccessToken, checkEdxUserPermission(PERMISSION.SCHOOL_SDC_EDIT), validate(validateStudentSchema), findSdcSchoolCollectionID_params, loadSdcSchoolCollection, checkSdcSchoolCollectionAccess, validateStudentDemogData);
router.get('/prbValidationTypeCodes', passport.authenticate('jwt', {session: false}, undefined), auth.isValidBackendToken(), getCachedPENServicesData(constants.CACHE_KEYS.PRB_VALIDATION_ISSUE_TYPE_CODES, 'penServices:prbValidationTypeCodesURL'));

module.exports = router;
