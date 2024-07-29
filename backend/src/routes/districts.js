const passport = require('passport');
const express = require('express');
const router = express.Router();
const { getDistrictByDistrictID, updateDistrict, createDistrictContact,updateDistrictContact, removeDistrictContact} = require('../components/district');
const auth = require('../components/auth');
const isValidBackendToken = auth.isValidBackendToken();
const { validateAccessToken, findDistrictID_params, findDistrictId_body, findDistrictContactId_body, checkEDXUserAccessToRequestedInstitute, findDistrictContactId_params, checkEdxUserPermission } = require('../components/permissionUtils');
const { PERMISSION } = require('../util/Permission');

/*
 * Get a District entity by districtID
 */

router.post('/:districtID/contact', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EDX_DISTRICT_EDIT), findDistrictID_params, checkEDXUserAccessToRequestedInstitute, createDistrictContact);
router.get('/:districtID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EDX_DISTRICT_VIEW), findDistrictID_params, checkEDXUserAccessToRequestedInstitute, getDistrictByDistrictID);
router.post('/:districtID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EDX_DISTRICT_EDIT), findDistrictID_params, checkEDXUserAccessToRequestedInstitute, updateDistrict);
router.put('/update-contact', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EDX_DISTRICT_EDIT), findDistrictId_body, checkEDXUserAccessToRequestedInstitute, findDistrictContactId_body, updateDistrictContact);
router.delete('/:districtID/contact/:contactID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EDX_DISTRICT_EDIT), findDistrictID_params, checkEDXUserAccessToRequestedInstitute, findDistrictContactId_params, removeDistrictContact);
module.exports = router;
