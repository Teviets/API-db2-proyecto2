const express = require('express');
const cors = require('cors');


const config = require('./config.js');

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    cors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true
    }));

app.use(require('./routes/index'))

app.listen(config.port);

console.log('Server on Port: ', config.port);