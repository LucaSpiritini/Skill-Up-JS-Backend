const multer = require("multer");
const path = require("path");
const { v4: uuid } = require("uuid");

const storage = multer.diskStorage({
  destination: path.join(__dirname, "../public/uploads"),
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    if (extension !== "") cb(null, uuid() + path.extname(extension));
  },
});

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|svg|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Only Images can be uploaded");
  }
}

const upload = multer({
  storage,
  fileFilter: function (_req, file, cb) {
    checkFileType(file, cb);
  },
});

module.exports = { upload };
