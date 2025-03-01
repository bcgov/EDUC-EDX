'use strict';

const passport = require('passport');
const express = require('express');
const { deleteDocument, downloadFile, uploadFile, getExchanges, createExchange, getExchange, markAs, activateEdxUser,verifyActivateUserLink,instituteSelection,districtUserActivationInvite,schoolUserActivationInvite,getEdxUsers,getAllDistrictSchoolEdxUsers, updateEdxUserSchoolRoles, updateEdxUserDistrictRoles,
  createSecureExchangeComment,clearActiveSession,getExchangesCount, relinkUserAccess, createSecureExchangeStudent, findPrimaryEdxActivationCode, generateOrRegeneratePrimaryEdxActivationCode, removeSecureExchangeStudent,
  removeUserSchoolOrDistrictAccess, updateEdxUserSchool, getRolesByInstituteType
} = require('../components/secureExchange');
const { forwardGetReq, getCodes } = require('../components/utils');
const { scanFilePayload, scanSecureExchangeDocumentPayload } = require('../components/fileUtils');
const config = require('../config/index');
const auth = require('../components/auth');
const {CACHE_KEYS} = require('../util/constants');
const isValidBackendToken = auth.isValidBackendToken();
const router = express.Router();
const { findSecureExchange_id_params, loadSecureExchange, checkSecureExchangeAccess , checkIfRoleIsAllowedForSchool, checkUserRoleForNewUser, conflictActionOnClosedSecureExchange, checkEdxUserPermission, checkPermissionForRequestedInstitute, validateAccessToken, findInstituteInformation_query, findInstituteInformation_body_params, findInstituteType_params, findInstituteIdentifier_params, findSchoolID_body, findSchoolID_body_params, findDistrictID_query, findDistrictID_body, findDistrictID_body_params, checkEDXUserAccessToRequestedInstitute, checkActiveInstituteIdentifier } = require('../components/permissionUtils');
const { PERMISSION } = require('../util/Permission');
const validate = require('../components/validator');
const { exchangeSchema, exchangeDocumentSchema, exchangeStudentSchema, exchangeCommentSchema, getExchangeDocumentSchema, getDownloadExchangeDocumentSchema, deleteExchangeDocumentSchema, deleteExchangeStudentSchema, putExchangeMarkAsSchema, getByExchangeIdSchema, getExchangePaginatedSchema, getExchangeCountSchema,   
  districtUserInviteSchema, schoolUserInviteSchema, getUserActivationSchema, userActivationSchema, primaryUserActivationSchema, instituteSelectionSchema, districtSchoolSchema, userSchoolSchema, getUserSchoolSchema, getUserRoleSchema, getUserSchema, getDistrictUsersSchema, userRelinkSchema, userRemoveSchema } = require('../validations/edx');

router.get('/', (_req, res) => {
  res.status(200).json({
    endpoints: [
      '/document-type-codes',
      '/file-requirements',
    ]
  });
});

router.get('/document-types', passport.authenticate('jwt', {session: false}), isValidBackendToken, validateAccessToken, getCodes('edx:exchangeURL', CACHE_KEYS.EDX_SECURE_EXCHANGE_DOCUMENT_TYPES, '/document-types'));

router.get('/file-requirements', passport.authenticate('jwt', {session: false}), isValidBackendToken, validateAccessToken, getCodes('edx:exchangeURL', CACHE_KEYS.EDX_SECURE_EXChANGE_FILE_REQUIREMENTS, '/file-requirements'));

router.post('/exchange/:id/documents', passport.authenticate('jwt', {session: false}), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.SECURE_EXCHANGE), validate(exchangeDocumentSchema), findSecureExchange_id_params, loadSecureExchange, checkSecureExchangeAccess, conflictActionOnClosedSecureExchange, scanFilePayload, uploadFile);

router.get('/exchange/:id/documents', passport.authenticate('jwt', {session: false}), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.SECURE_EXCHANGE), validate(getByExchangeIdSchema), findSecureExchange_id_params, loadSecureExchange, checkSecureExchangeAccess, (req, res) => forwardGetReq(req, res, `${config.get('edx:exchangeURL')}/${req.params.id}/documents`));

router.get('/exchange/:id/documents/:documentId', passport.authenticate('jwt', {session: false}), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.SECURE_EXCHANGE), validate(getExchangeDocumentSchema), findSecureExchange_id_params, loadSecureExchange, checkSecureExchangeAccess, (req, res) => forwardGetReq(req, res, `${config.get('edx:exchangeURL')}/${req.params.id}/documents/${req.params.documentId}`));
// special case this does not use frontend axios, so need to refresh here to handle expired jwt.
router.get('/exchange/:id/documents/:documentId/download/:fileName', auth.refreshJWT, isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.SECURE_EXCHANGE), validate(getDownloadExchangeDocumentSchema), findSecureExchange_id_params, loadSecureExchange, checkSecureExchangeAccess, downloadFile);

