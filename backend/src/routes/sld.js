const passport = require('passport');
const express = require('express');
const router = express.Router();
const { getCollectionBySchoolId, uploadFile, getSdcFileProgress} = require('../components/sld');
const auth = require('../components/auth');
const isValidBackendToken = auth.isValidBackendToken();

router.get('/getCollectionBySchoolId/:schoolID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getCollectionBySchoolId);
router.post('/:sdcSchoolCollectionID/file', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, uploadFile);
router.get('/:sdcSchoolCollectionID/file', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getSdcFileProgress);
module.exports = router;

