const passport = require('passport');
const express = require('express');
const router = express.Router();
const { getDistrictByDistrictID, updateDistrict, createDistrictContact,updateDistrictContact} = require('../components/district');
const auth = require('../components/auth');
const isValidBackendToken = auth.isValidBackendToken();

/*
 * Get a District entity by districtID
 */

router.post('/:districtID/contact', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, createDistrictContact);
router.get('/:districtID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, getDistrictByDistrictID);
router.post('/:districtID', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, updateDistrict);
router.put('/update-contact', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, updateDistrictContact);
module.exports = router;
