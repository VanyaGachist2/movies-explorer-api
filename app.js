require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const { errors } = require('celebrate');
const { dataMovies, PORT } = require('./utils/config');
const router = require('./routes/index');
const errorHandler = require('./middlewares/errorHandler');
const { 
  requestLogger,
  errorLogger,
} = require('./middlewares/logger');
const rateLimiter = require('./middlewares/rateLimiter');

const app = express();

const corsOption = {
  origin: ['http://localhost:3000', 'http://localhost:3001', 
  'http://vanyafront.nomoredomainswork.ru', 'https://vanyafront.nomoredomainswork.ru',
  'http://api.vanyafront.nomoredomainswork.ru', 'https://api.vanyafront.nomoredomainswork.ru'],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],  
  preflightContinue: false,  
  optionsSuccessStatus: 204,  
  allowedHeaders: ['Content-Type', 'origin', 'Authorization'], 
  credentials: true,
}

app.use(cors(corsOption));

app.use(express.json());
app.use(helmet());
app.use(rateLimiter);

mongoose.connect(dataMovies);

app.use(requestLogger);

app.use(router);

app.use(errorLogger);
app.use(errors());

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`app listen on port ${PORT}`);
})
