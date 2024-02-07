const router = require('express').Router();
const {
  login,
  createUser,
} = require('../controllers/users');
const {
  validationCreateUser,
  validationLogin,
} = require('../middlewares/validation');
const auth = require('../middlewares/auth');
const userRouter = require('./user');
const movieRouter = require('./movie');
const NotFoundError = require('../errors/NotFoundError');

router.post('/signup', validationCreateUser, createUser);
router.post('/signin', validationLogin, login);

router.use(auth);

router.use(userRouter);
router.use(movieRouter);

router.use(() => {
  throw new NotFoundError('Такой страницы нет');
})

module.exports = router;
