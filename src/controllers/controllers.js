const neo4j = require('neo4j-driver');
const config = require('../config.js');

const driver = neo4j.driver(config.URL, neo4j.auth.basic(config.user.toString(), config.password.toString()));
const session = driver.session();
const { json } = require('express');

// Login
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await session.run(
            'MATCH (u:Usuarios) WHERE u.email = $email AND u.contraseña = $password RETURN u',
            { email, password }
        );

        if (result.records.length === 0) {
            res.status(400).send('Invalid email or password');
            return;
        }

        const user = result.records[0].get('u');
        const userData = {
            message: 200,
            nombre: user.properties.name,
            apellido: user.properties.apellido,
            correo: user.properties.email,
            contraseña: user.properties.contraseña,
            edad: user.properties.edad.low, 
            descripcion: user.properties.descripcion
        };

        console.log(userData);
        res.status(200).send(userData);
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Internal server error' });
    }
};

// Register
const  register = async (req, res) => {
    const { nombre, apellido, correo, contraseña, edad, descripcion } = req.body;
    try {
    
        await session.run(
            'CREATE (u:Usuarios {name: $nombre, apellido: $apellido, email: $correo, contraseña: $contraseña, edad: $edad, descripcion: $descripcion})',
            { nombre, apellido, correo, contraseña, edad, descripcion }
        );
        res.status(200).send({message: 200});
    } catch (error) {
        res.status(500).send({message: 200});
    }
};

// Edit description
const editDescription = async (req, res) => {
    const { email, descripcion } = req.body;
    try {
        await session.run(
            'MATCH (u:User) WHERE u.email = $email SET u.descripcion = $descripcion',
            { email, descripcion }
        );
        res.status(200).send('Description updated');
    } catch (error) {
        res.status(500).send('Internal server error');
    }
};

// Get favorite series of a user
const getFavoriteSeries = async (req, res) => {
    const { email } = req.body;
    try {
        const result = await session.run(
            'MATCH (s:Series)-[r:fav_de]->(u:Usuarios) WHERE u.email = $email RETURN s;',
            { email }
        );

        const response = result.records.map(record => {
            const serie = record.get('s');
            return {
                message: 200,
                descripcion: serie.properties.descripcion,
                Total_caps: serie.properties.Total_caps.low, 
                Duracion: serie.properties.Duracion, 
                year: serie.properties.year.low, 
                rating: serie.properties.rating, 
                title: serie.properties.title, 
                ratingCount: serie.properties.ratingCount.low
            };
        });
        res.status(200).send(response);
    } catch (error) {
        res.status(500).send({message: 500});
    }
};

// Get viewed actors of a user
const getViewedActors = async (req, res) => {
    const { email } = req.query;
    try {
        const result = await session.run(
            'MATCH (a:Actor)-[:fav_de]->(u:Usuarios) WHERE u.email = $email RETURN a',
            { email }
        );
        const response = result.records.map(record => {
            const actor = record.get('a');
            return {
                message: 200,
                name: actor.properties.name,
                nacionalidad: actor.properties.Nacionalidad,
                edad: actor.properties.edad.low,
                premiado: actor.properties.premiado,
            };
        });
        res.status(200).send(response);
    } catch (error) {
        res.status(500).send('Internal server error');
    }
};

// Get viewed directors of a user
const getViewedDirectors = async (req, res) => {
    const { email } = req.body;
    try {
        const result = await session.run(
            'MATCH (d:Director)-[:fav_de]->(u:Usuarios) WHERE u.email = $email RETURN d',
            { email }
        );

        const response = result.records.map(record => {
            const director = record.get('d');
            return {
                message: 200,
                name: director.properties.name,
                nacionalidad: director.properties.Nacionalidad,
                edad: director.properties.edad.low,
                premiado: director.properties.premiado,
            };
        });
        res.status(200).send(response);
    } catch (error) {
        res.status(500).send('Internal server error');
    }
};

// Get viewed genres of a user
const getViewedGenres = async (req, res) => {
    const { email } = req.body;
    try {
        const result = await session.run(
            'MATCH (g:Genre)-[r:fav_de]->(u:Usuarios) WHERE u.email = $email RETURN g',
            { email }
        );
        const response = result.records.map(record => {
            const genre = record.get('g');
            return {
                message: 200,
                name: genre.properties.name,
                numSeries: genre.properties.numSeries.low,
                descripcion: genre.properties.description,
            };
        });
        res.status(200).send(response);
    } catch (error) {
        res.status(500).send('Internal server error');
    }
};

