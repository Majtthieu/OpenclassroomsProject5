const express = require('express');
const router = express.Router();

const booksCtrl = require('../controllers/book');

const auth = require('../middleware/auth');

const { upload, sharpMiddleware } = require('../middleware/multer-config');

router.get('/', auth, booksCtrl.getAllBooks);
router.post('/', auth, upload.single('image'), sharpMiddleware, booksCtrl.createBook);
router.get('/:id', auth, booksCtrl.getOneBook);
router.put('/:id', auth, upload.single('image'), sharpMiddleware, booksCtrl.modifyBook);
router.delete('/:id', auth, booksCtrl.deleteBook);

module.exports = router;