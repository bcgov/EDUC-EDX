'use strict';

const passport = require('passport');
const express = require('express');
const { verifyRequest, deleteDocument, downloadFile, uploadFile, getExchanges, createExchange, getExchange, markAs, activateSchoolUser,verifyActivateUserLink,instituteSelection,schoolUserActivationInvite,getEdxUsers,updateEdxUserRoles,
  createSecureExchangeComment,clearActiveSession,getExchangesCount, removeUserSchoolAccess, relinkUserSchoolAccess, createSecureExchangeStudent, findPrimaryEdxActivationCode
} = require('../components/secureExchange');
const { forwardGetReq, getCodes } = require('../components/utils');
const config = require('../config/index');
const auth = require('../components/auth');
const {CACHE_KEYS} = require('../components/constants');
const isValidBackendToken = auth.isValidBackendToken();
const router = express.Router();

router.get('/', (_req, res) => {
  res.status(200).json({
    endpoints: [
      '/document-type-codes',
      '/file-requirements',
    ]
  });
});

router.get('/document-types', passport.authenticate('jwt', {session: false}), isValidBackendToken, getCodes('edx:exchangeURL', CACHE_KEYS.EDX_SECURE_EXCHANGE_DOCUMENT_TYPES, '/document-types'));

router.get('/file-requirements', passport.authenticate('jwt', {session: false}), isValidBackendToken, getCodes('edx:exchangeURL', CACHE_KEYS.EDX_SECURE_EXChANGE_FILE_REQUIREMENTS, '/file-requirements'));

router.post('/exchange/:id/documents', passport.authenticate('jwt', {session: false}), isValidBackendToken, [verifyRequest, uploadFile]);

router.get('/exchange/:id/documents', passport.authenticate('jwt', {session: false}), isValidBackendToken, verifyRequest,
  (req, res) => forwardGetReq(req, res, `${config.get('edx:exchangeURL')}/${req.params.id}/documents`)
);

router.get('/exchange/:id/documents/:documentId', passport.authenticate('jwt', {session: false}), isValidBackendToken, verifyRequest,
  (req, res) => forwardGetReq(req, res, `${config.get('edx:exchangeURL')}/${req.params.id}/documents/${req.params.documentId}`)
);
// special case this does not use frontend axios, so need to refresh here to handle expired jwt.
router.get('/exchange/:id/documents/:documentId/download/:fileName', auth.refreshJWT, isValidBackendToken, [verifyRequest, downloadFile]);

router.delete('/exchange/:id/documents/:documentId', passport.authenticate('jwt', {session: false}), isValidBackendToken, [verifyRequest, deleteDocument]);

router.post('/exchange', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, createExchange);
router.get('/exchange', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getExchanges);
router.post('/exchange', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, createExchange);
router.get('/exchange/count', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getExchangesCount);
router.get('/exchange/:secureExchangeID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getExchange);
router.post('/exchange/:secureExchangeID/comments', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, createSecureExchangeComment);
router.post('/exchange/:secureExchangeID/students', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, createSecureExchangeStudent);
router.put('/exchange/:secureExchangeID/markAs/:readStatus', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, markAs);
router.get('/exchange/role-permissions', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getCodes('edx:edxRolePermissionsURL', CACHE_KEYS.EDX_ROLE_PERMISSIONS));
router.get('/exchange/statuses', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getCodes('edx:exchangeStatusesURL', CACHE_KEYS.EDX_SECURE_EXCHANGE_STATUS));
router.post('/users/remove', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, removeUserSchoolAccess);
router.post('/users/relink', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, relinkUserSchoolAccess);
router.get('/users/ministry-teams', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getCodes('edx:ministryTeamURL', CACHE_KEYS.EDX_MINISTRY_TEAMS));
router.get('/users/user-schools/mincodes', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken,
  (req, res) => forwardGetReq(req, res,`${config.get('edx:rootURL')}/users/user-schools/mincodes`)
);
router.get('/users/activation-code/primary/:mincode', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, findPrimaryEdxActivationCode);
router.post('/user-activation', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, activateSchoolUser);
router.get('/activate-user-verification', verifyActivateUserLink);
router.get('/users/roles', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, (req, res) => forwardGetReq(req, res,`${config.get('edx:rootURL')}/users/roles`));
router.post('/users/roles', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, updateEdxUserRoles);
router.get('/users', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, (req, res) => forwardGetReq(req, res,`${config.get('edx:rootURL')}/users`));
router.get('/users/clearActiveUserSession', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, clearActiveSession) ;
router.post('/institute-selection', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, instituteSelection);
router.get('/users', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getEdxUsers);
router.post('/school-user-activation-invite', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, schoolUserActivationInvite);

module.exports = router;
