require('dotenv').config();
const { PORT = 3000 } = process.env;
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const userRouter = require('./routes/user');
const movieRouter = require('./routes/movie');
const {
  validationCreateUser,
  validationLogin,
} = require('./middlewares/validation');
const { 
  requestLogger, 
  errorLogger 
} = require('./middlewares/logger');
const auth = require('./middlewares/auth');
const NotFoundError = require('./errors/NotFoundError');

const {
  createUser,
  login,
} = require('./controllers/users');

const app = express();

const corsOption = {
  origin: ['http://localhost:3000', 'http://localhost:3001', 
  'http://vantwo.nomoredomainswork.ru', 'https://vantwo.nomoredomainswork.ru',
  'http://api.vantwo.nomoredomainswork.ru', 'https://api.vantwo.nomoredomainswork.ru'],
  credentials: true,
}

app.use(cors(corsOption));

app.use(express.json());

mongoose.connect('mongodb://localhost:27017/moviedb');

app.use(requestLogger);

app.post('/signup', validationCreateUser, createUser);
app.post('/signin', validationLogin, login);

app.use(auth);

app.use(userRouter);
app.use(movieRouter);

app.use(() => {
  throw new NotFoundError('Такой страницы нет');
})

app.use(errorLogger);
app.use(errors());

app.use((err, req, res, next) => {
  const { status = 500, message } = err;
  res.status(status).json({
    message: status === 500 ? 'Ошибка сервера' : message,
  });
  next();
})

app.listen(PORT, () => {
  console.log(`app listen on port ${PORT}`);
})