// Get favorite platforms of a user
const getFavoritePlatforms = async (req, res) => {
    const { email } = req.body;
    try {
        const result = await session.run(
            'MATCH (u:Usuarios)-[:Suscrito_a]->(p:Platform) WHERE u.email = $email RETURN p',
            { email }
        );
        const response = result.records.map(record => {
            const platform = record.get('p');
            return {
                message: 200,
                name: platform.properties.name,
                precio: platform.properties.precio.low,
                lanzamiento: platform.properties.lanzamiento,
                tipo: platform.properties.tipo
            };
        });
        res.status(200).send(response);
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal server error');
    }
};

// Add favorite series
const addFavoriteSeries = async (req, res) => {
    const { email, serie, estado, rating, repeticiones } = req.body;
    try {
        await session.run(
            'MATCH (u:Usuarios), (s:Series) WHERE u.email = $email AND s.title = $serie CREATE (s)-[:fav_de {estado: $estado, rating: $rating, repeticiones: $repeticiones}]->(u)',
            { email, serie, estado, rating, repeticiones }
        );
        res.status(200).send({message: 200});
    } catch (error) {
        res.status(500).send({message: 500});
    }
};

// Add viewed actor
const addViewedActor = async (req, res) => {
    const { email, actor } = req.body;
    try {
        await session.run(
            'MATCH (u:Usuarios), (a:Actor) WHERE u.email = $email AND a.name = $actor CREATE (a)-[:fav_de]->(u)',
            { email, actor }
        );
        res.status(200).send({message: 200});
    } catch (error) {
        res.status(500).send({message: 500});
    }
};

// Add viewed director
const addViewedDirector = async (req, res) => {
    const { email, director } = req.body;
    try {
        await session.run(
            'MATCH (u:Usuarios), (d:Director) WHERE u.email = $email AND d.name = $director CREATE (d)-[:fav_de]->(u)',
            { email, director }
        );
        res.status(200).send({message: 200});
    } catch (error) {
        res.status(500).send({message: 500});
    }
};

// Add viewed genre
const addViewedGenre = async (req, res) => {
    const { email, genre } = req.body;
    try {
        await session.run(
            'MATCH (u:Usuarios), (g:Genre) WHERE u.email = $email AND g.name = $genre CREATE (g)-[:fav_de]->(u)',
            { email, genre }
        );
        res.status(200).send({message: 200});
    } catch (error) {
        res.status(200).send({message: 500});
    }
};

// Add favorite platform
const addFavoritePlatform = async (req, res) => {
    const { email, platform } = req.body;
    try {
        await session.run(
            'MATCH (u:Usuarios), (p:Platform) WHERE u.email = $email AND p.name = $platform CREATE (p)-[:fav_de]->(u)',
            { email, platform }
        );
        res.status(200).send({message: 200});
    } catch (error) {
        res.status(200).send({message: 500});
    }
};

const getSeries = async (req, res) => {
    try {
        const result = await session.run(
            'MATCH (s:Series) RETURN s'
        );
        const response = result.records.map(record => {
            const serie = record.get('s');
            return {
                message: 200,
                descripcion: serie.properties.descripcion,
                Total_caps: serie.properties.Total_caps.low, 
                Duracion: serie.properties.Duracion, 
                year: serie.properties.year.low, 
                rating: serie.properties.rating, 
                title: serie.properties.title, 
                ratingCount: serie.properties.ratingCount.low
            };
        });
        res.status(200).send(response);
    } catch (error) {
        res.status(500).send({message: 500});
    }
};

const getActors = async (req, res) => {
    try {
        const result = await session.run(
            'MATCH (a:Actor) RETURN a'
        );
        const response = result.records.map(record => {
            const actor = record.get('a');
            return {
                message: 200,
                name: actor.properties.name,
                nacionalidad: actor.properties.Nacionalidad,
                edad: actor.properties.edad.low,
                premiado: actor.properties.premiado,
            };
        });
        res.status(200).send(response);
    } catch (error) {
        res.status(500).send({message: 500});
    }
};

const getDirectors = async (req, res) => {
    try {
        const result = await session.run(
            'MATCH (d:Director) RETURN d'
        );
        const response = result.records.map(record => {
            const director = record.get('d');
            return {
                message: 200,
                name: director.properties.name,
                nacionalidad: director.properties.Nacionalidad,
                edad: director.properties.edad.low,
                premiado: director.properties.premiado,
            };
        });
        res.status(200).send(response);
    } catch (error) {
        res.status(500).send({message: 500});
    }
};

