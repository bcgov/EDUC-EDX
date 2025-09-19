const express = require('express');
const router = express.Router();
const {  downloadPsiSelectionReport } = require('../components/psiSelection');
const auth = require('../components/auth');
const isValidBackendToken = auth.isValidBackendToken();
const { isValidUUIDParam, validateAccessToken, checkEdxUserPermission } = require('../components/permissionUtils');
const { PERMISSION } = require('../util/Permission');


router.get('/psi/report/school/:schoolID', auth.refreshJWT, isValidBackendToken, validateAccessToken, isValidUUIDParam('schoolID'), checkEdxUserPermission(PERMISSION.EAS_SCH_VIEW), downloadPsiSelectionReport);

module.exports = router;
