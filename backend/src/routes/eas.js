const passport = require('passport');
const express = require('express');
const router = express.Router();
const { getAssessmentSessions, getActiveAssessmentSessions, getAssessmentSessionsBySchoolYear, getAssessmentStudentsPaginated } = require('../components/eas/eas');
const auth = require('../components/auth');
const isValidBackendToken = auth.isValidBackendToken();
const { validateAccessToken, findInstituteType_params, checkPermissionForRequestedInstitute } = require('../components/permissionUtils');
const { PERMISSION } = require('../util/Permission');


router.get('/assessment-sessions/:instituteType', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, findInstituteType_params, checkPermissionForRequestedInstitute(PERMISSION.EAS_DIS_EDIT, PERMISSION.EAS_SCH_EDIT), getAssessmentSessions);
router.get('/assessment-sessions/active/:instituteType', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, findInstituteType_params, checkPermissionForRequestedInstitute(PERMISSION.EAS_DIS_EDIT, PERMISSION.EAS_SCH_EDIT), getActiveAssessmentSessions);
router.get('/assessment-sessions/school-year/:schoolYear/:instituteType', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, findInstituteType_params, checkPermissionForRequestedInstitute(PERMISSION.EAS_DIS_EDIT, PERMISSION.EAS_SCH_EDIT), getAssessmentSessionsBySchoolYear);

router.get('/assessment-registrations/paginated/:instituteType', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, findInstituteType_params, checkPermissionForRequestedInstitute(PERMISSION.EAS_DIS_EDIT, PERMISSION.EAS_SCH_EDIT), getAssessmentStudentsPaginated);


module.exports = router;
