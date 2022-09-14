const passport = require('passport');
const express = require('express');
const router = express.Router();
const { getDistrictByDistrictID } = require('../components/district');
const auth = require('../components/auth');
const isValidBackendToken = auth.isValidBackendToken();

/*
 * Get a District entity by districtID
 */
router.get('/:districtID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getDistrictByDistrictID);

module.exports = router;

