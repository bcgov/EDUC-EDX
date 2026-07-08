const passport = require('passport');
const express = require('express');
const router = express.Router();
const {
  checkSchoolReportAvailability,
  checkSchoolReportTypeAvailability,
  checkStudentReportAvailability,
  checkXamFileAvailability,
  downloadAssessmentCompletionCurrentStudentsCsv,
  downloadAssessmentReport,
  downloadAssessmentStudentReport,
  downloadSchoolAssessmentRegistrationsCsv,
  downloadXamFile,
  getActiveAssessmentSessions,
  getAssessmentSessions,
  getAssessmentSessionsBySchoolYear,
  getAssessmentSpecialCases,
  getAssessmentStudentByID,
  getAssessmentStudentsPaginated,
  getDistrictSchoolsWithResults,
  postAssessmentStudent,
  removeAssessmentStudents,
  updateAssessmentStudentByID
} = require('../components/assessments/assessments');
const auth = require('../components/auth');
const isValidBackendToken = auth.isValidBackendToken();
const {
  checkCurrentUserAccessToRequestedAssessmentStudent,
  checkCurrentUserAccessToRequestedAssessmentStudents,
  checkCurrentUserAccessToSchoolSpecifiedOnAssessmentStudent,
  checkEDXUserAccessToRequestedInstitute,
  checkEdxUserPermission,
  findAssessmentStudentID_params,
  findAssessmentStudentIDs_body,
  findSchoolID_params,
  loadRequestedAssessmentStudent,
  loadRequestedAssessmentStudents,
  validateAccessToken
} = require('../components/permissionUtils');
const { PERMISSION } = require('../util/Permission');
const validate = require('../components/validator');
const {
  checkSchoolReportAvailabilitySchema,
  checkSchoolReportTypeAvailabilitySchema,
  checkStudentReportAvailabilitySchema,
  checkXamFileAvailabilitySchema,
  postAssessmentStudentSchema,
  putStudentAssessmentSchema
} = require('../validations/assessments');

router.get('/assessment-sessions/district', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EAS_DIS_VIEW), getAssessmentSessions);
router.get('/assessment-sessions/school', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EAS_SCH_VIEW), getAssessmentSessions);
router.get('/assessment-sessions/district/active', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EAS_DIS_VIEW), getActiveAssessmentSessions);
router.get('/assessment-sessions/school/active', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EAS_SCH_VIEW), getActiveAssessmentSessions);
router.get('/assessment-sessions/district/school-year/:schoolYear', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EAS_DIS_VIEW), getAssessmentSessionsBySchoolYear);
router.get('/assessment-sessions/school/school-year/:schoolYear', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EAS_SCH_VIEW), getAssessmentSessionsBySchoolYear);

router.post('/assessment-registrations/district/students', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EAS_DIS_EDIT), validate(postAssessmentStudentSchema), checkCurrentUserAccessToSchoolSpecifiedOnAssessmentStudent, postAssessmentStudent);
router.post('/assessment-registrations/school/students', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EAS_SCH_EDIT), validate(postAssessmentStudentSchema), checkCurrentUserAccessToSchoolSpecifiedOnAssessmentStudent, postAssessmentStudent);
router.get('/assessment-registrations/district/students/paginated', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EAS_DIS_VIEW), getAssessmentStudentsPaginated);
router.get('/assessment-registrations/school/students/paginated', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EAS_SCH_VIEW), getAssessmentStudentsPaginated);
router.get('/assessment-registrations/district/students/:assessmentStudentID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EAS_DIS_VIEW), findAssessmentStudentID_params, loadRequestedAssessmentStudent, checkCurrentUserAccessToRequestedAssessmentStudent, getAssessmentStudentByID);
router.get('/assessment-registrations/school/students/:assessmentStudentID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EAS_SCH_VIEW), findAssessmentStudentID_params, loadRequestedAssessmentStudent, checkCurrentUserAccessToRequestedAssessmentStudent, getAssessmentStudentByID);
router.put('/assessment-registrations/district/students/:assessmentStudentID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EAS_DIS_EDIT), validate(putStudentAssessmentSchema), findAssessmentStudentID_params, loadRequestedAssessmentStudent, checkCurrentUserAccessToRequestedAssessmentStudent, checkCurrentUserAccessToSchoolSpecifiedOnAssessmentStudent, updateAssessmentStudentByID);
router.put('/assessment-registrations/school/students/:assessmentStudentID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EAS_SCH_EDIT), validate(putStudentAssessmentSchema), findAssessmentStudentID_params, loadRequestedAssessmentStudent, checkCurrentUserAccessToRequestedAssessmentStudent, checkCurrentUserAccessToSchoolSpecifiedOnAssessmentStudent, updateAssessmentStudentByID);
router.post('/assessment-registrations/district/students/remove', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EAS_DIS_EDIT), findAssessmentStudentIDs_body, loadRequestedAssessmentStudents, checkCurrentUserAccessToRequestedAssessmentStudents, removeAssessmentStudents);
router.post('/assessment-registrations/school/students/remove', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EAS_SCH_EDIT), findAssessmentStudentIDs_body, loadRequestedAssessmentStudents, checkCurrentUserAccessToRequestedAssessmentStudents, removeAssessmentStudents);
router.get('/assessment-registrations/school/export', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EAS_SCH_VIEW), downloadSchoolAssessmentRegistrationsCsv);
router.get('/reports/school/assessment-completions/current-students/download', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EAS_SCH_VIEW), downloadAssessmentCompletionCurrentStudentsCsv);
router.get('/reports/district/assessment-completions/current-students/download', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EAS_DIS_VIEW), downloadAssessmentCompletionCurrentStudentsCsv);

