const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const isValidBackendToken = auth.isValidBackendToken();
const { validateAccessToken, checkEdxUserPermission, findSchoolID_params, findInstituteInformation_query, findDistrictID_params, checkEDXUserAccessToRequestedInstitute, loadIncomingFileset, checkUserHasAccessToIncomingFileset } = require('../components/permissionUtils');
const { scanFilePayload } = require('../components/fileUtils');
const { uploadFile, uploadFileXLS, getErrorFilesetStudentPaginated, getFilesetsPaginated, downloadErrorReport,
  getCurrentGradStudentsPaginated, getStudentFilesetByPenFilesetId, getSubmissionMetrics, getErrorMetrics, getActiveReportingPeriod
} = require('../components/grad');
const { PERMISSION } = require('../util/Permission');
const validate = require('../components/validator');
const {getCachedGradCollectionData} = require('../components/gdc-cache');
const constants = require('../util/constants');
const { gradFileUploadSchema, gradErrorFilesetStudentPaginatedSchema, gradDistrictFilesetPaginatedSchema, gradSchoolFilesetPaginatedSchema,
  gradDistrictFileUploadSchema, gradSchoolPenFilesetPaginatedSchema, gradSchoolFilesetByPenSchema, gradDistrictPenFilesetPaginatedSchema,
  gradDistrictFilesetByPenSchema,
  gradSchoolFilesetMetricSchema
} = require('../validations/grad');

router.get('/validation-issue-type-codes', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, 
  validateAccessToken, getCachedGradCollectionData(constants.CACHE_KEYS.GDC_VALIDATION_ISSUE_TYPE_CODES, 'grad:validationIssueTypeCodesURL'));

router.get('/validation-field-codes', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, 
  validateAccessToken, getCachedGradCollectionData(constants.CACHE_KEYS.GDC_VALIDATION_FIELD_CODES, 'grad:validationFieldCodesURL'));

router.get('/grad-program-codes', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken,
  validateAccessToken, getCachedGradCollectionData(constants.CACHE_KEYS.GDC_PROGRAM_CODES, 'grad:gradProgramCodesURL'));

router.post('/school/:schoolID/upload-file', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, 
  checkEdxUserPermission(PERMISSION.GRAD_SCH_UPLOAD), validate(gradFileUploadSchema), findSchoolID_params, checkEDXUserAccessToRequestedInstitute, scanFilePayload, uploadFile);

router.post('/school/:schoolID/upload-file-xls', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken,
  checkEdxUserPermission(PERMISSION.GRAD_SCH_UPLOAD), validate(gradFileUploadSchema), findSchoolID_params, checkEDXUserAccessToRequestedInstitute, scanFilePayload, uploadFileXLS);

router.get('/school/:schoolID/current-students', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken,
  checkEdxUserPermission(PERMISSION.GRAD_SCH_RPT_VIEW), findSchoolID_params, checkEDXUserAccessToRequestedInstitute, getCurrentGradStudentsPaginated);

router.get('/fileset/:schoolID/paginated', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken,
  checkEdxUserPermission(PERMISSION.GRAD_SCH_UPLOAD), validate(gradSchoolFilesetPaginatedSchema), findSchoolID_params, checkEDXUserAccessToRequestedInstitute, getFilesetsPaginated);

router.get('/filesetErrors/:activeIncomingFilesetID/paginated', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken,
  checkEdxUserPermission(PERMISSION.GRAD_ERR_RPT_VIEW), validate(gradErrorFilesetStudentPaginatedSchema), findInstituteInformation_query, checkEDXUserAccessToRequestedInstitute, getErrorFilesetStudentPaginated);

router.get('/filesetErrors/:activeIncomingFilesetID/errorReportDownload', auth.refreshJWT, isValidBackendToken, validateAccessToken,
  checkEdxUserPermission(PERMISSION.GRAD_ERR_RPT_VIEW), validate(gradErrorFilesetStudentPaginatedSchema), findInstituteInformation_query, checkEDXUserAccessToRequestedInstitute, downloadErrorReport);

router.get('/filesetErrors/:activeIncomingFilesetID/submission-summary', auth.refreshJWT, isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.GRAD_ERR_RPT_VIEW),
  validate(gradSchoolFilesetMetricSchema), findInstituteInformation_query, loadIncomingFileset, checkUserHasAccessToIncomingFileset, getSubmissionMetrics);

router.get('/filesetErrors/:activeIncomingFilesetID/error-summary', auth.refreshJWT, isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.GRAD_ERR_RPT_VIEW),
  validate(gradSchoolFilesetMetricSchema), findInstituteInformation_query, loadIncomingFileset, checkUserHasAccessToIncomingFileset, getErrorMetrics);

router.post('/district/:districtID/upload-file', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, 
  checkEdxUserPermission(PERMISSION.GRAD_DIS_UPLOAD), validate(gradDistrictFileUploadSchema), findDistrictID_params, checkEDXUserAccessToRequestedInstitute, scanFilePayload, uploadFile);

router.post('/district/:districtID/upload-file-xls', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken,
  checkEdxUserPermission(PERMISSION.GRAD_DIS_UPLOAD), validate(gradDistrictFileUploadSchema), findDistrictID_params, checkEDXUserAccessToRequestedInstitute, scanFilePayload, uploadFileXLS);

router.get('/fileset/district/:districtID/paginated', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken,
  checkEdxUserPermission(PERMISSION.GRAD_DIS_UPLOAD), validate(gradDistrictFilesetPaginatedSchema), findDistrictID_params, checkEDXUserAccessToRequestedInstitute, getFilesetsPaginated);

router.get('/fileset/:schoolID/pen/:pen/paginated', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken,
  checkEdxUserPermission(PERMISSION.GRAD_SCH_UPLOAD), validate(gradSchoolPenFilesetPaginatedSchema), findSchoolID_params, checkEDXUserAccessToRequestedInstitute, getFilesetsPaginated);

router.get('/fileset/:schoolID/pen/:pen', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken,
  checkEdxUserPermission(PERMISSION.GRAD_SCH_UPLOAD), validate(gradSchoolFilesetByPenSchema), findSchoolID_params, checkEDXUserAccessToRequestedInstitute, getStudentFilesetByPenFilesetId);

router.get('/fileset/district/:districtID/pen/:pen/paginated', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken,
  checkEdxUserPermission(PERMISSION.GRAD_DIS_UPLOAD), validate(gradDistrictPenFilesetPaginatedSchema), findDistrictID_params, checkEDXUserAccessToRequestedInstitute, getFilesetsPaginated);

router.get('/fileset/district/:districtID/pen/:pen', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken,
  checkEdxUserPermission(PERMISSION.GRAD_DIS_UPLOAD), validate(gradDistrictFilesetByPenSchema), findDistrictID_params, checkEDXUserAccessToRequestedInstitute, getStudentFilesetByPenFilesetId);

router.get('/active-reporting-period', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, getActiveReportingPeriod);

module.exports = router;
