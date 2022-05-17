const passport = require('passport');
const express = require('express');
const router = express.Router();
const { getSchoolByMincode } = require('../components/school');
const auth = require('../components/auth');
const isValidBackendToken = auth.isValidBackendToken();

/*
 * Get a school entity by mincode
 */
router.get('/', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getSchoolByMincode);

module.exports = router;

