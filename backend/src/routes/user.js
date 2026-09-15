'use strict';

const passport = require('passport');
const express = require('express');
const {getUserInfo, updateUserName} = require('../components/user');
const {validateAccessToken} = require('../components/permissionUtils');
const {putUserNameSchema} = require('../validations/user');
const validate = require('../components/validator');

const router = express.Router();
const auth = require('../components/auth');
const isValidBackendToken = auth.isValidBackendToken();
router.get('/', passport.authenticate('jwt', {session: false}), isValidBackendToken, getUserInfo);
router.put('/', passport.authenticate('jwt', {session: false}), isValidBackendToken, validateAccessToken, validate(putUserNameSchema), updateUserName);

module.exports = router;
