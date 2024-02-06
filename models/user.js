const mongoose = require('mongoose');
const validator = require('validator');

const User = mongoose.Schema({
  email: {
    type: String,
    required: ['Поле email должно быть обязательным', true],
    unique: true,
    validate: {
      validator: (e) => validator.isEmail(e),
      message: 'Email обязателен',
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  name: {
    type: String,
    default: 'Даня Гачист',
    minlength: 2,
    maxlength: 30,
    required: true,
  },
})

module.exports = new mongoose.model('user', User);
