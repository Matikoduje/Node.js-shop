const multer = require("multer");

const fileStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "public/files/images");
  },
  filename: (req, file, callback) => {
    callback(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
    );
  },
});

const fileFilter = (req, file, callback) => {
  const validMimeTypes = ["image/png", "image/jpg", "image/jpeg"];
  let isValid = true;
  if (!validMimeTypes.includes(file.mimetype)) {
    isValid = false;
  }
  callback(null, isValid);
};

const upload = multer({ storage: fileStorage, fileFilter: fileFilter });

module.exports = {
  multer,
  upload,
};
