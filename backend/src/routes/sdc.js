const passport = require('passport');
const express = require('express');
const router = express.Router();
const { getCollectionBySchoolId, uploadFile, getSdcFileProgress, updateSchoolCollection, getSchoolCollectionById, getSDCSchoolCollectionStudentPaginated, getSDCSchoolCollectionStudentSummaryCounts, getSDCSchoolCollectionStudentDetail} = require('../components/sdc');
const {getCachedSDCData} = require('../components/sdc-cache');
const auth = require('../components/auth');
const constants = require('../util/constants');
const isValidBackendToken = auth.isValidBackendToken();
const { getCodes } = require('../components/utils');

//cached code table calls
router.get('/band-codes', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getCachedSDCData(constants.CACHE_KEYS.SDC_BAND_CODES, 'sdc:bandCodesURL'));
router.get('/career-program-codes', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getCachedSDCData(constants.CACHE_KEYS.SDC_CAREER_PROGRAM_CODES, 'sdc:careerProgramCodesURL'));
router.get('/enrolled-grade-codes', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getCachedSDCData(constants.CACHE_KEYS.SDC_ENROLLED_GRADE_CODES, 'sdc:enrolledGradeCodesURL'));
router.get('/enrolled-program-codes', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getCachedSDCData(constants.CACHE_KEYS.SDC_ENROLLED_PROGRAM_CODES, 'sdc:enrolledProgramCodesURL'));
router.get('/gender-codes', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getCodes('sdc:genderCodesURL', constants.CACHE_KEYS.SDC_GENDER_CODES, null, true));
router.get('/home-language-spoken-codes', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getCachedSDCData(constants.CACHE_KEYS.SDC_HOME_LANGUAGE_SPOKEN_CODES, 'sdc:homeLanguageSpokenCodesURL'));
router.get('/school-funding-codes', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getCachedSDCData(constants.CACHE_KEYS.SDC_SCHOOL_FUNDING_CODES, 'sdc:schoolFundingCodesURL'));
router.get('/specialEducation-codes', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getCachedSDCData(constants.CACHE_KEYS.SDC_SPECIAL_ED_CODES, 'sdc:specialEdCodesURL'));
router.get('/validation-issue-type-codes', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getCodes('sdc:validationIssueTypeCodesURL', constants.CACHE_KEYS.SDC_VALIDATION_ISSUE_TYPE_CODES, null, true));
//end cached code table calls

router.get('/getCollectionBySchoolId/:schoolID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getCollectionBySchoolId);
router.get('/:sdcSchoolCollectionID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getSchoolCollectionById);
router.post('/:sdcSchoolCollectionID/file', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, uploadFile);
router.get('/:sdcSchoolCollectionID/file', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getSdcFileProgress);
router.put('/:sdcSchoolCollectionID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, updateSchoolCollection);
router.get('/sdcSchoolCollectionStudent/:sdcSchoolCollectionID/paginated', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getSDCSchoolCollectionStudentPaginated);
router.get('/sdcSchoolCollectionStudent/stats/error-warning-count/:sdcSchoolCollectionID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getSDCSchoolCollectionStudentSummaryCounts);
router.get('/sdcSchoolCollectionStudent/:sdcSchoolCollectionStudentID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getSDCSchoolCollectionStudentDetail);

module.exports = router;

