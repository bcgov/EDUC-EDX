const passport = require('passport');
const express = require('express');
const router = express.Router();
const { getSchoolBySchoolID, getAllSchoolDetails, getFullSchoolDetails, updateSchool, addSchoolContact, updateSchoolContact, removeSchoolContact, checkSchoolBelongsToDistrict } = require('../components/school');
const auth = require('../components/auth');
const isValidBackendToken = auth.isValidBackendToken();
const { findSchoolID_query, findSchoolID_params, findSchoolID_body, findDistrictID_querySearchParams, checkEDXUserAccessToRequestedInstitute, checkEdxUserPermission, verifyQueryParamValueMatchesBodyValue,forbidActionOnOffshoreSchools } = require('../components/permissionUtils');
const { PERMISSION } = require('../util/Permission');
const validate = require('../components/validator');
const {schoolContactSchema, schoolPaginatedSchema, getSchoolSchema, putSchoolSchema} = require('../validations/schools');

/*
 * Get a school entity by schoolID
 */
router.get('/', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, findSchoolID_query, checkEDXUserAccessToRequestedInstitute, getSchoolBySchoolID);
router.get('/lastUpdated', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, findSchoolID_query, checkEDXUserAccessToRequestedInstitute, getSchoolBySchoolID);
router.get('/schoolBelongsToLoggedInDistrict/:schoolID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, checkSchoolBelongsToDistrict);
router.get('/allSchools', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validate(schoolPaginatedSchema), findDistrictID_querySearchParams, checkEDXUserAccessToRequestedInstitute, getAllSchoolDetails);
router.get('/schoolDetailsById/:schoolID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validate(getSchoolSchema), findSchoolID_params, checkEDXUserAccessToRequestedInstitute, getFullSchoolDetails);
router.put('/:schoolID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validate(putSchoolSchema), verifyQueryParamValueMatchesBodyValue('schoolID', 'schoolId'), checkEdxUserPermission(PERMISSION.EDX_SCHOOL_EDIT), findSchoolID_params, checkEDXUserAccessToRequestedInstitute, forbidActionOnOffshoreSchools, updateSchool);
router.post('/:schoolID/contact', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validate(schoolContactSchema), checkEdxUserPermission(PERMISSION.EDX_SCHOOL_EDIT), findSchoolID_params, checkEDXUserAccessToRequestedInstitute, forbidActionOnOffshoreSchools, addSchoolContact);
router.delete('/:schoolID/contact/:contactID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, checkEdxUserPermission(PERMISSION.EDX_SCHOOL_EDIT), findSchoolID_params, checkEDXUserAccessToRequestedInstitute, forbidActionOnOffshoreSchools, removeSchoolContact);
router.post('/update-contact', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, checkEdxUserPermission(PERMISSION.EDX_SCHOOL_EDIT), findSchoolID_body, checkEDXUserAccessToRequestedInstitute, forbidActionOnOffshoreSchools, updateSchoolContact);
module.exports = router;
