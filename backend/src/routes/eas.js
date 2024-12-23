const passport = require('passport');
const express = require('express');
const router = express.Router();
const { getAssessmentSessions, getActiveAssessmentSessions, getAssessmentSessionsBySchoolYear, getAssessmentStudentsPaginated, getAssessmentStudentByID, updateAssessmentStudentByID, getAssessmentSpecialCases, deleteAssessmentStudentByID, postAssessmentStudent } = require('../components/eas/eas');
const auth = require('../components/auth');
const isValidBackendToken = auth.isValidBackendToken();
const { validateAccessToken, findInstituteType_params, checkPermissionForRequestedInstitute } = require('../components/permissionUtils');
const { PERMISSION } = require('../util/Permission');
const validate = require('../components/validator');
const {putStudentAssessmentSchema, postAssessmentStudentSchema} = require('../validations/eas');

router.get('/assessment-sessions/:instituteType', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, findInstituteType_params, checkPermissionForRequestedInstitute(PERMISSION.EAS_DIS_EDIT, PERMISSION.EAS_SCH_EDIT), getAssessmentSessions);
router.get('/assessment-sessions/active/:instituteType', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, findInstituteType_params, checkPermissionForRequestedInstitute(PERMISSION.EAS_DIS_EDIT, PERMISSION.EAS_SCH_EDIT), getActiveAssessmentSessions);
router.get('/assessment-sessions/school-year/:schoolYear/:instituteType', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, findInstituteType_params, checkPermissionForRequestedInstitute(PERMISSION.EAS_DIS_EDIT, PERMISSION.EAS_SCH_EDIT), getAssessmentSessionsBySchoolYear);

router.post('/assessment-registrations/student/:instituteType', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, findInstituteType_params, checkPermissionForRequestedInstitute(PERMISSION.EAS_DIS_EDIT, PERMISSION.EAS_SCH_EDIT), validate(postAssessmentStudentSchema), postAssessmentStudent);
router.get('/assessment-registrations/student/:instituteType/:assessmentStudentID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, findInstituteType_params,  checkPermissionForRequestedInstitute(PERMISSION.EAS_DIS_EDIT, PERMISSION.EAS_SCH_EDIT), getAssessmentStudentByID);
router.put('/assessment-registrations/student/:instituteType/:assessmentStudentID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, findInstituteType_params, checkPermissionForRequestedInstitute(PERMISSION.EAS_DIS_EDIT, PERMISSION.EAS_SCH_EDIT), validate(putStudentAssessmentSchema), updateAssessmentStudentByID);
router.get('/assessment-registrations/paginated/:instituteType', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, findInstituteType_params, checkPermissionForRequestedInstitute(PERMISSION.EAS_DIS_EDIT, PERMISSION.EAS_SCH_EDIT), getAssessmentStudentsPaginated);
router.delete('/assessment-registrations/student/:instituteType/:assessmentStudentID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, findInstituteType_params, checkPermissionForRequestedInstitute(PERMISSION.EAS_DIS_EDIT, PERMISSION.EAS_SCH_EDIT), deleteAssessmentStudentByID);

router.get('/assessment-specialcase-types', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken,  getAssessmentSpecialCases);

module.exports = router;
