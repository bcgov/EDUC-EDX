const express = require('express');
const router = express.Router();
const { getStudentByPEN } = require('../components/student');
const auth = require('../components/auth');
const passport = require('passport');
const isValidBackendToken = auth.isValidBackendToken();
const { validateAccessToken, checkEdxUserPermission } = require('../components/permissionUtils');
const { PERMISSION } = require('../util/Permission');

/*
 * Get student details based on PEN Number
 */
router.get('/', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.SECURE_EXCHANGE), getStudentByPEN);

module.exports = router;
