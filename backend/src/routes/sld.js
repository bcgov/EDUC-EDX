const passport = require('passport');
const express = require('express');
const router = express.Router();
const { getCollectionBySchoolId } = require('../components/sld');
const auth = require('../components/auth');
const isValidBackendToken = auth.isValidBackendToken();


router.get('/getCollectionBySchoolId/:schoolID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getCollectionBySchoolId);
module.exports = router;

