import { createRequire } from 'module';
import { storage } from '../utils/cloudinary.js';

const require = createRequire(import.meta.url);
const multer = require('multer');

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only jpg, png and webp images are allowed!'), false);
        }
    }
});

export default upload;