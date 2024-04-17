const { Router } = require('express');
const router = Router();

const { 
    login, register, editDescription, getFavoriteSeries, getViewedActors,
    getViewedDirectors, getViewedGenres, getFavoritePlatforms, addFavoriteSeries,
    addViewedActor, addViewedDirector, addViewedGenre, addFavoritePlatform,
    getGenresOfSerie, getDirectorsOfSerie, getActorsOfSerie, getPlatformsOfSerie,
    getBestSeriesOfGenre, getGenresOfPlatform, getBestSeriesOfPlatform ,
    getSeriesOfActor, getGenresOfActor, getSeriesOfDirector, getGenresOfDirector
} = require('../controllers/controllers.js');
// login
router.post('/login', login);
// registro
router.post('/register', register);
// editar descripcion
router.put('/editDescription', editDescription);


// series fav de usuario
router.get('/getFavoriteSeries', getFavoriteSeries);
// actores vistas de usuario
router.get('/getViewedActors', getViewedActors);
// directores vistas de usuario
router.get('/getViewedDirectors', getViewedDirectors);
// generos vistas de usuario
router.get('/getViewedGenres', getViewedGenres);
// plataformas favoritas de usuario
router.get('/getFavoritePlatforms', getFavoritePlatforms);

// Series
// generos de la serie
router.get('/getGenresOfSerie', getGenresOfSerie);
// directores de la serie
router.get('/getDirectorsOfSerie', getDirectorsOfSerie);
// actores de la serie
router.get('/getActorsOfSerie', getActorsOfSerie);
// plataformas de la serie
router.get('/getPlatformsOfSerie', getPlatformsOfSerie);


// listado de series recomendadas
router.get('/getBestSeriesOfGenre', getBestSeriesOfGenre);
// listado de actores recomendados
router.get('/getGenresOfPlatform', getGenresOfPlatform);
// listado de directores recomendados
router.get('/getBestSeriesOfPlatform', getBestSeriesOfPlatform);
// listado de generos recomendados
router.get('/getBestSeriesOfGenre', getBestSeriesOfGenre);
// listado de plataformas recomendadas
router.get('/getGenresOfPlatform', getGenresOfPlatform);

// listado de series en las que aparece un actor
router.get('/getSeriesOfActor', getSeriesOfActor);
// listado de generos en los que ha participado un actor
router.get('/getGenresOfActor', getGenresOfActor);

// listado de series en las que ha participado un director
router.get('/getSeriesOfDirector', getSeriesOfDirector);
// listado de generos en los que ha participado un director
router.get('/getGenresOfDirector', getGenresOfDirector);

// generos de una plataforma
router.get('/getGenresOfPlatform', getGenresOfPlatform);
// mejores series del genero
router.get('/getBestSeriesOfGenre', getBestSeriesOfGenre);

// generos de la plataforma
router.get('/getGenresOfPlatform', getGenresOfPlatform);
// mejores series de la plataforma
router.get('/getBestSeriesOfPlatform', getBestSeriesOfPlatform);

// match n de todo

// editar cuenta

module.exports = router;