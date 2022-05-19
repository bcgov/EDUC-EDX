'use strict';

const passport = require('passport');
const express = require('express');
const { verifyRequest, deleteDocument, downloadFile, uploadFile, getExchanges } = require('../components/secureExchange');
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

router.get('/document-type-codes', passport.authenticate('jwt', {session: false}), isValidBackendToken,
  (req, res) => forwardGetReq(req, res, config.get('edx:rootURL') + '/document-types')
);

router.get('/file-requirements', passport.authenticate('jwt', {session: false}), isValidBackendToken,
  (req, res) => forwardGetReq(req, res, config.get('edx:rootURL') + '/file-requirements')
);

router.post('/exchanges/:id/documents', passport.authenticate('jwt', {session: false}), isValidBackendToken, [verifyRequest, uploadFile]);

router.get('/exchanges/:id/documents', passport.authenticate('jwt', {session: false}), isValidBackendToken, verifyRequest,
  (req, res) => forwardGetReq(req, res, `${config.get('edx:rootURL')}/${req.params.id}/documents`)
);

router.get('/exchanges/:id/documents/:documentId', passport.authenticate('jwt', {session: false}), isValidBackendToken, verifyRequest,
  (req, res) => forwardGetReq(req, res, `${config.get('edx:rootURL')}/${req.params.id}/documents/${req.params.documentId}`)
);
// special case this does not use frontend axios, so need to refresh here to handle expired jwt.
router.get('/exchanges/:id/documents/:documentId/download/:fileName', auth.refreshJWT, isValidBackendToken, [verifyRequest, downloadFile]);

router.delete('/exchanges/:id/documents/:documentId', passport.authenticate('jwt', {session: false}), isValidBackendToken, [verifyRequest, deleteDocument]);

router.get('/exchange', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getExchanges);
router.get('/exchange/statuses', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getCodes('edx:exchangeStatusesURL', CACHE_KEYS.EDX_SECURE_EXCHANGE_STATUS));
router.get('/users/ministry-teams', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getCodes('edx:ministryTeamURL', CACHE_KEYS.EDX_MINISTRY_TEAMS));
router.get('/users/user-schools/mincodes', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken,
  (req, res) => forwardGetReq(req, res,`${config.get('edx:rootURL')}/users/user-schools/mincodes`)
);

module.exports = router;
