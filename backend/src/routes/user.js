'use strict';

const passport = require('passport');
const express = require('express');
const { getUserInfo } = require('../components/request');

const router = express.Router();
const auth = require('../components/auth');
const isValidBackendToken = auth.isValidBackendToken();
router.get('/', passport.authenticate('jwt', {session: false}), isValidBackendToken, getUserInfo);

module.exports = router;
