const { Router } = require('express');
const router = Router();

const { 
    login, register, editDescription, getFavoriteSeries, getViewedActors,
    getViewedDirectors, getViewedGenres, getFavoritePlatforms, addFavoriteSeries,
    addViewedActor, addViewedDirector, addViewedGenre, addFavoritePlatform,
    getGenresOfSerie, getDirectorsOfSerie, getActorsOfSerie, getPlatformsOfSerie,
    getBestSeriesOfGenre, getGenresOfPlatform, getBestSeriesOfPlatform ,
    getSeriesOfActor, getGenresOfActor, getSeriesOfDirector, getGenresOfDirector,
    getSeries, getActors, getDirectors, getGenres, getPlatform
} = require('../controllers/controllers.js');
// login
router.post('/login', login);
// registro
router.post('/register', register);
// editar descripcion
router.put('/editDescription', editDescription);


// series fav de usuario
router.post('/getFavoriteSeries', getFavoriteSeries);
// actores vistas de usuario
router.post('/getViewedActors', getViewedActors);
// directores vistas de usuario
router.post('/getViewedDirectors', getViewedDirectors);
// generos vistas de usuario
router.post('/getViewedGenres', getViewedGenres);
// plataformas favoritas de usuario
router.post('/getFavoritePlatforms', getFavoritePlatforms);

// Series
// generos de la serie
router.post('/getGenresOfSerie', getGenresOfSerie);
// directores de la serie
router.post('/getDirectorsOfSerie', getDirectorsOfSerie);
// actores de la serie
router.post('/getActorsOfSerie', getActorsOfSerie);
// plataformas de la serie
router.post('/getPlatformsOfSerie', getPlatformsOfSerie);

// añadir serie a favoritos
router.post('/addFavoriteSeries', addFavoriteSeries);
// añadir actor visto
router.post('/addViewedActor', addViewedActor);
// añadir director visto
router.post('/addViewedDirector', addViewedDirector);
// añadir genero visto
router.post('/addViewedGenre', addViewedGenre);
// añadir plataforma favorita
router.post('/addFavoritePlatform', addFavoritePlatform);


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
router.get('/getSeries', getSeries);
router.get('/getActors', getActors);
router.get('/getDirectors', getDirectors);
router.get('/getGenres', getGenres);
router.get('/getPlatform', getPlatform);

// editar cuenta

module.exports = router;