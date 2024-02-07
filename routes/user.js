const router = require('express').Router();
const {
  getOneUser,
  updateUserInfo,
} = require('../controllers/users');
const {
  validationUserInfo,
} = require('../middlewares/validation');

router.get('/users/me', getOneUser);

router.patch('/users/me', validationUserInfo, updateUserInfo);

module.exports = router;
