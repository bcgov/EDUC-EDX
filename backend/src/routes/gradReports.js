const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const isValidBackendToken = auth.isValidBackendToken();
const { validateAccessToken, checkEdxUserPermission} = require('../components/permissionUtils');
const {downloadStudentGradReport} = require('../components/gradReports');
const { PERMISSION } = require('../util/Permission');
const validate = require('../components/validator');
const constants = require('../util/constants');
const {gradReportDownloadSchema} = require('../validations/gradReports');

// Student reports by PEN
router.get('/transcript', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.GRAD_SCH_RPT_VIEW),
    validate(gradReportDownloadSchema), (req, res) => downloadStudentGradReport(req, res, 'transcript'));
router.get('/tvr', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.GRAD_SCH_RPT_VIEW),
    validate(gradReportDownloadSchema), (req, res) => downloadStudentGradReport(req, res, 'tvr'));
router.get('/xml', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.GRAD_SCH_RPT_VIEW),
    validate(gradReportDownloadSchema), (req, res) => downloadStudentGradReport(req, res, 'xml'));

module.exports = router;