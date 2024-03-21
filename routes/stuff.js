const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const stuffCtrl = require('../controllers/stuff');

// Ajout d'un livre
router.post('/', auth, multer, stuffCtrl.createBook);

// Récupération de tous les Livres
router.get('/', stuffCtrl.getAllBooks);

// Récupération d'un Livre Spécifique par ID
router.get('/:id', stuffCtrl.getOneBook);

// Mise à Jour d'un Livre
router.put('/:id', auth, multer, stuffCtrl.modifyBook);

// Suppression d'un Livre
router.delete('/:id', auth, stuffCtrl.deleteBook);

module.exports = router;