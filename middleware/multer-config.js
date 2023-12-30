const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
// const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    filename: (req, file, callback) => {
        const extension = path.extname(file.originalname);
        const name = Date.now() + extension;
        callback(null, name);
    }
});

const upload = multer({ storage });

const sharpMiddleware = (req, res, next) => {
    if (!req.file) {
        return next(); // passage au middleware suivant si aucun fichier
    }

    const img = sharp(req.file.path);
    img
        .webp()
        .resize({
            width: 400,
            height: 600,
            fit: 'inside'
        })
        .toFile(path.join('images', req.file.filename.replace(path.extname(req.file.filename), '.webp')), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'erreur de conversion d image' });
            }

            // suppression du fichier d'origine
            // fs.unlinkSync(req.file.path);

            next();
        });
};

module.exports = { upload, sharpMiddleware };