const passport = require('passport');
const express = require('express');
const router = express.Router();
const { getSchoolBySchoolID } = require('../components/school');
const auth = require('../components/auth');
const isValidBackendToken = auth.isValidBackendToken();

/*
 * Get a school entity by schoolID
 */
router.get('/', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getSchoolBySchoolID);

module.exports = router;

