const passport = require('passport');
const express = require('express');
const router = express.Router();
const { getSchoolBySchoolID, getAllCachedSchools, getAllSchoolDetails, getFullSchoolDetails, getSchoolContactTypeCodes} = require('../components/school');
const auth = require('../components/auth');
const {getCodes} = require('../components/utils');
const {CACHE_KEYS} = require('../components/constants');
const isValidBackendToken = auth.isValidBackendToken();

/*
 * Get a school entity by schoolID
 */
router.get('/', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getSchoolBySchoolID);
router.get('/lastUpdated', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getSchoolBySchoolID);
router.get('/allCachedSchools', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getAllCachedSchools);
router.get('/allSchools', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getAllSchoolDetails);
router.get('/schoolDetailsById/:schoolID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getFullSchoolDetails);
router.get('/facility-types', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getCodes('institute:rootURL', CACHE_KEYS.SCHOOL_FACILITY_TYPES, '/facility-codes'));
router.get('/school-category-types', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getCodes('institute:rootURL', CACHE_KEYS.SCHOOL_CATEGORY_TYPES, '/category-codes'));
router.get('/schoolContactTypeCodes', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getSchoolContactTypeCodes);

module.exports = router;

