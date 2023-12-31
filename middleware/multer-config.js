const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

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

    sharp.cache(false);
    const img = sharp(req.file.path);
    // reprise du nom d'image d'origine en appliquant la nouvelle extension
    const webpFilename = req.file.filename.replace(path.extname(req.file.filename), '.webp');

    img
        .webp({ quality: 50 })
        .resize({
            width: 400,
            height: 400,
            fit: 'inside'
        })
        .toFile(path.join('images', webpFilename), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'erreur de conversion image' });
            }

            // suppression du fichier d'origine
            fs.unlinkSync(req.file.path);

            // modification du chemin pour la nouvelle image
            req.file.filename = webpFilename;

            next();
        });
};

module.exports = { upload, sharpMiddleware };