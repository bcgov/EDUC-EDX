const express = require('express');
const router = express.Router();
const { getStudentByPEN, getStudentByPENForGrad, createNewStudent} = require('../components/student');
const auth = require('../components/auth');
const passport = require('passport');
const isValidBackendToken = auth.isValidBackendToken();
const { validateAccessToken, checkEdxUserPermission,
  findSdcSchoolCollectionID_params,
  loadSdcSchoolCollection,
  checkSdcSchoolCollectionAccess
} = require('../components/permissionUtils');
const { PERMISSION } = require('../util/Permission');
const validate = require('../components/validator');
const {newStudentSchema} = require('../validations/student');
/*
 * Get student details based on PEN Number
 */
router.get('/', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.SECURE_EXCHANGE), getStudentByPEN);
router.get('/search-grad-pen', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.SECURE_EXCHANGE), getStudentByPENForGrad);
router.post('/sdcSchoolCollection/:sdcSchoolCollectionID/createStudent', passport.authenticate('jwt', {session: false}, undefined), isValidBackendToken, validateAccessToken, checkEdxUserPermission(PERMISSION.SCHOOL_SDC_EDIT), validate(newStudentSchema), findSdcSchoolCollectionID_params, loadSdcSchoolCollection, checkSdcSchoolCollectionAccess, createNewStudent);
module.exports = router;
