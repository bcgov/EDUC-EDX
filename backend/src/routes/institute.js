const passport = require('passport');
const express = require('express');
const router = express.Router();
const {getDistricts, getDistrictByDistrictId, getSchools} = require('../components/institute');
const auth = require('../components/auth');
const {getCodes} = require('../components/utils');
const {CACHE_KEYS} = require('../components/constants');


router.get('/districts', passport.authenticate('jwt', {session: false}, undefined), auth.isValidBackendToken(), getDistricts);

router.get('/schools', passport.authenticate('jwt', {session: false}, undefined), auth.isValidBackendToken(), getSchools);

router.get('/districts/:districtID', passport.authenticate('jwt', {session: false}, undefined), auth.isValidBackendToken(), getDistrictByDistrictId);

router.get('/province-codes', passport.authenticate('jwt', {session: false}, undefined), auth.isValidBackendToken(), getCodes('institute:rootURL', CACHE_KEYS.PROVINCE_CODES, '/province-codes'));
router.get('/country-codes', passport.authenticate('jwt', {session: false}, undefined), auth.isValidBackendToken(), getCodes('institute:rootURL', CACHE_KEYS.COUNTRY_CODES, '/country-codes'));
module.exports = router;
