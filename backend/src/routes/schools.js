const passport = require('passport');
const express = require('express');
const router = express.Router();
const { getSchoolBySchoolID, getAllCachedSchools, getAllSchoolDetails, getFullSchoolDetails, getSchoolContactTypeCodes} = require('../components/school');
const auth = require('../components/auth');
const isValidBackendToken = auth.isValidBackendToken();

/*
 * Get a school entity by schoolID
 */
router.get('/', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getSchoolBySchoolID);
router.get('/lastUpdated', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getSchoolBySchoolID);
router.get('/allCachedSchools', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getAllCachedSchools);
router.get('/allSchools', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getAllSchoolDetails);
router.get('/schoolDetailsById/:schoolID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getFullSchoolDetails);
router.get('/schoolContactTypeCodes', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getSchoolContactTypeCodes);

module.exports = router;

