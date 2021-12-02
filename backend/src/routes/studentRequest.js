'use strict';

const passport = require('passport');
const express = require('express');
const { getCodes, postComment, submitRequest, getComments, verifyEmail, setRequestAsSubsrev, resendVerificationEmail, verifyRequest, verifyPostCommentRequest, deleteDocument, downloadFile, uploadFile } = require('../components/request');
const { forwardGetReq } = require('../components/utils');
const config = require('../config/index');
const { verifyStudentRequestStatus, createStudentRequestCommentPayload, createStudentRequestCommentEvent } = require('../components/studentRequest');
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

const requestType = 'studentRequest';

const verifyStudentRequest = verifyRequest(requestType);

router.post('/requests', passport.authenticate('jwt', {session: false}), isValidBackendToken, submitRequest(requestType, verifyStudentRequestStatus));

router.get('/codes', passport.authenticate('jwt', {session: false}), isValidBackendToken, getCodes(requestType));

router.get('/document-type-codes', passport.authenticate('jwt', {session: false}), isValidBackendToken,
  (req, res) => forwardGetReq(req, res, config.get('studentRequest:apiEndpoint') + '/document-types')
);

router.get('/file-requirements', passport.authenticate('jwt', {session: false}), isValidBackendToken,
  (req, res) => forwardGetReq(req, res, config.get('studentRequest:apiEndpoint') + '/file-requirements')
);

router.post('/requests/:id/documents', passport.authenticate('jwt', {session: false}), isValidBackendToken, [verifyStudentRequest, uploadFile(requestType)]);

router.get('/requests/:id/documents', passport.authenticate('jwt', {session: false}), isValidBackendToken, verifyStudentRequest,
  (req, res) => forwardGetReq(req, res, `${config.get('studentRequest:apiEndpoint')}/${req.params.id}/documents`)
);

router.get('/requests/:id/documents/:documentId', passport.authenticate('jwt', {session: false}), isValidBackendToken, verifyStudentRequest,
  (req, res) => forwardGetReq(req, res, `${config.get('studentRequest:apiEndpoint')}/${req.params.id}/documents/${req.params.documentId}`)
);
// special case this does not use frontend axios, so need to refresh here to handle expired jwt.
router.get('/requests/:id/documents/:documentId/download/:fileName',auth.refreshJWT, isValidBackendToken, [verifyStudentRequest, downloadFile(requestType)]);

router.delete('/requests/:id/documents/:documentId', passport.authenticate('jwt', {session: false}), isValidBackendToken, [verifyStudentRequest, deleteDocument(requestType)]);

router.get('/requests/:id/comments', passport.authenticate('jwt', {session: false}), isValidBackendToken, [verifyStudentRequest, getComments(requestType)]);

router.post('/requests/:id/comments', passport.authenticate('jwt', {session: false}), isValidBackendToken, [verifyPostCommentRequest(requestType), postComment(requestType, createStudentRequestCommentPayload, createStudentRequestCommentEvent)]);

router.post('/requests/:id/verification-email', passport.authenticate('jwt', {session: false}), isValidBackendToken, [verifyStudentRequest, resendVerificationEmail(requestType)]);

router.patch('/requests/:id', passport.authenticate('jwt', {session: false}), isValidBackendToken, [verifyStudentRequest, setRequestAsSubsrev(requestType)]);

router.get('/verification', verifyEmail(requestType));

module.exports = router;
