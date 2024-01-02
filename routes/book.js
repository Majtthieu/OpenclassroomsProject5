const express = require('express');
const router = express.Router();

const booksCtrl = require('../controllers/book');

const auth = require('../middleware/auth');

const { upload, sharpMiddleware } = require('../middleware/multer-config');

router.get('/', booksCtrl.getAllBooks);
router.post('/', auth, upload.single('image'), sharpMiddleware, booksCtrl.createBook);
router.get('/:id', booksCtrl.getOneBook);
router.put('/:id', auth, upload.single('image'), sharpMiddleware, booksCtrl.modifyBook);
router.delete('/:id', auth, booksCtrl.deleteBook);
router.post("/:id/rating", auth, booksCtrl.rateBook);

module.exports = router;