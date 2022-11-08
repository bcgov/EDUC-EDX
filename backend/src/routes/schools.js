const passport = require('passport');
const express = require('express');
const router = express.Router();
const { getSchoolBySchoolID, getAllCachedSchools, getAllSchoolDetails, getFullSchoolDetails, updateSchool, addSchoolContact, updateSchoolContact } = require('../components/school');
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
router.get('/schoolContactTypeCodes', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getCodes('institute:rootURL', CACHE_KEYS.SCHOOL_CONTACT_TYPE_CODES, '/school-contact-type-codes'));

router.get('/school-organization-types', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getCodes('institute:rootURL', CACHE_KEYS.SCHOOL_ORGANIZATION_TYPES, '/organization-codes'));
router.get('/school-neighborhood-learning-types', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getCodes('institute:rootURL', CACHE_KEYS.SCHOOL_NEIGHBORHOOD_LEARNING_TYPES, '/neighborhood-learning-codes'));
router.get('/school-grade-types', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getCodes('institute:rootURL', CACHE_KEYS.SCHOOL_GRADE_TYPES, '/grade-codes'));

router.put('/:schoolID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, updateSchool);

router.post('/:schoolID/contact', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, addSchoolContact);
router.post('/update-contact', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, updateSchoolContact);
module.exports = router;

