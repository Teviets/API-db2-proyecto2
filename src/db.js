const neo4j = require('neo4j');
const config = require('./config.js');

const driver = neo4j.driver(config.URL, neo4j.auth.basic(config.user.toString(), config.password.toString()));
const session = driver.session();

module.exports = session;