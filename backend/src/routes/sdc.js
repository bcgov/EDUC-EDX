const passport = require('passport');
const express = require('express');
const router = express.Router();
const { getCollectionBySchoolId, getCollectionByDistrictId, uploadFile, getSdcFileProgress, updateSchoolCollection, getSchoolCollectionById, getDistrictCollectionById,
  getSDCSchoolCollectionStudentPaginated, getSDCSchoolCollectionStudentSummaryCounts,
  getSDCSchoolCollectionStudentDetail, updateAndValidateSdcSchoolCollectionStudent, deleteSDCSchoolCollectionStudent, removeSDCSchoolCollectionStudents,
  getStudentHeadcounts, downloadSdcReport, getSchoolStudentDuplicates,
  markSdcSchoolCollectionStudentAsDifferent, getSdcSchoolCollectionMonitoringBySdcDistrictCollectionId} = require('../components/sdc');
const {getCachedSDCData} = require('../components/sdc-cache');
const auth = require('../components/auth');
const constants = require('../util/constants');
const { scanFilePayload } = require('../components/fileUtils');
const isValidBackendToken = auth.isValidBackendToken();
const { getCodes } = require('../components/utils');
const { validateAccessToken, checkEdxUserPermission, checkPermissionForRequestedInstitute, findSchoolID_params, findDistrictID_params, checkEDXUserAccessToRequestedInstitute, findSdcSchoolCollectionID_params, findSdcDistrictCollectionID_params, findSdcSchoolCollectionID_fromRequestedSdcSchoolCollectionStudent, loadSdcSchoolCollection, loadSdcDistrictCollection, findSdcSchoolCollectionStudentID_params, loadSdcSchoolCollectionStudent, checkSdcSchoolCollectionAccess, 
  checkSdcDistrictCollectionAccess, checkInstituteCollectionAccess, checkIfCreateorUpdateSDCStudentIsAllowed, findSInstituteTypeCollectionID_body,
  loadInstituteCollection, checkStudentBelongsInCollection } = require('../components/permissionUtils');
const { PERMISSION } = require('../util/Permission');

//cached code table calls
router.get('/band-codes', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getCachedSDCData(constants.CACHE_KEYS.SDC_BAND_CODES, 'sdc:bandCodesURL'));
router.get('/career-program-codes', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getCachedSDCData(constants.CACHE_KEYS.SDC_CAREER_PROGRAM_CODES, 'sdc:careerProgramCodesURL'));
router.get('/enrolled-grade-codes', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getCachedSDCData(constants.CACHE_KEYS.SDC_ENROLLED_GRADE_CODES, 'sdc:enrolledGradeCodesURL'));
router.get('/enrolled-program-codes', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getCachedSDCData(constants.CACHE_KEYS.SDC_ENROLLED_PROGRAM_CODES, 'sdc:enrolledProgramCodesURL'));
router.get('/gender-codes', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, getCodes('sdc:genderCodesURL', constants.CACHE_KEYS.SDC_GENDER_CODES, null, true));
router.get('/home-language-spoken-codes', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getCachedSDCData(constants.CACHE_KEYS.SDC_HOME_LANGUAGE_SPOKEN_CODES, 'sdc:homeLanguageSpokenCodesURL'));
router.get('/school-funding-codes', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getCachedSDCData(constants.CACHE_KEYS.SDC_SCHOOL_FUNDING_CODES, 'sdc:schoolFundingCodesURL'));
router.get('/specialEducation-codes', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getCachedSDCData(constants.CACHE_KEYS.SDC_SPECIAL_ED_CODES, 'sdc:specialEdCodesURL'));
router.get('/validation-issue-type-codes', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, getCodes('sdc:validationIssueTypeCodesURL', constants.CACHE_KEYS.SDC_VALIDATION_ISSUE_TYPE_CODES, null, true));
router.get('/program-eligibility-issue-codes', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, getCodes('sdc:programEligibilityTypeCodesURL', constants.CACHE_KEYS.SDC_PROGRAM_ELIGIBILITY_TYPE_CODES, null, true));
router.get('/zero-fte-reason-codes', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, getCodes('sdc:zeroFteReasonCodesURL', constants.CACHE_KEYS.SDC_ZERO_FTE_REASON_CODES, null, true));
//end cached code table calls

