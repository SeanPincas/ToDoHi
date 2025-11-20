const multer = require("multer");
const path = require("path");

// --------------------------- STORAGE CONFIG ---------------------------
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/")
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname))
    }
});

// --------------------------- FILE FILTER ---------------------------
// Only allow image file only
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedTypes.test(file.mimetype);

    if (ext && mime) {
        cb(null, true);
    } else {
        cb(new Error ("Only Image files (JPG, PNG, GIF) are allowed"));
    }
}

// Only allow image file limit size to 8MB
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 8 * 1024 * 1024 } // 8mb in bytes
});

module.exports = upload;