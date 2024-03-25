const Book = require('../models/Book');
const fs = require('fs');

const sharp = require('sharp');
const path = require('path');

const uploadDir = 'images';

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;

    // Logique de compression d'image
    if (req.file) {
        const buffer = req.file.buffer;
        const originalname = req.file.originalname.split(' ').join('_');
        const extension = 'webp';
        const fileName = originalname + Date.now() + '.' + extension;

        // Utilisation de Sharp pour convertir et compresser l'image
        sharp(buffer)
            .resize(500)
            .toFormat('webp')
            .webp({ quality: 20 })
            .toBuffer()
            .then(data => {
                fs.writeFileSync(path.join(uploadDir, fileName), data);

                // Sauvegarde du livre avec l'image compressée
                const book = new Book({
                    ...bookObject,
                    userId: req.auth.userId,
                    imageUrl: `${req.protocol}://${req.get('host')}/${uploadDir}/${fileName}`
                });

                book.save()
                    .then(() => res.status(201).json({ message: 'Livre enregistré avec image optimisée !' }))
                    .catch(error => res.status(400).json({ error }));
            })
            .catch(error => res.status(500).json({ error }));
    } else {
        res.status(400).json({ message: 'Image non fournie' });
    }
};

exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
};

exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({ error }));
};

exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete bookObject._userId;
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                .then(() => res.status(200).json({ message: 'Livre modifié!' }))
                .catch(error => res.status(401).json({ error }));
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => {
            const filename = book.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Book.deleteOne({ _id: req.params.id })
                    .then(() => { res.status(200).json({ message: 'Livre supprimé !' }) })
                    .catch(error => res.status(401).json({ error }));
            });
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

exports.addRatingToBook = (req, res, next) => {
    const bookId = req.params.id;
    const userId = req.body.userId;
    const ratingToAdd = req.body.rating;

    Book.findOne({ _id: bookId })
        .then(book => {
            // Vérifie si le livre existe
            if (!book) {
                return res.status(404).json({ message: 'Livre non trouvé.' });
            }

            // Vérifie si l'utilisateur a déjà noté ce livre
            if (book.ratings.find(rating => rating.userId === userId)) {
                return res.status(400).json({ error: 'Lutilisateur a déjà noté ce livre !' });
            }

            // Ajoute la nouvelle note
            book.ratings.push({ userId, grade: ratingToAdd });

            // Calcule la nouvelle moyenne
            book.averageRating = book.ratings.reduce((acc, curr) => acc + curr.grade, 0) / book.ratings.length;

            // Sauvegarde les changements dans le livre
            return book.save();
        })
        .then(updatedBook => {
            res.status(200).json(updatedBook);
        })
        .catch(error => res.status(500).json({ error }));
};

exports.getBestRatedBooks = (req, res, next) => {
    Book.find().sort({ averageRating: -1 }).limit(3)
        .then(books => {
            res.status(200).json(books);
        })
        .catch(error => {
            res.status(400).json({ error });
        });
};