router.post('/exchange', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.SECURE_EXCHANGE), validate(exchangeSchema), scanSecureExchangeDocumentPayload, createExchange);
router.get('/exchange', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.SECURE_EXCHANGE), validate(getExchangePaginatedSchema), getExchanges);
router.get('/exchange/count', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.SECURE_EXCHANGE), validate(getExchangeCountSchema), getExchangesCount);
router.get('/exchange/role-permissions', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, getCodes('edx:edxRolePermissionsURL', CACHE_KEYS.EDX_ROLE_PERMISSIONS));
router.get('/exchange/statuses', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, getCodes('edx:exchangeStatusesURL', CACHE_KEYS.EDX_SECURE_EXCHANGE_STATUS));
router.delete('/exchange/:id/documents/:documentId', passport.authenticate('jwt', {session: false}), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.SECURE_EXCHANGE), validate(deleteExchangeDocumentSchema), findSecureExchange_id_params, loadSecureExchange, checkSecureExchangeAccess, conflictActionOnClosedSecureExchange, deleteDocument);
router.delete('/exchange/:id/removeStudent/:studentID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.SECURE_EXCHANGE), validate(deleteExchangeStudentSchema), findSecureExchange_id_params, loadSecureExchange, checkSecureExchangeAccess, conflictActionOnClosedSecureExchange, removeSecureExchangeStudent);
router.get('/exchange/:id', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.SECURE_EXCHANGE), validate(getByExchangeIdSchema), findSecureExchange_id_params, loadSecureExchange, checkSecureExchangeAccess, getExchange);
router.post('/exchange/:id/comments', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.SECURE_EXCHANGE), validate(exchangeCommentSchema), findSecureExchange_id_params, loadSecureExchange, checkSecureExchangeAccess, conflictActionOnClosedSecureExchange, createSecureExchangeComment);
router.post('/exchange/:id/students', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.SECURE_EXCHANGE), validate(exchangeStudentSchema), findSecureExchange_id_params, loadSecureExchange, checkSecureExchangeAccess, conflictActionOnClosedSecureExchange, createSecureExchangeStudent);
router.put('/exchange/:id/markAs/:readStatus', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.SECURE_EXCHANGE), validate(putExchangeMarkAsSchema), findSecureExchange_id_params, loadSecureExchange, checkSecureExchangeAccess, markAs);
router.post('/users/remove', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, validate(userRemoveSchema), findInstituteInformation_body_params, checkPermissionForRequestedInstitute(PERMISSION.EDX_USER_DISTRICT_ADMIN, PERMISSION.EDX_USER_SCHOOL_ADMIN), checkEDXUserAccessToRequestedInstitute, removeUserSchoolOrDistrictAccess);
router.post('/users/relink', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, validate(userRelinkSchema), findInstituteInformation_body_params, checkPermissionForRequestedInstitute(PERMISSION.EDX_USER_DISTRICT_ADMIN, PERMISSION.EDX_USER_SCHOOL_ADMIN), checkEDXUserAccessToRequestedInstitute, relinkUserAccess);
router.get('/users/ministry-teams', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, getCodes('edx:ministryTeamURL', CACHE_KEYS.EDX_MINISTRY_TEAMS));
router.get('/users/user-schools', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, validate(getUserSchoolSchema), 
  (req, res) => forwardGetReq(req, res,`${config.get('edx:rootURL')}/users/user-schools`)
);
router.get('/users/activation-code/primary/:instituteType/:instituteIdentifier', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, validate(getUserActivationSchema), findInstituteType_params, findInstituteIdentifier_params, checkPermissionForRequestedInstitute(PERMISSION.EDX_USER_DISTRICT_ADMIN, PERMISSION.EDX_USER_SCHOOL_ADMIN), checkEDXUserAccessToRequestedInstitute, findPrimaryEdxActivationCode);
router.post('/users/activation-code/primary/:instituteType/:instituteIdentifier', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, validate(primaryUserActivationSchema), findInstituteType_params, findInstituteIdentifier_params, checkPermissionForRequestedInstitute(PERMISSION.EDX_USER_DISTRICT_ADMIN, PERMISSION.EDX_USER_SCHOOL_ADMIN), checkEDXUserAccessToRequestedInstitute, generateOrRegeneratePrimaryEdxActivationCode);

router.post('/user-activation', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, validate(userActivationSchema), activateEdxUser);
router.get('/activate-user-verification', verifyActivateUserLink);
router.get('/users/roles', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkActiveInstituteIdentifier, validate(getUserRoleSchema), getRolesByInstituteType);
router.post('/users/user-school', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EDX_USER_DISTRICT_ADMIN), validate(userSchoolSchema), findSchoolID_body_params, checkEDXUserAccessToRequestedInstitute, updateEdxUserSchool);
router.post('/users/roles/school', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EDX_USER_SCHOOL_ADMIN), checkIfRoleIsAllowedForSchool, validate(userSchoolSchema), findSchoolID_body_params, checkEDXUserAccessToRequestedInstitute, updateEdxUserSchoolRoles);
router.post('/users/roles/district', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EDX_USER_DISTRICT_ADMIN), validate(districtSchoolSchema), findDistrictID_body_params, checkEDXUserAccessToRequestedInstitute, updateEdxUserDistrictRoles);
router.get('/users/clearActiveUserSession', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, clearActiveSession) ;
router.post('/institute-selection', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validate(instituteSelectionSchema), instituteSelection);
router.get('/users', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, validate(getUserSchema), findInstituteInformation_query, checkPermissionForRequestedInstitute(PERMISSION.EDX_USER_DISTRICT_ADMIN, PERMISSION.EDX_USER_SCHOOL_ADMIN), checkEDXUserAccessToRequestedInstitute, getEdxUsers);
router.get('/all-district-school-users', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EDX_USER_DISTRICT_ADMIN), validate(getDistrictUsersSchema), findDistrictID_query, checkEDXUserAccessToRequestedInstitute, getAllDistrictSchoolEdxUsers);
router.post('/school-user-activation-invite', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EDX_USER_SCHOOL_ADMIN), validate(schoolUserInviteSchema), findSchoolID_body, checkEDXUserAccessToRequestedInstitute, checkUserRoleForNewUser,schoolUserActivationInvite);
router.post('/district-user-activation-invite', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.EDX_USER_DISTRICT_ADMIN), validate(districtUserInviteSchema), findDistrictID_body, checkEDXUserAccessToRequestedInstitute, districtUserActivationInvite);

module.exports = router;
