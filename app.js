const express = require('express');

const mongoose = require('mongoose');
const env = require('./env.json');

const app = express();

const userRoutes = require('./routes/user');
const booksRoutes = require('./routes/book');
const path = require('path');
const username = env.DB_USERNAME;
const password = env.DB_PASSWORD;

mongoose.connect(`mongodb+srv://${username}:${password}@atlascluster.flydsjo.mongodb.net/?retryWrites=true&w=majority`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});



app.use('/api/books', booksRoutes);



app.use('/api/books', booksRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;