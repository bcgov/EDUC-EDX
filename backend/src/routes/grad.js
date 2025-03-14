const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const isValidBackendToken = auth.isValidBackendToken();
const { validateAccessToken, checkEdxUserPermission } = require('../components/permissionUtils');
const { scanFilePayload } = require('../components/fileUtils');
const { uploadFile, getErrorFilesetStudentPaginated, getFilesetsPaginated, downloadErrorReport,
  getCurrentGradStudentsPaginated
} = require('../components/grad');
const { PERMISSION } = require('../util/Permission');
const validate = require('../components/validator');
const {getCachedGradCollectionData} = require('../components/gdc-cache');
const constants = require('../util/constants');
const { gradFileUploadSchema, gradErrorFilesetStudentPaginatedSchema, gradDistrictFilesetPaginatedSchema, gradSchoolFilesetPaginatedSchema,
  gradDistrictFileUploadSchema
} = require('../validations/grad');

router.get('/validation-issue-type-codes', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, 
  validateAccessToken, getCachedGradCollectionData(constants.CACHE_KEYS.GDC_VALIDATION_ISSUE_TYPE_CODES, 'grad:validationIssueTypeCodesURL'));

router.get('/validation-field-codes', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, 
  validateAccessToken, getCachedGradCollectionData(constants.CACHE_KEYS.GDC_VALIDATION_FIELD_CODES, 'grad:validationFieldCodesURL'));

router.post('/school/:schoolID/upload-file', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, 
  checkEdxUserPermission(PERMISSION.GRAD_SCH_UPLOAD), validate(gradFileUploadSchema), scanFilePayload, uploadFile);

router.get('/school/:schoolID/current-students', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken,
  checkEdxUserPermission(PERMISSION.GRAD_SCH_RPT_VIEW), getCurrentGradStudentsPaginated);

router.get('/filesetErrors/:activeIncomingFilesetID/paginated', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken,
  checkEdxUserPermission(PERMISSION.GRAD_ERR_RPT_VIEW), validate(gradErrorFilesetStudentPaginatedSchema),
  getErrorFilesetStudentPaginated);

router.get('/fileset/:schoolID/paginated', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken,
  checkEdxUserPermission(PERMISSION.GRAD_SCH_UPLOAD), validate(gradSchoolFilesetPaginatedSchema),
  getFilesetsPaginated);

router.get('/filesetErrors/:activeIncomingFilesetID/errorReportDownload', auth.refreshJWT, isValidBackendToken, validateAccessToken,
  checkEdxUserPermission(PERMISSION.GRAD_ERR_RPT_VIEW), validate(gradErrorFilesetStudentPaginatedSchema),
  downloadErrorReport);

router.post('/district/:districtID/upload-file', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, 
  checkEdxUserPermission(PERMISSION.GRAD_DIS_UPLOAD), validate(gradDistrictFileUploadSchema), scanFilePayload, uploadFile);

router.get('/fileset/district/:districtID/paginated', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken,
  checkEdxUserPermission(PERMISSION.GRAD_DIS_UPLOAD), validate(gradDistrictFilesetPaginatedSchema),
  getFilesetsPaginated);

module.exports = router;