router.get('/getCollectionBySchoolId/:schoolID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.SCHOOL_SDC), findSchoolID_params, checkEDXUserAccessToRequestedInstitute, getCollectionBySchoolId);
router.get('/getCollectionByDistrictId/:districtID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.DISTRICT_SDC), findDistrictID_params, checkEDXUserAccessToRequestedInstitute, getCollectionByDistrictId);
router.get('/sdcSchoolCollection/:sdcSchoolCollectionID/duplicates', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.SCHOOL_SDC), findSdcSchoolCollectionID_params, loadSdcSchoolCollection, checkSdcSchoolCollectionAccess, getSchoolStudentDuplicates);
router.get('/sdcSchoolCollection/:sdcSchoolCollectionID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.SCHOOL_SDC), findSdcSchoolCollectionID_params, loadSdcSchoolCollection, checkSdcSchoolCollectionAccess, getSchoolCollectionById);
router.post('/:sdcSchoolCollectionID/file', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.SCHOOL_SDC), findSdcSchoolCollectionID_params, loadSdcSchoolCollection, checkSdcSchoolCollectionAccess, scanFilePayload, uploadFile);
router.get('/:sdcSchoolCollectionID/file', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.SCHOOL_SDC), findSdcSchoolCollectionID_params, loadSdcSchoolCollection, checkSdcSchoolCollectionAccess, getSdcFileProgress);
router.put('/:sdcSchoolCollectionID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.SCHOOL_SDC), findSdcSchoolCollectionID_params, loadSdcSchoolCollection, checkSdcSchoolCollectionAccess, updateSchoolCollection);

//student
router.get('/sdcSchoolCollectionStudent/:sdcSchoolCollectionID/paginated', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.SCHOOL_SDC), findSdcSchoolCollectionID_params, loadSdcSchoolCollection, checkSdcSchoolCollectionAccess, getSDCSchoolCollectionStudentPaginated);
router.get('/sdcSchoolCollectionStudent/stats/error-warning-count/:sdcSchoolCollectionID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.SCHOOL_SDC), findSdcSchoolCollectionID_params, loadSdcSchoolCollection, checkSdcSchoolCollectionAccess, getSDCSchoolCollectionStudentSummaryCounts);
router.get('/sdcSchoolCollectionStudent/:sdcSchoolCollectionStudentID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.SCHOOL_SDC), findSdcSchoolCollectionStudentID_params, loadSdcSchoolCollectionStudent, findSdcSchoolCollectionID_fromRequestedSdcSchoolCollectionStudent, loadSdcSchoolCollection, checkSdcSchoolCollectionAccess, getSDCSchoolCollectionStudentDetail);

//update student
router.post('/sdcSchoolCollectionStudent', passport.authenticate('jwt', {session: false}, undefined), 
 isValidBackendToken, validateAccessToken, findSInstituteTypeCollectionID_body, checkPermissionForRequestedInstitute(PERMISSION.DISTRICT_SDC, PERMISSION.SCHOOL_SDC), 
 loadInstituteCollection, checkInstituteCollectionAccess, checkIfCreateorUpdateSDCStudentIsAllowed, findSdcSchoolCollectionStudentID_params,
 loadSdcSchoolCollectionStudent, checkStudentBelongsInCollection, updateAndValidateSdcSchoolCollectionStudent);

router.post('/sdcSchoolCollectionStudent/:sdcSchoolCollectionID/markDiff', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.SCHOOL_SDC), findSdcSchoolCollectionID_params, loadSdcSchoolCollection, checkSdcSchoolCollectionAccess, markSdcSchoolCollectionStudentAsDifferent);
router.delete('/sdcSchoolCollectionStudent/:sdcSchoolCollectionID/student/:sdcSchoolCollectionStudentID', passport.authenticate('jwt', {session: false}, undefined), validateAccessToken, checkEdxUserPermission(PERMISSION.SCHOOL_SDC), findSdcSchoolCollectionID_params, loadSdcSchoolCollection, checkSdcSchoolCollectionAccess, deleteSDCSchoolCollectionStudent);
router.post('/sdcSchoolCollectionStudent/:sdcSchoolCollectionID/students/remove', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.SCHOOL_SDC), findSdcSchoolCollectionID_params, loadSdcSchoolCollection, checkSdcSchoolCollectionAccess, removeSDCSchoolCollectionStudents);

router.get('/sdcSchoolCollectionStudent/getStudentHeadcounts/:sdcSchoolCollectionID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.SCHOOL_SDC), findSdcSchoolCollectionID_params, loadSdcSchoolCollection, checkSdcSchoolCollectionAccess, getStudentHeadcounts);
// special case this does not use frontend axios, so need to refresh here to handle expired jwt.
router.get('/:sdcSchoolCollectionID/report/:reportTypeCode/download', auth.refreshJWT, isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.SCHOOL_SDC), findSdcSchoolCollectionID_params, loadSdcSchoolCollection, checkSdcSchoolCollectionAccess, downloadSdcReport);
router.get('/sdcDistrictCollection/:sdcDistrictCollectionID/report/:reportTypeCode/download', auth.refreshJWT, isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.DISTRICT_SDC), findSdcDistrictCollectionID_params, loadSdcDistrictCollection, checkSdcDistrictCollectionAccess, downloadSdcReport);


//district
router.get('/sdcDistrictCollection/:sdcDistrictCollectionID/paginated', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.DISTRICT_SDC), findSdcDistrictCollectionID_params, loadSdcDistrictCollection, checkSdcDistrictCollectionAccess, getSDCSchoolCollectionStudentPaginated);
router.get('/sdcDistrictCollection/:sdcDistrictCollectionID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.DISTRICT_SDC), findSdcDistrictCollectionID_params, loadSdcDistrictCollection, checkSdcDistrictCollectionAccess, getDistrictCollectionById);
router.get('/sdcDistrictCollection/:sdcDistrictCollectionID/sdcSchoolCollectionMonitoring', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.DISTRICT_SDC), findSdcDistrictCollectionID_params, loadSdcDistrictCollection, checkSdcDistrictCollectionAccess, getSdcSchoolCollectionMonitoringBySdcDistrictCollectionId);

module.exports = router;

