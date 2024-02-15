const passport = require('passport');
const express = require('express');
const router = express.Router();
const { getSchoolBySchoolID, getAllSchoolDetails, getFullSchoolDetails, updateSchool, addSchoolContact, updateSchoolContact, removeSchoolContact, checkSchoolBelongsToDistrict } = require('../components/school');
const auth = require('../components/auth');
const isValidBackendToken = auth.isValidBackendToken();
const validate = require('../components/validator');
const {schoolContactSchema, schoolPaginatedSchema, getSchoolSchema, putSchoolSchema} = require('../validations/schools');

/*
 * Get a school entity by schoolID
 */
router.get('/', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getSchoolBySchoolID);
router.get('/lastUpdated', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getSchoolBySchoolID);
router.get('/schoolBelongsToLoggedInDistrict/:schoolID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, checkSchoolBelongsToDistrict);
router.get('/allSchools', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validate(schoolPaginatedSchema), getAllSchoolDetails);
router.get('/schoolDetailsById/:schoolID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validate(getSchoolSchema), getFullSchoolDetails);
router.put('/:schoolID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validate(putSchoolSchema), updateSchool);
router.post('/:schoolID/contact', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validate(schoolContactSchema), addSchoolContact);
router.delete('/:schoolID/contact/:contactID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, removeSchoolContact);
router.post('/update-contact', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, updateSchoolContact);
module.exports = router;

