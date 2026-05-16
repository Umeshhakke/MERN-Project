const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,   // 5 MB
  },
});

/**
 * Returns a middleware that handles single file upload for a given field name.
 * @param {string} fieldName - The name of the file field (e.g., 'profilePic', 'image')
 * @returns {function} Express middleware (req, res, next)
 */
const uploadSingle = (fieldName) => (req, res, next) => {
  const uploadHandler = upload.single(fieldName);

  uploadHandler(req, res, (err) => {
    if (err) {
      // Pass multer errors (file too large, invalid type, etc.) to Express error handler
      return next(err);
    }
    next();
  });
};

module.exports = { uploadSingle };