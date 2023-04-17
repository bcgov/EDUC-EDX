const passport = require('passport');
const express = require('express');
const router = express.Router();
const {getDistricts, getDistrictByDistrictId, getSchools, getCachedInstituteData,getCachedAuthorities,getAuthorityByID} = require('../components/institute-cache');
const auth = require('../components/auth');
const constants = require('../util/constants');


router.get('/districts', passport.authenticate('jwt', {session: false}, undefined), auth.isValidBackendToken(), getDistricts);

router.get('/schools', passport.authenticate('jwt', {session: false}, undefined), auth.isValidBackendToken(), getSchools);

router.get('/districts/:districtID', passport.authenticate('jwt', {session: false}, undefined), auth.isValidBackendToken(), getDistrictByDistrictId);

router.get('/province-codes', passport.authenticate('jwt', {session: false}, undefined), auth.isValidBackendToken(), getCachedInstituteData(constants.CACHE_KEYS.PROVINCE_CODES, 'institute:provinceCodesURL'));
router.get('/country-codes', passport.authenticate('jwt', {session: false}, undefined), auth.isValidBackendToken(), getCachedInstituteData(constants.CACHE_KEYS.COUNTRY_CODES, 'institute:countryCodesURL'));
router.get('/facility-types', passport.authenticate('jwt', {session: false}, undefined), auth.isValidBackendToken(), getCachedInstituteData(constants.CACHE_KEYS.SCHOOL_FACILITY_TYPES, 'institute:facilityTypeURL'));
router.get('/school-category-types', passport.authenticate('jwt', {session: false}, undefined), auth.isValidBackendToken(), getCachedInstituteData(constants.CACHE_KEYS.SCHOOL_CATEGORY_TYPES, 'institute:categoryCodesURL'));
router.get('/school-contact-types', passport.authenticate('jwt', {session: false}, undefined), auth.isValidBackendToken(), getCachedInstituteData(constants.CACHE_KEYS.SCHOOL_CONTACT_TYPE_CODES, 'institute:schoolContactTypeCodesURL'));
router.get('/school-organization-types', passport.authenticate('jwt', {session: false}, undefined), auth.isValidBackendToken(), getCachedInstituteData(constants.CACHE_KEYS.SCHOOL_ORGANIZATION_TYPES, 'institute:organizationCodeURL'));
router.get('/school-neighborhood-learning-types', passport.authenticate('jwt', {session: false}, undefined), auth.isValidBackendToken(), getCachedInstituteData(constants.CACHE_KEYS.SCHOOL_NEIGHBORHOOD_LEARNING_TYPES, 'institute:neighbourhoodLearningURL'));
router.get('/school-grade-types', passport.authenticate('jwt', {session: false}, undefined), auth.isValidBackendToken(), getCachedInstituteData(constants.CACHE_KEYS.SCHOOL_GRADE_TYPES, 'institute:gradeCodeURL'));
router.get('/district-contact-types', passport.authenticate('jwt', {session: false}, undefined), auth.isValidBackendToken(), getCachedInstituteData(constants.CACHE_KEYS.DISTRICT_CONTACT_TYPE_CODES, 'institute:districtContactTypeCodesURL'));
router.get('/reporting-requirement-codes', passport.authenticate('jwt', {session: false}, undefined), auth.isValidBackendToken(), getCachedInstituteData(constants.CACHE_KEYS.SCHOOL_REPORTING_REQUIREMENT_CODES,'institute:reportingRequirementCodesURL'));
router.get('/authority', passport.authenticate('jwt', {session: false}, undefined), auth.isValidBackendToken(), getCachedAuthorities);
router.get('/authority/:id', passport.authenticate('jwt', {session: false}, undefined),  auth.isValidBackendToken(), getAuthorityByID);

module.exports = router;
