const passport = require('passport');
const express = require('express');
const router = express.Router();
const { getSchoolBySchoolID, getAllSchoolDetails, getFullSchoolDetails, updateSchool, addSchoolContact, updateSchoolContact, removeSchoolContact, checkSchoolBelongsToDistrict } = require('../components/school');
const auth = require('../components/auth');
const isValidBackendToken = auth.isValidBackendToken();
const { validateAccessToken, findSchoolID_query, findSchoolID_params, findSchoolID_body, findDistrictID_querySearchParams, findSchoolContactId_body, checkEDXUserAccessToRequestedInstitute, findSchoolContactId_params, checkEdxUserPermission, verifyQueryParamValueMatchesBodyValue } = require('../components/permissionUtils');
const { PERMISSION } = require('../util/Permission');
const validate = require('../components/validator');
const { getBySchoolIdSchema, getSchoolPaginatedSchema, schoolContactSchema, putSchoolContactSchema, deleteSchoolContactSchema, putSchoolSchema } = require('../validations/schools');

/*
 * Get a school entity by schoolID
 */
router.get('/', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, checkEdxUserPermission(PERMISSION.EDX_SCHOOL_VIEW), findSchoolID_query, checkEDXUserAccessToRequestedInstitute, getSchoolBySchoolID);
router.get('/lastUpdated', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, checkEdxUserPermission(PERMISSION.EDX_SCHOOL_VIEW), findSchoolID_query, checkEDXUserAccessToRequestedInstitute, getSchoolBySchoolID);
router.get('/schoolBelongsToLoggedInDistrict/:schoolID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, checkEdxUserPermission(PERMISSION.EDX_DISTRICT_VIEW), findSchoolID_params, validate(getBySchoolIdSchema), checkSchoolBelongsToDistrict);
router.get('/allSchools', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EDX_SCHOOL_VIEW), findDistrictID_querySearchParams, checkEDXUserAccessToRequestedInstitute, validate(getSchoolPaginatedSchema), getAllSchoolDetails);
router.get('/schoolDetailsById/:schoolID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, checkEdxUserPermission(PERMISSION.EDX_SCHOOL_VIEW), validateAccessToken, findSchoolID_params, checkEDXUserAccessToRequestedInstitute, validate(getBySchoolIdSchema), getFullSchoolDetails);
router.put('/:schoolID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EDX_SCHOOL_EDIT), verifyQueryParamValueMatchesBodyValue('schoolID', 'schoolId'), findSchoolID_params, checkEDXUserAccessToRequestedInstitute, validate(putSchoolSchema), updateSchool);
router.post('/:schoolID/contact', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EDX_SCHOOL_EDIT), findSchoolID_params, checkEDXUserAccessToRequestedInstitute, validate(schoolContactSchema), addSchoolContact);
router.delete('/:schoolID/contact/:contactID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EDX_SCHOOL_EDIT), findSchoolID_params, checkEDXUserAccessToRequestedInstitute, findSchoolContactId_params, validate(deleteSchoolContactSchema), removeSchoolContact);
router.post('/update-contact', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EDX_SCHOOL_EDIT), findSchoolID_body, checkEDXUserAccessToRequestedInstitute, findSchoolContactId_body, validate(putSchoolContactSchema), updateSchoolContact);
module.exports = router;
