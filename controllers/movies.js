const Movie = require('../models/movie');
const NotFoundError = require('../errors/NotFoundError'); // 404
const BadRequestError = require('../errors/BadRequestError'); // 400
const UserError = require('../errors/UserError'); // 403

module.exports.getMovies = async (req, res, next) => {
  const userId = req.user._id;
  try {
    const movie = await Movie.find({ userId });
    return res.status(200).json(movie);
  } catch (err) {
    return next(err);
  }
};

module.exports.createMovie = async (req, res, next) => { // +
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;
  try {
    const movie = new Movie({
      country,
      director,
      duration,
      year,
      description,
      image,
      trailer,
      nameRU,
      nameEN,
      thumbnail,
      movieId,
      owner: req.user._id,
    });
    const savedMovie = await movie.save();
    return res.status(201).json(savedMovie);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return next(new BadRequestError('Некоррентные данные'));
    }
    return next(err);
  }
};

module.exports.deleteMovie = async (req, res, next) => { // +
  try {
    const movie = await Movie.findById(req.params.movieId);
    if (!movie) {
      throw new NotFoundError('Карточки нет');
    }
    if (movie.owner.toString() !== req.user._id) {
       throw new UserError('это не ваша карточка, удаление невозможно');
    }
    await Movie.findByIdAndDelete(req.params.movieId);
    return res.status(200).json({ message: 'Карточка удалена' });
  } catch (err) {
    if (err.name === 'CastError') {
      return next(new BadRequestError('проблемма с _id'));
    }
    return next(err);
  }
};