const getGenres = async (req, res) => {
    try {
        const result = await session.run(
            'MATCH (g:Genre) RETURN g'
        );
        const response = result.records.map(record => {
            const genre = record.get('g');
            return {
                message: 200,
                name: genre.properties.name,
                numSeries: genre.properties.numSeries.low,
                descripcion: genre.properties.description,
            };
        });
        res.status(200).send(response);
    } catch (error) {
        res.status(500).send({message: 500});
    }
};

const getPlatform = async (req, res) => {
    try {
        const result = await session.run(
            'MATCH (p:Platform) RETURN p'
        );
        const response = result.records.map(record => {
            const platform = record.get('p');
            return {
                message: 200,
                name: platform.properties.name,
                precio: platform.properties.precio.low,
                lanzamiento: platform.properties.lanzamiento,
                tipo: platform.properties.tipo
            };
        });
        res.status(200).send(response);
    } catch (error) {
        res.status(500).send({message: 500});
    }
};

// Get genres of a serie
const getGenresOfSerie = async (req, res) => {
    const { serie } =  req.query;
    try {
        const result = await session.run(
            'MATCH (s:Series)-[:Pertenece]->(g:Genre) WHERE s.title = $serie RETURN g',
            { serie }
        );
        const response = result.records.map(record => {
            const platform = record.get('g');
            return {
                message: 200,
                name: platform.properties.name,
                numSeries: platform.properties.numSeries.low,
                descripcion: platform.properties.description
            };
        });
        res.status(200).send(response);
    } catch (error) {
        res.status(500).send({message: 500});
    }
};

const getSeriesOfActor = async (req, res) => {
    const { actor } = req.body;
    try {
        const result = await session.run(
            'MATCH (a:Actor)-[:Participa_en]->(s:Series) WHERE a.name = $actor RETURN s',
            { actor }
        );
        const response = result.records.map(record => {
            const serie = record.get('s');
            return {
                message: 200,
                descripcion: serie.properties.descripcion,
                Total_caps: serie.properties.Total_caps.low,
                Duracion: serie.properties.Duracion,
                year: serie.properties.year.low,
                rating: serie.properties.rating,
                title: serie.properties.title,
                ratingCount: serie.properties.ratingCount.low
            };
        });
        res.status(200).send(response);
    } catch (error) {
        res.status(500).send({message: 500});
    }
};

// Get genres of an actor
const getGenresOfActor = async (req, res) => {
    const { actor } = req.body;
    try {
        const result = await session.run(
            'MATCH (a:Actor)-[:Participa_en]->(s:Series)-[:Pertenece]->(g:Genre) WHERE a.name = $actor RETURN g',
            { actor }
        );
        const response = result.records.map(record => {
            const genre = record.get('g');
            return {
                message: 200,
                name: genre.properties.name,
                numSeries: genre.properties.numSeries.low,
                descripcion: genre.properties.description
            };
        });
        res.status(200).send(response);
    } catch (error) {
        res.status(500).send({message: 500});
    }
};



// Get directors of a serie
const getDirectorsOfSerie = async (req, res) => {
    const { serie } = req.query;
    try {
        const result = await session.run(
            'MATCH (d:Director)-[:Dirige]->(s:Series) WHERE s.title = $serie RETURN d',
            { serie }
        );
        const response = result.records.map(record => {
            const director = record.get('d');
            return {
                message: 200,
                name: director.properties.name,
                nacionalidad: director.properties.Nacionalidad,
                edad: director.properties.edad.low,
                premiado: director.properties.premiado,
            };
        });
        res.status(200).send(response);
    } catch (error) {
        res.status(500).send('Internal server error');
    }
};

// Get actors of a serie
const getActorsOfSerie = async (req, res) => {
    const { serie } = req.query;
    try {
        const result = await session.run(
            'MATCH (a:Actor)-[:Participa_en]->(s:Series) WHERE s.title = $serie RETURN a',
            { serie }
        );
        const response = result.records.map(record => {
            const actor = record.get('a');
            return {
                message: 200,
                name: actor.properties.name,
                nacionalidad: actor.properties.Nacionalidad,
                edad: actor.properties.edad.low,
                premiado: actor.properties.premiado,
            };
        });
        res.status(200).send(response);
    } catch (error) {
        res.status(500).send({message: 500});
    }
};

