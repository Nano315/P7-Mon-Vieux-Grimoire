const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const stuffCtrl = require('../controllers/stuff');

// Route pour ajouter une note à un livre
router.post('/:id/rating', auth, stuffCtrl.addRatingToBook);

// Ajout d'un livre
router.post('/', auth, multer, stuffCtrl.createBook);

// Récupération des 3 livres avec la meilleure note moyenne
router.get('/bestrating', stuffCtrl.getBestRatedBooks);

// Récupération d'un Livre Spécifique par ID
router.get('/:id', stuffCtrl.getOneBook);

// Récupération de tous les Livres
router.get('/', stuffCtrl.getAllBooks);

// Mise à Jour d'un Livre
router.put('/:id', auth, multer, stuffCtrl.modifyBook);

// Suppression d'un Livre
router.delete('/:id', auth, stuffCtrl.deleteBook);

module.exports = router;