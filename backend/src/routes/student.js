const express = require('express');
const router = express.Router();
const { getStudentByPEN } = require('../components/student');
const auth = require('../components/auth');
const passport = require('passport');
const isValidBackendToken = auth.isValidBackendToken();

/*
 * Get student details based on PEN Number
 */
router.get('/', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getStudentByPEN);

module.exports = router;
