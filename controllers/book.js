const Book = require('../models/book');
const fs = require('fs');

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;

    if (!req.file) {
        return res
            .status(400)
            .json({ error });
    } else {
        const book = new Book({
            ...bookObject,
            userId: req.auth.userId,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        });

        book.save()
            .then(() => { res.status(201).json({ message: 'Livre enregistré !' }) })
            .catch(error => {
                res.status(400).json({ error });
            })
    }
};

exports.getOneBook = (req, res, next) => {
    Book.findOne({
        _id: req.params.id
    }).then(
        (book) => {
            res.status(200).json(book);
        }
    ).catch(
        (error) => {
            res.status(404).json({ error });
        }
    );
};

exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete bookObject._userId;
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(403).json({ message: 'unauthorized request' });
            } else {
                // remplacement de l'image si présence d'une nouvelle
                if (req.file) {
                    const filename = book.imageUrl.split('/images/')[1];
                    fs.unlink(`images/${filename}`, () => {
                        Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                            .then(() => res.status(200).json({ message: 'livre modifié!' }))
                            .catch(error => res.status(401).json({ error }));
                    });
                } else {
                    Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'livre modifié!' }))
                        .catch(error => res.status(401).json({ error }));
                }
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (book.userId != req.auth.userId) {
                res.status(403).json({ message: 'unauthorized request' });
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'livre supprimé !' }) })
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

exports.getAllBooks = (req, res, next) => {
    Book.find().then(
        (books) => {
            res.status(200).json(books);
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};

exports.rateBook = async (req, res, next) => {
    const bookId = req.params.id; // récupération de l'id du livre à partir des paramètres de la requête
    const userId = req.auth.userId; // récupération de l'id de l'utilisateur à partir du token
    const { rating } = req.body; // récupération de la note à partir du corps de la requête

    try {
        // vérifier si l'utilisateur a déjà noté ce livre
        const existingRating = await Book.findOne({ _id: bookId, 'ratings.userId': userId });

        if (existingRating) {
            return res.status(400).json({ error: 'L\'utilisateur a déjà noté ce livre.' });
        }

        // si l'utilisateur n'a pas encore noté le livre, ajouter la note
        const book = await Book.findByIdAndUpdate(
            bookId,
            {
                $push: { ratings: { userId, grade: rating } },
            },
            { new: true }
        );

        // mise à jour de la moyenne des notes
        const totalRatings = book.ratings.length;
        const totalGrades = book.ratings.reduce((sum, rating) => sum + rating.grade, 0);
        const averageRating = Math.round((totalGrades / totalRatings) * 10) / 10;
        book.averageRating = averageRating;

        await book.save();

        res.status(200).json(book);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Une erreur est survenue lors de l\'ajout de la note.' });
    }
};

exports.bestBooks = async (req, res, next) => {
    // rangement dans l'ordre décroissant de la moyenne des notes
    await Book.find().sort({ averageRating: -1 }).limit(3)
        .then(books => res.status(200).json(books))
        .catch(error => res.status(401).json({ error }));
}