const passport = require('passport');
const express = require('express');
const router = express.Router();
const { getCollectionBySchoolId, uploadFile, getSdcFileProgress, updateSchoolCollection, getSchoolCollectionById} = require('../components/sld');
const auth = require('../components/auth');
const isValidBackendToken = auth.isValidBackendToken();

router.get('/getCollectionBySchoolId/:schoolID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getCollectionBySchoolId);
router.get('/:sdcSchoolCollectionID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getSchoolCollectionById);
router.post('/:sdcSchoolCollectionID/file', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, uploadFile);
router.get('/:sdcSchoolCollectionID/file', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getSdcFileProgress);
router.put('/:sdcSchoolCollectionID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, updateSchoolCollection)
module.exports = router;

