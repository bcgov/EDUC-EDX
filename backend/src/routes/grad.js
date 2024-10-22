const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const isValidBackendToken = auth.isValidBackendToken();
const { validateAccessToken, checkEdxUserPermission, findSdcSchoolCollectionID_params, loadSdcSchoolCollection, checkSdcSchoolCollectionAccess} = require('../components/permissionUtils');
const { scanFilePayload } = require('../components/fileUtils');
const { uploadFile, getSdcFileProgress} = require('../components/grad');
const { PERMISSION } = require('../util/Permission');
const validate = require('../components/validator');
const { gradFileUploadSchema, gradFileBySchoolIDSchema} = require('../validations/grad');

router.post('/school/:schoolID/upload-file', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, 
checkEdxUserPermission(PERMISSION.GRAD_SCH_EDIT), validate(gradFileUploadSchema), scanFilePayload, uploadFile);

router.get('/school/:schoolID/file-progress', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, 
checkEdxUserPermission(PERMISSION.GRAD_SCH_EDIT), validate(gradFileBySchoolIDSchema), getSdcFileProgress);

module.exports = router;