// Get platforms of a serie
const getPlatformsOfSerie = async (req, res) => {
    const { serie } = req.query;
    try {
        const result = await session.run(
            'MATCH (s:Series)-[:Transmite_en]->(p:Platform) WHERE s.title = $serie RETURN p',
            { serie }
        );
        const response = result.records.map(record => {
            const platform = record.get('p');
            return {
                message: 200,
                name: platform.properties.name,
                precio: platform.properties.precio.low,
                lanzamiento: platform.properties.lanzamiento,
                tipo: platform.properties.tipo
            };
        });
        res.status(200).send(response);
    } catch (error) {
        res.status(500).send({message: 500});
    }
};

// get series of Platform
const getSeriesOfPlatform = async (req, res) => {
    const { platform } = req.body;
    try {
        const result = await session.run(
            'MATCH (p:Platform)-[:Transmite]->(s:Series) WHERE p.name = $platform RETURN s',
            { platform }
        );
        const response = result.records.map(record => {
            const serie = record.get('s');
            return {
                message: 200,
                descripcion: serie.properties.descripcion,
                Total_caps: serie.properties.Total_caps.low,
                Duracion: serie.properties.Duracion,
                year: serie.properties.year.low,
                rating: serie.properties.rating,
                title: serie.properties.title,
                ratingCount: serie.properties.ratingCount.low
            };
        }
        );
        res.status(200).send(response);
    } catch (error) {
        res.status(500).send({message: 500});
    }
};

const getGenderOfPlatform = async (req, res) => {

    const { platform } = req.body;
    try {
        const result = await session.run(
            'MATCH (p:Platform)-[:OFFERS]->(g:Genre) WHERE p.name = $platform RETURN g',
            { platform }
        );
        const response = result.records.map(record => {
            const genre = record.get('g');
            return {
                message: 200,
                name: genre.properties.name,
                numSeries: genre.properties.numSeries.low,
                descripcion: genre.properties.description
            };
        }
        );
        res.status(200).send(response);
    } catch (error) {
        res.status(500).send({message: 500});
    }
};

// Get best series of a genre
const getBestSeriesOfGenre = async (req, res) => {
    const { genre } = req.body;
    try {
        const result = await session.run(
            'MATCH (g:Genre)-[:Cuenta_con]->(s:Series) WHERE g.name = $genre RETURN s ORDER BY s.rating DESC LIMIT 10',
            { genre }
        );
        res.status(200).send(result.records.map(record => record.get(0).properties));
    } catch (error) {
        res.status(500).send('Internal server error');
    }
};

// Get genres of a platform
const getGenresOfPlatform = async (req, res) => {
    const { platform } = req.body;
    try {
        const result = await session.run(
            'MATCH (p:Platform)-[:OFFERS]->(g:Genre) WHERE p.name = $platform RETURN g',
            { platform }
        );
        res.status(200).send(result.records.map(record => record.get(0).properties));
    } catch (error) {
        res.status(500).send('Internal server error');
    }
};

const deleteFavoriteSeries = async (req, res) => {
    const { email, serie } = req.body;
    try {
        await session.run(
            'MATCH (s:Series)-[r:fav_de]->(u:Usuarios) WHERE u.email = $email AND s.title = $serie DELETE r',
            { email, serie }
        );
        res.status(200).send({message: 200});
    } catch (error) {
        res.status(500).send({message: 500});
    }
};

const deleteFavoriteActor = async (req, res) => {
    const { email, actor } = req.body;
    try {
        await session.run(
            'MATCH (a:Actor)-[r:fav_de]->(u:Usuarios) WHERE u.email = $email AND a.name = $actor DELETE r',
            { email, actor }
        );
        res.status(200).send({message: 200});
    } catch (error) {
        console.log(error);
        res.status(500).send({message: 500});
    }
};

const deleteFavoriteDirector = async (req, res) => {
    const { email, director } = req.body;
    try {
        await session.run(
            'MATCH (d:Director)-[r:fav_de]->(u:Usuarios) WHERE u.email = $email AND d.name = $director DELETE r',
            { email, director }
        );
        res.status(200).send({message: 200});
    } catch (error) {
        res.status(500).send({message: 500});
    }
};

const deleteFavoriteGenre = async (req, res) => {
    const { email, genre } = req.body;
    try {
        await session.run(
            'MATCH (g:Genre)-[r:fav_de]->(u:Usuarios) WHERE u.email = $email AND g.name = $genre DELETE r',
            { email, genre }
        );
        res.status(200).send({message: 200});
    } catch (error) {
        res.status(500).send({message: 500});
    }
};

