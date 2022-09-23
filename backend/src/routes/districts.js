const passport = require('passport');
const express = require('express');
const router = express.Router();
const { getDistrictByDistrictID } = require('../components/district');
const auth = require('../components/auth');
const {getCodes} = require('../components/utils');
const {CACHE_KEYS} = require('../components/constants');
const isValidBackendToken = auth.isValidBackendToken();

/*
 * Get a District entity by districtID
 */
router.get('/districtContactTypeCodes', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getCodes('institute:rootURL', CACHE_KEYS.DISTRICT_CONTACT_TYPE_CODES, '/district-contact-type-codes'));
router.get('/:districtID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getDistrictByDistrictID);

module.exports = router;

