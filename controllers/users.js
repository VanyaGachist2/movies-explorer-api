const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const NotFoundError = require('../errors/NotFoundError'); // 404
const BadRequestError = require('../errors/BadRequestError'); // 400
const ConflictError = require('../errors/ConflictError'); // 409
const AuthError = require('../errors/AuthError');
const {
  NODE_ENV,
  JWT_SECRET,
} = require('../utils/config');

module.exports.getOneUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      throw new NotFoundError('такого пользователя нет');
    }
    const {
      email,
      name,
    } = user;
    return res.status(200).json({
      email,
      name,
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return next(new BadRequestError('неккоректный id'));
    }
    return next(err);
  }
}

module.exports.updateUserInfo = async (req, res, next) => {
  const {
    email,
    name,
  } = req.body;
  try {
    const userId = req.user._id;
    const user = await User.findByIdAndUpdate(
      userId,
      {
        email,
        name,
      },
      { new: true, runValidators: true },
      );
      if (!user) {
        throw new NotFoundError('пользователя нет');
      }
      return res.status(200).json(user);
  } catch (err) {
    if (err.code === 11000) {
      return next(new ConflictError('Изменения отменены'));
    }
    if (err.name === 'ValidationError') {
      return next(new BadRequestError('неправильные данные'));
    }
    return next(err);
  }
}

module.exports.createUser = async (req, res, next) => { // +
  const {
    email,
    password,
    name,
  } = req.body;
  console.log(req.body)
  bcrypt.hash(password, 10)
    .then((hash) => {
      User.create({
        email,
        name,
        password: hash,
      })
      .then(() => {
        return res.status(201).json({
          email,
          name,
        });
      })
      .catch((err) => {
        if (err.code === 11000) {
          return next(new ConflictError('Такой email уже существует')); // 409
        }
        if (err.name === 'ValidationError') {
          return next(new BadRequestError('Ошибка валидации'));
        }
        return next(err);
      })
  })
  .catch(next);
}

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new AuthError('Неправильные почта или пароль'));
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new AuthError('Неправильные почта или пароль'));
          }
          return res.status(200).send({
            message: 'Успешно авторизован',
            token: jwt.sign(
              { _id: user._id },
              NODE_ENV === 'production' ? JWT_SECRET : 'super-strong-secret',
              { expiresIn: '7d' },
            ),
          });
        })
    })
    .catch(next);
}
