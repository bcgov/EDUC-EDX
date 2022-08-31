const passport = require('passport');
const express = require('express');
const router = express.Router();
const {getDistricts, getDistrictByDistrictId, getSchools} = require('../components/institute');
const auth = require('../components/auth');


router.get('/districts', passport.authenticate('jwt', {session: false}, undefined), auth.isValidBackendToken(), getDistricts);

router.get('/schools', passport.authenticate('jwt', {session: false}, undefined), auth.isValidBackendToken(), getSchools);

router.get('/districts/:districtID', passport.authenticate('jwt', {session: false}, undefined), auth.isValidBackendToken(), getDistrictByDistrictId);
module.exports = router;
