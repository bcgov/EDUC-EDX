'use strict';

const passport = require('passport');
const express = require('express');
const { getCodes, postComment, submitRequest, getComments, verifyEmail, setRequestAsSubsrev, resendVerificationEmail, verifyRequest, verifyPostCommentRequest, deleteDocument, downloadFile, uploadFile } = require('../components/request');
const { forwardGetReq } = require('../components/utils');
const config = require('../config/index');
const { verifyPenRequestStatus, createPenRequestCommentPayload, createPenRequestCommentEvent } = require('../components/penRequest');
const auth = require('../components/auth');
const isValidBackendToken = auth.isValidBackendToken();
const router = express.Router();

router.get('/', (_req, res) => {
  res.status(200).json({
    endpoints: [
      '/requests',
      '/codes',
      '/document-type-codes',
      '/file-requirements',
      '/verification'
    ]
  });
});

const requestType = 'penRequest';

const verifyPenRequest = verifyRequest(requestType);

router.post('/requests', passport.authenticate('jwt', {session: false}), isValidBackendToken, submitRequest(requestType, verifyPenRequestStatus));

router.get('/codes', passport.authenticate('jwt', {session: false}), isValidBackendToken, getCodes(requestType));

router.get('/document-type-codes', passport.authenticate('jwt', {session: false}), isValidBackendToken,
  (req, res) => forwardGetReq(req, res, config.get('penRequest:apiEndpoint') + '/document-types')
);

router.get('/file-requirements', passport.authenticate('jwt', {session: false}), isValidBackendToken,
  (req, res) => forwardGetReq(req, res, config.get('penRequest:apiEndpoint') + '/file-requirements')
);

router.post('/requests/:id/documents', passport.authenticate('jwt', {session: false}), isValidBackendToken, [verifyPenRequest, uploadFile(requestType)]);

router.get('/requests/:id/documents', passport.authenticate('jwt', {session: false}), isValidBackendToken, verifyPenRequest,
  (req, res) => forwardGetReq(req, res, `${config.get('penRequest:apiEndpoint')}/${req.params.id}/documents`)
);

router.get('/requests/:id/documents/:documentId', passport.authenticate('jwt', {session: false}), isValidBackendToken, verifyPenRequest,
  (req, res) => forwardGetReq(req, res, `${config.get('penRequest:apiEndpoint')}/${req.params.id}/documents/${req.params.documentId}`)
);
// special case this does not use frontend axios, so need to refresh here to handle expired jwt.
router.get('/requests/:id/documents/:documentId/download/:fileName', auth.refreshJWT, isValidBackendToken, [verifyPenRequest, downloadFile(requestType)]);

router.delete('/requests/:id/documents/:documentId', passport.authenticate('jwt', {session: false}), isValidBackendToken, [verifyPenRequest, deleteDocument(requestType)]);

router.get('/requests/:id/comments', passport.authenticate('jwt', {session: false}), isValidBackendToken, [verifyPenRequest, getComments(requestType)]);

router.post('/requests/:id/comments', passport.authenticate('jwt', {session: false}), isValidBackendToken, [verifyPostCommentRequest(requestType), postComment(requestType, createPenRequestCommentPayload, createPenRequestCommentEvent)]);

router.post('/requests/:id/verification-email', passport.authenticate('jwt', {session: false}), isValidBackendToken, [verifyPenRequest, resendVerificationEmail(requestType)]);

router.patch('/requests/:id', passport.authenticate('jwt', {session: false}), isValidBackendToken, [verifyPenRequest, setRequestAsSubsrev(requestType)]);

router.get('/verification', verifyEmail(requestType));

module.exports = router;
