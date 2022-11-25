const passport = require('passport');
const express = require('express');
const router = express.Router();
const { getSchoolBySchoolID, getAllSchoolDetails, getFullSchoolDetails, updateSchool, addSchoolContact, updateSchoolContact } = require('../components/school');
const auth = require('../components/auth');
const isValidBackendToken = auth.isValidBackendToken();

/*
 * Get a school entity by schoolID
 */
router.get('/', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getSchoolBySchoolID);
router.get('/lastUpdated', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getSchoolBySchoolID);
router.get('/allSchools', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getAllSchoolDetails);
router.get('/schoolDetailsById/:schoolID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getFullSchoolDetails);
router.put('/:schoolID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, updateSchool);
router.post('/:schoolID/contact', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, addSchoolContact);
router.post('/update-contact', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, updateSchoolContact);
module.exports = router;

