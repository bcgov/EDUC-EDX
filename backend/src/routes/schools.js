const passport = require('passport');
const express = require('express');
const router = express.Router();
const { getSchoolBySchoolID, getAllSchoolDetails, getFullSchoolDetails, updateSchool, addSchoolContact, updateSchoolContact, removeSchoolContact, checkSchoolBelongsToDistrict } = require('../components/school');
const auth = require('../components/auth');
const isValidBackendToken = auth.isValidBackendToken();
const { validateAccessToken, findSchoolID_query, findSchoolID_params, findSchoolID_body, findDistrictID_querySearchParams, checkEDXUserAccessToRequestedInstitute, checkEdxUserPermission, checkEdxUserPermissionIn, verifyQueryParamValueMatchesBodyValue, forbidActionOnOffshoreSchools } = require('../components/permissionUtils');
const { PERMISSION } = require('../util/Permission');
const validate = require('../components/validator');
const {schoolContactSchema, schoolPaginatedSchema, getSchoolSchema, putSchoolSchema} = require('../validations/schools');

/*
 * Get a school entity by schoolID
 */
router.get('/', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, checkEdxUserPermission(PERMISSION.EDX_SCHOOL_EDIT), findSchoolID_query, checkEDXUserAccessToRequestedInstitute, getSchoolBySchoolID);
router.get('/lastUpdated', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, checkEdxUserPermission(PERMISSION.EDX_SCHOOL_EDIT), findSchoolID_query, checkEDXUserAccessToRequestedInstitute, getSchoolBySchoolID);
router.get('/schoolBelongsToLoggedInDistrict/:schoolID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, checkEdxUserPermissionIn([PERMISSION.EDX_USER_DISTRICT_ADMIN, PERMISSION.EDX_DISTRICT_EDIT]), checkSchoolBelongsToDistrict);
router.get('/allSchools', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EDX_SCHOOL_EDIT), findDistrictID_querySearchParams, checkEDXUserAccessToRequestedInstitute, validate(schoolPaginatedSchema), getAllSchoolDetails);
router.get('/schoolDetailsById/:schoolID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, checkEdxUserPermission(PERMISSION.EDX_SCHOOL_EDIT), validateAccessToken, findSchoolID_params, checkEDXUserAccessToRequestedInstitute, validate(getSchoolSchema), getFullSchoolDetails);
router.put('/:schoolID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EDX_SCHOOL_EDIT), verifyQueryParamValueMatchesBodyValue('schoolID', 'schoolId'), findSchoolID_params, checkEDXUserAccessToRequestedInstitute, forbidActionOnOffshoreSchools, validate(putSchoolSchema), updateSchool);
router.post('/:schoolID/contact', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EDX_SCHOOL_EDIT), findSchoolID_params, checkEDXUserAccessToRequestedInstitute, forbidActionOnOffshoreSchools, validate(schoolContactSchema), addSchoolContact);
router.delete('/:schoolID/contact/:contactID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EDX_SCHOOL_EDIT), findSchoolID_params, checkEDXUserAccessToRequestedInstitute, forbidActionOnOffshoreSchools, removeSchoolContact);
router.post('/update-contact', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EDX_SCHOOL_EDIT), findSchoolID_body, checkEDXUserAccessToRequestedInstitute, forbidActionOnOffshoreSchools, updateSchoolContact);
module.exports = router;