const deleteFavoritePlatform = async (req, res) => {
    const { email, platform } = req.body;
    try {
        await session.run(
            'MATCH (u:Usuarios)-[r:Suscrito_a]->(p:Platform) WHERE u.email = $email AND p.name = $platform DELETE r',
            { email, platform }
        );
        res.status(200).send({message: 200});
    } catch (error) {
        res.status(500).send({message: 500});
    }
}

// Get best series of a platform
const getBestSeriesOfPlatform = async (req, res) => {
    const { platform } = req.body;
    try {
        const result = await session.run(
            'MATCH (p:Platform)-[:OFFERS]->(s:Serie) WHERE p.name = $platform RETURN s ORDER BY s.rating DESC LIMIT 10',
            { platform }
        );
        res.status(200).send(result.records.map(record => record.get(0).properties));
    } catch (error) {
        res.status(500).send('Internal server error');
    }
};

// series de un director
const getSeriesOfDirector = async (req, res) => {
    const { director } = req.body;
    try {
        const result = await session.run(
            'MATCH (d:Director)-[:Dirige]->(s:Series) WHERE d.name = $director RETURN s',
            { director }
        );
        res.status(200).send(result.records.map(record => record.get(0).properties));
    } catch (error) {
        res.status(500).send('Internal server error');
    }
};

// generos de un director
const getGenresOfDirector = async (req, res) => {
    const { director } = req.body;
    try {
        const result = await session.run(
            'MATCH (d:Director)-[:Dirige]->(s:Series)-[:Pertenece]->(g:Genre) WHERE d.name = $director RETURN g',
            { director }
        );
        res.status(200).send(result.records.map(record => record.get(0).properties));
    } catch (error) {
        res.status(500).send('Internal server error');
    }
};

// Agregar una propiedad a el nodo usuario
const addProperty = async (req, res) => {
    const { email, value } = req.body;
    try {
        await session.run(
            'MATCH (u:Usuarios) WHERE u.email = $email SET u.descripcion = $value',
            { email, value }
        );
        res.status(200).send('Property added');
    } catch (error) {
        res.status(500).send('Internal server error');
    }
};

// Eliminar una propiedad a el nodo usuario
const deleteProperty = async (req, res) => {
    const { email } = req.body;
    try {
        await session.run(
            'MATCH (u:Usuarios) WHERE u.email = $email REMOVE u.descripcion',
            { email }
        );
        res.status(200).send('Property deleted');
    } catch (error) {
        res.status(500).send('Internal server error');
    }
};

// Actualizar la propiedad contraseña de el nodo usuario
const updatePassword = async (req, res) => {
    const { email, password } = req.body;
    try {
        await session.run(
            'MATCH (u:Usuarios) WHERE u.email = $email SET u.contraseña = $password',
            { email, password }
        );
        res.status(200).send('Password updated');
    } catch (error) {
        res.status(500).send('Internal server error');
    }
};

const deleteUsuario = async (req, res) => {
    const { email } = req.body;
    try {
        await session.run(
            'MATCH (u:Usuarios) WHERE u.email = $email DELETE u',
            { email }
        );
        res.status(200).send({message: 200});
    } catch (error) {
        res.status(500).send({message: 500});
    }
};

module.exports = {
    login,
    register,
    editDescription,
    getFavoriteSeries,
    getViewedActors,
    getViewedDirectors,
    getViewedGenres,
    getFavoritePlatforms,
    addFavoriteSeries,
    addViewedActor,
    addViewedDirector,
    addViewedGenre,
    addFavoritePlatform,
    getGenresOfSerie,
    getDirectorsOfSerie,
    getPlatformsOfSerie,
    getActorsOfSerie,
    getSeriesOfActor,
    getGenresOfActor,
    getBestSeriesOfGenre,
    getGenresOfPlatform,
    getBestSeriesOfPlatform,
    getSeriesOfDirector,
    getGenresOfDirector,
    getSeries,
    getActors,
    getDirectors,
    getGenres,
    getPlatform,
    deleteUsuario,
    deleteFavoriteSeries,
    deleteFavoriteActor,
    deleteFavoriteDirector,
    deleteFavoriteGenre,
    deleteFavoritePlatform,
    addProperty,
    deleteProperty,
    updatePassword
};