router.get('/assessment-specialcase-types', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken,  getAssessmentSpecialCases);

router.get('/reports/district/:sessionID/school/:schoolID/xam/download', auth.refreshJWT, isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EAS_DIS_VIEW), findSchoolID_params, checkEDXUserAccessToRequestedInstitute, downloadXamFile);
router.get('/reports/school/:sessionID/school/:schoolID/xam/download', auth.refreshJWT, isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EAS_SCH_VIEW), findSchoolID_params, checkEDXUserAccessToRequestedInstitute, downloadXamFile);
router.get('/reports/district/:sessionID/school/:schoolID/:reportTypeCode/download', auth.refreshJWT, isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EAS_DIS_VIEW), findSchoolID_params, checkEDXUserAccessToRequestedInstitute, downloadAssessmentReport);
router.get('/reports/school/:sessionID/school/:schoolID/:reportTypeCode/download', auth.refreshJWT, isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EAS_SCH_VIEW), findSchoolID_params, checkEDXUserAccessToRequestedInstitute, downloadAssessmentReport);
router.get('/reports/student/:studentID/:reportTypeCode/download', auth.refreshJWT, isValidBackendToken, validateAccessToken, validate(checkStudentReportAvailabilitySchema), checkEdxUserPermission(PERMISSION.EAS_SCH_VIEW), downloadAssessmentStudentReport);
router.get('/reports/district/:sessionID/school/:schoolID/results/available', auth.refreshJWT, isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EAS_DIS_VIEW), validate(checkSchoolReportAvailabilitySchema), findSchoolID_params, checkEDXUserAccessToRequestedInstitute, checkSchoolReportAvailability);
router.get('/reports/school/:sessionID/school/:schoolID/results/available', auth.refreshJWT, isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EAS_SCH_VIEW), validate(checkSchoolReportAvailabilitySchema), findSchoolID_params, checkEDXUserAccessToRequestedInstitute, checkSchoolReportAvailability);

router.get('/reports/district/:sessionID/school/:schoolID/xam/available', auth.refreshJWT, isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EAS_DIS_VIEW), validate(checkXamFileAvailabilitySchema), findSchoolID_params, checkEDXUserAccessToRequestedInstitute, checkXamFileAvailability);
router.get('/reports/school/:sessionID/school/:schoolID/xam/available', auth.refreshJWT, isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EAS_SCH_VIEW), validate(checkXamFileAvailabilitySchema), findSchoolID_params, checkEDXUserAccessToRequestedInstitute, checkXamFileAvailability);
router.get('/reports/district/:sessionID/school/:schoolID/:reportTypeCode/available', auth.refreshJWT, isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EAS_DIS_VIEW), validate(checkSchoolReportTypeAvailabilitySchema), findSchoolID_params, checkEDXUserAccessToRequestedInstitute, checkSchoolReportTypeAvailability);
router.get('/reports/school/:sessionID/school/:schoolID/:reportTypeCode/available', auth.refreshJWT, isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EAS_SCH_VIEW), validate(checkSchoolReportTypeAvailabilitySchema), findSchoolID_params, checkEDXUserAccessToRequestedInstitute, checkSchoolReportTypeAvailability);
router.get('/reports/student/:studentID/:reportTypeCode/available', auth.refreshJWT, isValidBackendToken, validateAccessToken, validate(checkStudentReportAvailabilitySchema), checkEdxUserPermission(PERMISSION.EAS_SCH_VIEW), checkStudentReportAvailability);

router.get('/reports/district/:sessionID/schools-with-results', auth.refreshJWT, isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EAS_DIS_VIEW), getDistrictSchoolsWithResults);

module.exports = router;
