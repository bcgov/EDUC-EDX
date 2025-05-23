const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const isValidBackendToken = auth.isValidBackendToken();
const { validateAccessToken, checkEdxUserPermission} = require('../components/permissionUtils');
const {getActiveChallengeReportsPeriod, downloadDistrictChallengeReport, getDistrictChallengeReportsCounts} = require('../components/challengeReports');
const { PERMISSION } = require('../util/Permission');
const validate = require('../components/validator');
const {getChallengeReportPeriodSchema, getChallengeReportDownloadSchema} = require('../validations/challengeReports');

router.get('/active-period', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.SUPERINT),
  validate(getChallengeReportPeriodSchema), getActiveChallengeReportsPeriod);

router.get('/:districtID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.SUPERINT),
  validate(getChallengeReportDownloadSchema), getDistrictChallengeReportsCounts);

router.get('/:districtID/download', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.SUPERINT),
  validate(getChallengeReportDownloadSchema), downloadDistrictChallengeReport);

module.exports = router;
