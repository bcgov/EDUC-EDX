const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const isValidBackendToken = auth.isValidBackendToken();
const { validateAccessToken, checkEdxUserPermission} = require('../components/permissionUtils');
const { scanFilePayload } = require('../components/fileUtils');
const { uploadFile, getFileProgress, getErrorFilesetStudentPaginated} = require('../components/grad');
const { PERMISSION } = require('../util/Permission');
const validate = require('../components/validator');
const {getCachedGradCollectionData} = require('../components/gdc-cache');
const constants = require('../util/constants');
const { gradFileUploadSchema, gradFileBySchoolIDSchema, gradErrorFilesetStudentPaginatedSchema} = require('../validations/grad');

router.get('/validation-issue-type-codes', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, 
  validateAccessToken, getCachedGradCollectionData(constants.CACHE_KEYS.GDC_VALIDATION_ISSUE_TYPE_CODES, 'grad:validationIssueTypeCodesURL'));

router.post('/school/:schoolID/upload-file', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, 
  checkEdxUserPermission(PERMISSION.GRAD_SCH_EDIT), validate(gradFileUploadSchema), scanFilePayload, uploadFile);

router.get('/school/:schoolID/file-progress', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, 
  checkEdxUserPermission(PERMISSION.GRAD_SCH_EDIT), validate(gradFileBySchoolIDSchema), getFileProgress);

router.get('/filesetErrors/:schoolID/paginated', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken,
  checkEdxUserPermission(PERMISSION.GRAD_SCH_EDIT), validate(gradErrorFilesetStudentPaginatedSchema),
  getErrorFilesetStudentPaginated);


module.exports = router;
