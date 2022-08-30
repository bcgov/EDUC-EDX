const passport = require('passport');
const express = require('express');
const router = express.Router();
const { getSchoolBySchoolId } = require('../components/school');
const auth = require('../components/auth');
const isValidBackendToken = auth.isValidBackendToken();

/*
 * Get a school entity by schoolId
 */
router.get('/', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getSchoolBySchoolId);

module.exports = router;

