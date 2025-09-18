const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const isValidBackendToken = auth.isValidBackendToken();
const { validateAccessToken, checkEdxUserPermission} = require('../components/permissionUtils');
const {downloadStudentGradReport, downloadSummaryGradReport, downloadTVRSummary, downloadGradYukonReport} = require('../components/gradReports');
const { PERMISSION } = require('../util/Permission');
const validate = require('../components/validator');
const {gradReportDownloadSchema} = require('../validations/gradReports');

router.get('/student/report', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.GRAD_SCH_RPT_VIEW),
  validate(gradReportDownloadSchema), downloadStudentGradReport);
router.get('/school/:schoolID/summary', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.GRAD_SCH_RPT_VIEW),
  validate(gradReportDownloadSchema), downloadSummaryGradReport);
router.get('/school/:schoolID/tvr', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.GRAD_SCH_RPT_VIEW),
  validate(gradReportDownloadSchema), downloadTVRSummary);
router.get('/district/:districtID/summary', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.GRAD_DIS_RPT_VIEW),
  validate(gradReportDownloadSchema), downloadSummaryGradReport);

router.get('/district/:districtID/yukon-report/:fromDate/:toDate', auth.refreshJWT, isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.GRAD_DIS_RPT_VIEW), 
  validate(gradReportDownloadSchema), downloadGradYukonReport);

module.exports = router;